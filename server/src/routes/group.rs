use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use sqlx::types::BigDecimal;

use crate::{
    AppState,
    libs::error::{ApiError, map_sqlx_error},
    routes::types::{
        GetGroupDetailsRequest, GetGroupDetailsResponse, GroupMemberResponse, GroupRequest,
        GroupsResponse,
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
        .map_err(|e| ApiError::Internal("Failed to begin transaction"))?;

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
        .map_err(|e| ApiError::Internal("Failed to commit transaction"))?;

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
    .map_err(|e| ApiError::Internal("Database Error Occurred"))?
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
    .map_err(|e| ApiError::Internal("Database Error Occurred"))?;

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
