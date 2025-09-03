use std::{ str::FromStr};

use crate::{
    libs::error::ApiError, routes::types::{CallContractRequest, GetGroupUsageRemaining, PayGroupRequest}, util::starknet::call_paymesh_contract_function, AppState
};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use bigdecimal::BigDecimal;
use serde::Serialize;
use starknet::core::types::Felt;


#[derive(Debug, Clone, Serialize, Default)]
struct Amount {
    amount: BigDecimal,
}

pub async fn pay_group(
    State(state): State<AppState>,
    Json(payload): Json<CallContractRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let group_address = payload.group_address;
    let from_address = payload.from_address;
    let tx_hash = payload.tx_hash;
    let token_amount = BigDecimal::from_str(&payload.token_amount).map_err(|e| {
        tracing::error!("Failed to parse token amount: {}", e);
        ApiError::BadRequest("Invalid token amount")
    })?;
    let token_address = payload.token_address;

    // Get the users usage remaining
    let record = sqlx::query_as!(
        GetGroupUsageRemaining,
        r#"select usage_remaining from groups where group_address = $1"#,
        group_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!(
            "Database error when fetching group usage remaining {}",
            e.to_string()
        );
        ApiError::Internal("Database Error Occured")
    })?
    .ok_or(ApiError::NotFound("Group Not Found"))?;

    // Check if the group's usage is exhausted, Return Error if it is
    if record.usage_remaining <= BigDecimal::from(0) {
        return Err(ApiError::BadRequest(
            "USAGE COUNT FOR GROUP EXHAUSTED, TOP UP GROUP!",
        ));
    }

    // Convert address to felt
    let address = Felt::from_hex(group_address.as_str())
        .map_err(|_| ApiError::BadRequest("TOKEN ADDRESS NOT VALID"))?;

    call_paymesh_contract_function(address)
        .await
        .map_err(|_| ApiError::BadRequest("Failed to call paymesh contract"))?;

    // insert the tx hash into group tx hashes table

    sqlx::query!(r#"INSERT INTO group_tx_hashes (group_address, from_address, tx_hash, token_amount, token_address) VALUES ($1, $2, $3, $4, $5)"#, 
    group_address, from_address, tx_hash, token_amount, token_address)
        .execute(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Failed to execute query: {}", e);
            ApiError::Internal("Database Error Occurred")
        })?;

    Ok((StatusCode::OK, Json("TOKEN SPLIT SUCCESSFULLY")))
}



pub async fn store_payment_distribution_history(
    State(state): State<AppState>,
    Json(payload): Json<PayGroupRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let group_address = payload.group_address;
    let usage_remaining = BigDecimal::from(payload.usage_remaining);
    let token_address = payload.token_address;
    let token_amount = BigDecimal::from_str(&payload.token_amount).map_err(|e| {
        tracing::error!("Failed to parse token amount: {}", e);
        ApiError::BadRequest("Invalid token amount")
    })?;
    let tx_hash = payload.tx_hash;
    let group_members = payload.members;

    tracing::info!("Update the payment history of group");
    let mut tx = state.db.begin().await.map_err(|e| {
        dbg!(e);
        ApiError::Internal("Failed to begin transaction")
    })?;

    let rows_affected = sqlx::query!(
        r#"
        UPDATE groups 
        SET usage_remaining = $1 
        WHERE group_address = $2
        "#,
        usage_remaining,
        group_address
    )
    .execute(&mut *tx)
    .await
    .map_err(|e|{ 
        tracing::error!("Failed to update group usage {}", e.to_string());
        ApiError::Internal("Database Error Occured")})?
    .rows_affected();
    tracing::info!("calling the pay group function 4");

    if rows_affected == 0 {
        return Err(ApiError::BadRequest("Failed to update group usage"));
    }

    let previous_amount: Amount = sqlx::query_as!(
        Amount,
        r#"
        SELECT amount FROM group_token_history WHERE group_address = $1 AND token_address = $2
        "#,
        group_address,
        token_address
    )
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e|{ 
        tracing::error!("Failed to fetch previous amount, {}", e.to_string());
        ApiError::Internal("Database Error Occured")})?
    .unwrap_or_default();

    let new_amount = previous_amount.amount + token_amount.clone();

    sqlx::query!(r#"UPDATE group_token_history SET amount = $1 WHERE group_address = $2 AND token_address = $3"#, new_amount, group_address, token_address)
        .execute(&mut *tx)
        .await
        .map_err(|e|
            { tracing::error!("Failed to update group token history, {}", e.to_string());
                ApiError::Internal("Database Error Occured")})?;

    sqlx::query!(r#"INSERT INTO payments (tx_hash, group_address, token_address, amount) VALUES ($1, $2, $3, $4)"#, 
    tx_hash, group_address, token_address, token_amount)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("Failed to execute query: {}", e);
            ApiError::Internal("Database Error Occurred")
        })?;

    for member in group_members {
        let member_amount: BigDecimal = BigDecimal::from_str(&member.member_amount).map_err(|e| {
            tracing::error!("Failed to parse token amount: {}", e);
            ApiError::BadRequest("Invalid token amount")
        })?;
        
        sqlx::query!(r#"INSERT INTO distributions_history (group_address, tx_hash, member_address, token_address, token_amount) VALUES ($1, $2, $3, $4, $5)"#,
            group_address, tx_hash, member.member_address, token_address, member_amount)
            .execute(&mut *tx)
            .await
            .map_err(|e| {
                tracing::error!("Error occurred while inserting distribution history: {}", e.to_string());
                ApiError::Internal("Database Error Occurred")
            })?;
    }

    tx.commit().await.map_err(|e| {
        dbg!(e);
        ApiError::Internal("Failed to commit transaction")
    })?;

    Ok((StatusCode::OK, Json("TOKEN SPLIT SUCCESSFULLY")))
}
