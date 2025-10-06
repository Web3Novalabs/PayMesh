use axum::Json;
use serde_json::{Value, json};

use crate::libs::error::ApiError;

#[utoipa::path(
    method(get),
    path = "/health",
    responses(
        (status = OK, description = "Success", body = serde_json::Value)
    )
)]
pub async fn health_check() -> Result<Json<Value>, ApiError> {
    tracing::info!("Health check");
    Ok(Json(json!({"status":"ok"})))
}
