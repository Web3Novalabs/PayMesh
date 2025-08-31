use axum::{
    Json,
    extract::{ State},
    http::StatusCode,
    response::IntoResponse,
};
use sqlx::types::BigDecimal;

use crate::{
    AppState,
    libs::error::{ApiError, map_sqlx_error},
    routes::types::{GetGroupDetailsRequest, GetGroupDetailsResponse, PaymeshGroup},
    util::connector::{is_valid_address},
};

pub async fn create_group(
    State(state): State<AppState>,
    Json(payload): Json<PaymeshGroup>,
) -> Result<impl IntoResponse, ApiError> {
    let query = "INSERT INTO paymesh_group (group_address, usage_remaining) VALUES ($1, $2)";
    let usage_remaining: BigDecimal = payload
        .usage_remaining
        .parse()
        .map_err(|_| ApiError::BadRequest("Invalid usage_remaining"))?;

    sqlx::query(query)
        .bind(payload.group_address)
        .bind(usage_remaining)
        .execute(&state.db)
        .await
        .map_err(|e| map_sqlx_error(&e))?;

    Ok((StatusCode::OK, Json("Group created".to_owned())))
}

pub async fn get_group(
    State(state): State<AppState>,
    Json(params): Json<GetGroupDetailsRequest>,
) -> Result<Json<GetGroupDetailsResponse>, ApiError> {
    let group_address = params.group_address;

    if !is_valid_address(group_address.as_str()) {
        return Err(ApiError::BadRequest("invalid address"));
    }

    let record = sqlx::query_as!(
        GetGroupDetailsResponse,
        r#"select * from paymesh_group where group_address = $1"#,
        group_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|_| ApiError::Internal("Database Error Occured"))?
    .ok_or(ApiError::NotFound("Group Not Found"))?;

    Ok(Json(record))
}
