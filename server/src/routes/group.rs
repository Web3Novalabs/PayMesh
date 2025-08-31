use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use sqlx::types::BigDecimal;

use crate::{
    AppState,
    libs::error::{ApiError, map_sqlx_error},
    routes::types::PaymeshGroup,
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
