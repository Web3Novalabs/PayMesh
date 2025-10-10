use axum::{extract::{Path, State}, http::StatusCode, response::IntoResponse};

use crate::{libs::{auth::{AdminUser}, error::{map_sqlx_error, ApiError}, utopia::ADMIN_TAG}, AppState};

#[utoipa::path(
    method(post),
    path = "/set_donation_token/{token_address}",
    responses(
        (status = OK, description = "Success", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to set active token", body = ApiError),
        (status = NOT_FOUND, description = "Token not found", body = ApiError),
    ),
    tag = ADMIN_TAG,
    security(("bearer" = [])),
)]
pub async fn set_active_token(
    State(state): State<AppState>,
    Path(token_address): Path<String>,
    AdminUser(_hello): AdminUser,
) -> Result<(), ApiError> {
    let mut tx = state.db.begin().await.map_err(|e| map_sqlx_error(&e))?;
    // Set all tokens to false
    sqlx::query!("UPDATE supported_crowd_funding_tokens SET is_active = false")
        .execute(&mut *tx)
        .await
        .map_err(|e| map_sqlx_error(&e))?;

    // Set new token to true
    let updated = sqlx::query!(
        "UPDATE supported_crowd_funding_tokens SET is_active = true WHERE token_address = $1",
        token_address
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    if updated.rows_affected() == 0 {
        return Err(ApiError::NotFound("Token not found"));
    }

    tx.commit().await.map_err(|e| map_sqlx_error(&e))?;
    Ok(())
}

#[utoipa::path( 
    method(post),
    path = "/add_token/{token_address}",
    responses(
        (status = OK, description = "Success"),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Duplicate Token | Failed to add token", body = ApiError),
    ),
    tag = ADMIN_TAG,
    security(("bearer" = [])),
)]
pub async fn add_token(
    State(state): State<AppState>,
    Path(token_address): Path<String>,
    AdminUser(_hello): AdminUser,
) -> Result<StatusCode, ApiError> {
    let mut tx = state.db.begin().await.map_err(|e| map_sqlx_error(&e))?;
    sqlx::query!(
        "INSERT INTO supported_crowd_funding_tokens (token_address) VALUES ($1)",
        token_address
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;
    tx.commit().await.map_err(|e| map_sqlx_error(&e))?;
    Ok(StatusCode::OK)
}

#[utoipa::path(
    method(post),
    path = "/remove_token/{token_address}",
    responses(
        (status = OK, description = "Success"),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to remove token", body = ApiError),
    ),
    tag = ADMIN_TAG,
    security(("bearer" = [])),
)]
pub async fn remove_token(
    State(state): State<AppState>,
    Path(token_address): Path<String>,
    AdminUser(_hello): AdminUser,
) -> Result<StatusCode, ApiError> {
    let mut tx = state.db.begin().await.map_err(|e| map_sqlx_error(&e))?;
    let updated = sqlx::query!(
        "DELETE FROM supported_crowd_funding_tokens WHERE token_address = $1 AND is_active = false",
        token_address
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    if updated.rows_affected() == 0 {
        return Err(ApiError::BadRequest("Token not found or is active"));
    }

    tx.commit().await.map_err(|e| map_sqlx_error(&e))?;
    Ok(StatusCode::OK)
}

#[utoipa::path(
    method(get),
    path = "/get_active_token",
    responses(
        (status = OK, description = "Success", body = String),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to get active token", body = ApiError),
    ),
    tag = ADMIN_TAG,
    security(("bearer" = [])),
)]
pub async fn get_active_token(
    State(state): State<AppState>,
    AdminUser(_hello): AdminUser,
) -> Result<impl IntoResponse, ApiError> {
    let active_token = sqlx::query_scalar!(
        "SELECT token_address FROM supported_crowd_funding_tokens WHERE is_active = true"
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;
    Ok(active_token.unwrap_or_default())
}