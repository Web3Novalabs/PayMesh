use crate::{AppState, libs::error::ApiError, routes::types::SubscriptionToppedReq};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use bigdecimal::BigDecimal;

pub async fn subscription_topped(
    State(state): State<AppState>,
    Json(payload): Json<SubscriptionToppedReq>,
) -> Result<impl IntoResponse, ApiError> {
    let group_address = payload.group_address;
    let usage_count = BigDecimal::from(payload.usage_count);

    sqlx::query!(
        r#"UPDATE groups 
        SET usage_remaining = $1 
        WHERE group_address = $2"#,
        usage_count,
        group_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!(
            "Database error when updating group usage remaining {}",
            e.to_string()
        );
        ApiError::Internal("Database Error Occured")
    })?;

    tracing::info!("Group topped up {}", group_address);

    Ok((StatusCode::OK, Json("USAGE COUNT UPDATED SUCCESSFULLY")))
}
