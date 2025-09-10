use axum::Json;
use serde_json::{Value, json};

use crate::libs::error::ApiError;

pub async fn health_check() -> Result<Json<Value>, ApiError> {
    tracing::info!("Health check");
    Ok(Json(json!({"status":"ok"})))
}
