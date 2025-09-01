use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use sqlx::types::BigDecimal;

use crate::{
    AppState,
    libs::error::{ApiError, map_sqlx_error},
    routes::types::{
        GetGroupDetailsRequest, GetGroupDetailsResponse, GroupMemberResponse, PaymeshGroup,
        PaymeshGroupResponse,
    },
    util::connector::is_valid_address,
};

pub async fn create_group(
    State(state): State<AppState>,
    Json(payload): Json<PaymeshGroup>,
) -> Result<impl IntoResponse, ApiError> {
    let usage_remaining: BigDecimal = payload
        .usage_remaining
        .parse()
        .map_err(|_| ApiError::BadRequest("Invalid usage_remaining"))?;

    let group_address = &payload.group_address;
    let creator_address = &payload.creator_address;

    is_valid_address(group_address).map_err(|_| ApiError::BadRequest("INVALID GROUP ADDRESS"))?;
    is_valid_address(creator_address)
        .map_err(|_| ApiError::BadRequest("INVALID CREATOR ADDRESS"))?;

    let payment_group_query = "INSERT INTO paymesh_group (group_address, group_name, creator_address, usage_remaining) VALUES ($1, $2, $3, $4)";
    // create the group
    sqlx::query(payment_group_query)
        .bind(group_address)
        .bind(payload.group_name)
        .bind(creator_address)
        .bind(usage_remaining)
        .execute(&state.db)
        .await
        .map_err(|e| map_sqlx_error(&e))?;

    let group_payment_members_query = "INSERT INTO group_payment_members (group_address, member_address, member_percentage) VALUES ($1, $2, $3)";
    for group_member in payload.members {
        is_valid_address(&group_member.member_address)
            .map_err(|_| ApiError::BadRequest("INVALID GROUP MEMBER ADDRESS"))?;
        let member_percentage: BigDecimal = group_member
            .member_percentage
            .parse()
            .map_err(|_| ApiError::BadRequest("INVALID MEMBER PERCENTAGE"))?;
        // adds all members
        sqlx::query(group_payment_members_query)
            .bind(group_address)
            .bind(group_member.member_address)
            .bind(member_percentage)
            .execute(&state.db)
            .await
            .map_err(|e| map_sqlx_error(&e))?;
    }

    // starts tracking the three tokens ie: usdt eth strk
    Ok((StatusCode::OK, Json("Group created".to_owned())))
}

pub async fn get_group(
    State(state): State<AppState>,
    Json(params): Json<GetGroupDetailsRequest>,
) -> Result<Json<GetGroupDetailsResponse>, ApiError> {
    let group_address = params.group_address;

    is_valid_address(&group_address).map_err(|_| ApiError::BadRequest("INVALID GROUP ADDRESS"))?;

    let group = sqlx::query_as!(
        PaymeshGroupResponse,
        r#"
        SELECT group_address, group_name, creator_address, usage_remaining, 
        created_at::text as "created_at!", updated_at::text as "updated_at!" 
        FROM paymesh_group 
        WHERE group_address = $1
        "#,
        group_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        ApiError::Internal("Database Error Occurred")
    })?
    .ok_or(ApiError::NotFound("Group Not Found"))?;

    let members = sqlx::query_as!(
        GroupMemberResponse,
        r#"
        SELECT member_address, member_percentage, is_active, added_at::text as "added_at!"
        FROM group_payment_members 
        WHERE group_address = $1 AND is_active = true
        ORDER BY member_percentage DESC
        "#,
        group_address
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Database error: {:?}", e);
        ApiError::Internal("Database Error Occurred")
    })?;

    Ok(Json(GetGroupDetailsResponse {
        group_address: group.group_address,
        group_name: group.group_name,
        creator_address: group.creator_address,
        usage_remaining: group.usage_remaining,
        created_at: group.created_at,
        updated_at: group.updated_at,
        members,
    }))
}
