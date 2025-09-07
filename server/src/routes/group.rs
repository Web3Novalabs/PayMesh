use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use sqlx::types::BigDecimal;
use std::collections::HashMap;

use crate::{
    AppState,
    libs::error::{ApiError, map_sqlx_error},
    routes::types::{
        GetGroupDetailsRequest, GetGroupDetailsResponse, GroupMemberResponse, GroupRequest,
        GroupsResponse,GroupFullDetailResponse, GroupTokenTransfer,GroupMemberWithAddress,GroupsMetricsResponse,PaymentsTotalsResponse,
    },
    util::connector::is_valid_address,
};

pub async fn create_group(
    State(state): State<AppState>,
    Json(payload): Json<GroupRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let usage_remaining: BigDecimal = payload.usage_remaining.into();
    let group_address = &payload.group_address;
    let created_by = &payload.created_by;

    tracing::info!("Creating group: {}", group_address);
    
    let mut tx = state
        .db
        .begin()
        .await
        .map_err(|_| ApiError::Internal("Failed to begin transaction"))?;

    sqlx::query!(
        r#"INSERT INTO groups (group_address, group_name, created_by, usage_remaining) VALUES ($1, $2, $3, $4)"#,
        group_address,
        payload.group_name,
        created_by,
        usage_remaining
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

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
            .map_err(|e| map_sqlx_error(&e))?;
    }

    tx.commit()
        .await
        .map_err(|_| ApiError::Internal("Failed to commit transaction"))?;

    tracing::info!("Group created: {}", group_address);

    Ok((StatusCode::OK, Json("Group created".to_owned())))
}

pub async fn get_group(
    State(state): State<AppState>,
    Json(params): Json<GetGroupDetailsRequest>,
) -> Result<Json<GetGroupDetailsResponse>, ApiError> {
    let group_address = params.group_address;

    is_valid_address(&group_address).map_err(|_| ApiError::BadRequest("INVALID GROUP ADDRESS"))?;

    let group = sqlx::query_as!(
        GroupsResponse,
        r#"
        SELECT group_address, group_name, created_by, usage_remaining, 
        created_at::text as "created_at!", updated_at::text as "updated_at!" 
        FROM groups 
        WHERE group_address = $1
        "#,
        group_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|_| ApiError::Internal("Database Error Occurred"))?
    .ok_or(ApiError::NotFound("Group Not Found"))?;

    let members = sqlx::query_as!(
        GroupMemberResponse,
        r#"
        SELECT member_address, member_percentage, is_active, added_at::text as "added_at!"
        FROM group_members 
        WHERE group_address = $1 AND is_active = true
        ORDER BY member_percentage DESC
        "#,
        group_address
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::Internal("Database Error Occurred"))?;

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


// Get all groups metrics with token shares
pub async fn get_groups_metrics(
    State(state): State<AppState>,
) -> Result<Json<Vec<GroupsMetricsResponse>>, ApiError> {
    
    let metrics = sqlx::query!(
        r#"
        SELECT 
            g.group_address,
            MAX(CASE WHEN gth.token_symbol = 'USDC' THEN gth.amount::text END) as share_usdc,
            MAX(CASE WHEN gth.token_symbol = 'USDT' THEN gth.amount::text END) as share_usdt,
            MAX(CASE WHEN gth.token_symbol = 'ETH' THEN gth.amount::text END) as share_eth,
            MAX(CASE WHEN gth.token_symbol = 'STRK' THEN gth.amount::text END) as share_strk
        FROM groups g
        LEFT JOIN group_token_history gth ON g.group_address = gth.group_address
        GROUP BY g.group_address
        ORDER BY g.created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching group metrics: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    let response: Vec<GroupsMetricsResponse> = metrics
        .into_iter()
        .map(|row| GroupsMetricsResponse {
            group_address: row.group_address,
            share_usdc: row.share_usdc,
            share_usdt: row.share_usdt,
            share_eth: row.share_eth,
            share_strk: row.share_strk,
        })
        .collect();

    Ok(Json(response))
}


// Get all groups with full details including token transfer amount
// for admin usage
pub async fn get_groups(
    State(state): State<AppState>,
) -> Result<Json<Vec<GroupFullDetailResponse>>, ApiError> {
    
    // Get all groups
    let groups = sqlx::query_as!(
        GroupsResponse,
        r#"
        SELECT 
            group_address, 
            group_name, 
            created_by, 
            usage_remaining, 
            created_at::text as "created_at!", 
            updated_at::text as "updated_at"
        FROM groups 
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching groups: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    // Get all group members for all groups
    let all_members = sqlx::query_as!(
        GroupMemberWithAddress,
        r#"
        SELECT 
            group_address,
            member_address, 
            member_percentage, 
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
        eprintln!("Database error fetching members: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    // Get all token transfer for all groups
    let all_token_tranfer = sqlx::query_as!(
        GroupTokenTransfer,
        r#"
        SELECT 
            group_address,
            token_symbol,
            amount
        FROM group_token_history
        ORDER BY group_address
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching token balances: {}", e);
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
            token_transfer.amount.to_string()
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

    Ok(Json(response))
}


pub async fn get_payments_totals(
    State(state): State<AppState>,
) -> Result<Json<PaymentsTotalsResponse>, ApiError> {
    
    let totals = sqlx::query!(
        r#"
        SELECT 
            COUNT(DISTINCT p.group_address) as total_groups,
            COUNT(p.tx_hash) as total_payments,
            COALESCE(SUM(CASE WHEN p.token_address = '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8' THEN p.amount END), 0) as total_usdc_paid,
            COALESCE(SUM(CASE WHEN p.token_address = '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8' THEN p.amount END), 0) as total_usdt_paid,
            COALESCE(SUM(CASE WHEN p.token_address = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' THEN p.amount END), 0) as total_eth_paid,
            COALESCE(SUM(CASE WHEN p.token_address = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d' THEN p.amount END), 0) as total_strk_paid
        FROM payments p
        "#
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching payment totals: {}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    let response = PaymentsTotalsResponse {
        total_groups: totals.total_groups.unwrap_or(0),
        total_payments: totals.total_payments.unwrap_or(0),
        total_usdc_paid: totals.total_usdc_paid.unwrap_or(BigDecimal::from(0)).to_string(),
        total_usdt_paid: totals.total_usdt_paid.unwrap_or(BigDecimal::from(0)).to_string(),
        total_eth_paid: totals.total_eth_paid.unwrap_or(BigDecimal::from(0)).to_string(),
        total_strk_paid: totals.total_strk_paid.unwrap_or(BigDecimal::from(0)).to_string(),
    };

    Ok(Json(response))
}