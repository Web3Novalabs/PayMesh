use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use sqlx::types::BigDecimal;
use std::collections::HashMap;
use tokio::sync::RwLockReadGuard;

use crate::{
    AppState,
    libs::{
        auth::AuthApiKey,
        error::{ApiError, map_sqlx_error},
        utopia::GROUP_TAG,
    },
    routes::groups::groups_types::{
        GetGroupDetailsResponse, GroupFullDetailResponse, GroupMemberResponse,
        GroupMemberWithAddress, GroupRequest, GroupTokenTransfer, GroupsResponse,
    },
    util::validate_address::validate_address_api_err,
};

#[utoipa::path(
    method(post),
    path = "",
    responses(
        (status = CREATED, description = "Success"),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to create group", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Request Payload", body = ApiError),
        (status = CONFLICT, description = "Duplicate Group", body = ApiError),
    ),
    tag = GROUP_TAG,
    security(("api_key" = [])),
    request_body = GroupRequest,
)]
pub async fn create_group(
    State(state): State<AppState>,
    AuthApiKey(_hello): AuthApiKey,
    Json(payload): Json<GroupRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let usage_remaining: BigDecimal = payload.usage_remaining.into();
    let group_address = &payload.group_address;
    let created_by = &payload.created_by;

    tracing::info!("Creating group: {}", group_address);

    let mut tx = state.db.begin().await.map_err(|e| {
        tracing::error!("Failed to begin transaction: {}", e);
        ApiError::Internal("Failed to begin transaction")
    })?;

    sqlx::query!(
        r#"INSERT INTO groups (group_address, group_name, created_by, usage_remaining) VALUES ($1, $2, $3, $4)"#,
        group_address,
        payload.group_name,
        created_by,
        usage_remaining
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create group: {}", e);
        map_sqlx_error(&e)
    })?;

    {
        let mut cache = state.cache.write().await;
        cache.insert(group_address.to_string());
    }

    for group_member in payload.members {
        let member_percentage: BigDecimal = group_member.percentage.into();
        sqlx::query!(
            r#"INSERT INTO group_members (group_address, member_address, member_percentage) VALUES ($1, $2, $3)"#,
            group_address,
            group_member.addr,
            member_percentage
        )
        .execute(&mut *tx)
        .await
            .map_err(|e| {
                tracing::error!("Failed to create group member: {}", e);
                map_sqlx_error(&e)
            })?;
    }

    tx.commit().await.map_err(|e| {
        tracing::error!("Failed to commit transaction: {}", e);
        ApiError::Internal("Failed to commit transaction")
    })?;

    Ok(StatusCode::CREATED)
}

#[utoipa::path(
    method(get),
    path = "/{group_address}",
    responses(
        (status = OK, description = "Success", body = GetGroupDetailsResponse),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to fetch group details", body = ApiError),
        (status = NOT_FOUND, description = "Group Not Found", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Group Address", body = ApiError),
    ),
    tag = GROUP_TAG,
)]
pub async fn get_group(
    State(state): State<AppState>,
    Path(group_address): Path<String>,
) -> Result<Json<GetGroupDetailsResponse>, ApiError> {
    validate_address_api_err(&group_address)?;
    let group_address = group_address;

    let group = sqlx::query_as!(
        GroupsResponse,
        r#"
        SELECT group_address, group_name, created_by, usage_remaining::text as "usage_remaining!", 
        created_at::text as "created_at!", updated_at::text as "updated_at!" 
        FROM groups 
        WHERE group_address = $1
        "#,
        group_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching group: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?
    .ok_or(ApiError::NotFound("Group Not Found"))?;

    let members = sqlx::query_as!(
        GroupMemberResponse,
        r#"
        SELECT member_address, member_percentage::text as "member_percentage!", is_active, added_at::text as "added_at!"
        FROM group_members 
        WHERE group_address = $1 AND is_active = true
        ORDER BY member_percentage DESC
        "#,
        group_address
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching group members: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    Ok(Json(GetGroupDetailsResponse {
        group_address: group.group_address,
        group_name: group.group_name,
        created_by: group.created_by,
        usage_remaining: group.usage_remaining,
        created_at: group.created_at,
        updated_at: group.updated_at,
        members,
    }))
}

#[utoipa::path(
    method(get),
    path = "/",
    responses(
        (status = OK, description = "Success", body = Vec<GroupFullDetailResponse>),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to fetch groups", body = ApiError),
    ),
    tag = GROUP_TAG,
)]
pub async fn get_groups(State(state): State<AppState>) -> Result<impl IntoResponse, ApiError> {
    // Get all groups
    let groups = sqlx::query_as!(
        GroupsResponse,
        r#"
        SELECT 
            group_address, 
            group_name, 
            created_by, 
            usage_remaining::text as "usage_remaining!", 
            created_at::text as "created_at!", 
            updated_at::text as "updated_at"
        FROM groups 
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching groups: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    // Get all group members for all groups
    let all_members = sqlx::query_as!(
        GroupMemberWithAddress,
        r#"
        SELECT 
            group_address,
            member_address, 
            member_percentage::text as "member_percentage!", 
            is_active, 
            added_at::text as "added_at!"
        FROM group_members 
        WHERE is_active = true
        ORDER BY group_address, member_percentage DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching members: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    // Get all token transfer for all groups
    let all_token_tranfer = sqlx::query_as!(
        GroupTokenTransfer,
        r#"
        SELECT 
            group_address,
            token_symbol,
            amount::text as "amount!"
        FROM group_token_history
        ORDER BY group_address
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching token balances: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    // map group members by group_address
    let mut members_by_group: HashMap<String, Vec<GroupMemberResponse>> = HashMap::new();
    for member in all_members {
        let group_address = member.group_address.clone();
        members_by_group
            .entry(group_address)
            .or_insert_with(Vec::new)
            .push(GroupMemberResponse {
                member_address: member.member_address,
                member_percentage: member.member_percentage,
                is_active: member.is_active,
                added_at: member.added_at,
            });
    }

    // map group token transfer by group_address
    let mut tokens_by_group: HashMap<String, HashMap<String, String>> = HashMap::new();
    for token_transfer in all_token_tranfer {
        let group_tokens = tokens_by_group
            .entry(token_transfer.group_address.clone())
            .or_insert_with(HashMap::new);

        group_tokens.insert(
            token_transfer.token_symbol.to_uppercase(),
            token_transfer.amount.to_string(),
        );
    }

    // the funtion response collection / vec
    let mut response: Vec<GroupFullDetailResponse> = Vec::new();

    for group in groups {
        let group_address = group.group_address.clone();

        // get members for this group
        let members = members_by_group
            .get(&group_address)
            .cloned()
            .unwrap_or_default();

        // get token balances for this group
        let token_balances = tokens_by_group
            .get(&group_address)
            .cloned()
            .unwrap_or_default();

        // Create GetGroupDetailsResponse
        let group_details = GetGroupDetailsResponse {
            group_address: group.group_address,
            group_name: group.group_name,
            created_by: group.created_by,
            usage_remaining: group.usage_remaining,
            created_at: group.created_at,
            updated_at: group.updated_at,
            members,
        };

        // Create GroupFullDetailResponse with token balances
        let full_response = GroupFullDetailResponse {
            group_data: group_details,
            share_usdc: token_balances.get("USDC").cloned(),
            share_usdt: token_balances.get("USDT").cloned(),
            share_eth: token_balances.get("ETH").cloned(),
            share_strk: token_balances.get("STRK").cloned(),
        };

        response.push(full_response);
    }

    Ok((StatusCode::OK, Json(response)))
}

#[utoipa::path(
    method(get),
    path = "/addresses",
    responses(
        (status = OK, description = "Success", body = Vec<String>),
    ),
    tag = GROUP_TAG,
)]
pub async fn get_all_group_addresses(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    let cache = RwLockReadGuard::map(state.cache.read().await, |f| f).clone();
    let vec_cache: Vec<String> = cache.into_iter().collect();

    Ok((StatusCode::OK, Json(vec_cache)))
}
