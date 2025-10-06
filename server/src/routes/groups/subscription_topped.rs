use crate::{
    libs::{error::ApiError, utopia::GROUP_TAG}, routes::groups::groups_types::SubscriptionToppedReq, util::starknet::call_paymesh_contract_function, AppState
};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use bigdecimal::BigDecimal;
use starknet::core::types::Felt;


#[utoipa::path(
    method(post),
    path = "/subscription_topped",
    responses(
        (status = OK, description = "Success", body = String),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to update group usage remaining", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Request Payload", body = ApiError),
    ),
    tag = GROUP_TAG,
    security(("api_key" = [])),
    request_body = SubscriptionToppedReq,
)]
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

    let address = Felt::from_hex(group_address.as_str())
        .map_err(|_| ApiError::BadRequest("TOKEN ADDRESS NOT VALID"))?;

    // todo check contract before calling this function
    call_paymesh_contract_function(address)
        .await
        .map_err(|_| ApiError::BadRequest("Failed to call paymesh contract"))?;

    Ok((StatusCode::OK, Json("USAGE COUNT UPDATED SUCCESSFULLY")))
}
