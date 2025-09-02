use std::str::FromStr;

use crate::{
    AppState,
    libs::error::ApiError,
    routes::{
        group,
        types::{GetGroupUsageRemaining, PayGroupRequest},
    },
    util::{
        connector::{contract_address_felt, is_valid_address, signer_account},
        starknet::call_paymesh_contract_function,
        util_types::PayGroupContractDetails,
    },
};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use bigdecimal::BigDecimal;
use serde::Serialize;
use starknet::core::{
    types::{Call, Felt},
    utils::get_selector_from_name,
};

#[derive(Debug, Clone, Serialize, Default)]
struct Amount {
    amount: BigDecimal,
}

pub async fn pay_group(
    State(state): State<AppState>,
    Json(payload): Json<PayGroupRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let group_address = payload.group_address;

    let mut tx = state.db.begin().await.map_err(|e| {
        dbg!(e);
        ApiError::Internal("Failed to begin transaction")
    })?;

    let record = sqlx::query_as!(
        GetGroupUsageRemaining,
        r#"select usage_remaining from groups where group_address = $1"#,
        group_address
    )
    .fetch_optional(&mut *tx)
    .await
    .map_err(|_| ApiError::Internal("Database Error Occured"))?
    .ok_or(ApiError::NotFound("Group Not Found"))?;

    tracing::info!("calling the pay group function 2");

    if record.usage_remaining <= BigDecimal::from(0) {
        return Err(ApiError::BadRequest(
            "USAGE COUNT FOR GROUP EXHAUSTED, TOP UP GROUP!",
        ));
    }

    let address = Felt::from_hex(group_address.as_str())
        .map_err(|_| ApiError::BadRequest("TOKEN ADDRESS NOT VALID"))?;

    let paid_group_details: PayGroupContractDetails = call_paymesh_contract_function(address)
        .await
        .map_err(|_| ApiError::BadRequest("Failed to call paymesh contract"))?;

    let usage_remaining: BigDecimal = BigDecimal::from_str(&paid_group_details.usage_remaining)
        .map_err(|_| ApiError::Internal("Failed to parse usage remaining"))?;

    let token_address = paid_group_details.token_address.clone();
    tracing::info!("calling the pay group function 3");

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
    .map_err(|_| ApiError::Internal("Database Error Occured"))?
    .rows_affected();
    tracing::info!("calling the pay group function 4");

    if rows_affected == 0 {
        return Err(ApiError::BadRequest("Failed to update group usage"));
    }
    tracing::info!("calling the pay group function 5");

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
    .map_err(|_| ApiError::Internal("Database Error Occured"))?
    .unwrap_or_default();
    tracing::info!("calling the pay group function 6");

    let new_amount = previous_amount.amount + paid_group_details.amount.clone();

    tracing::info!("calling the pay group function 7");

    sqlx::query!(r#"UPDATE group_token_history SET amount = $1 WHERE group_address = $2 AND token_address = $3"#, new_amount, group_address, token_address)
        .execute(&mut *tx)
        .await
        .map_err(|_| ApiError::Internal("Database Error Occured"))?;
    tracing::info!("calling the pay group function 8");

    // insert into the group payments table
    tracing::info!("calling the pay group function 89");

    sqlx::query!(r#"INSERT INTO payments (tx_hash, group_address, sender_address, token_address, amount) VALUES ($1, $2, $3, $4, $5)"#, payload.txn, group_address, paid_group_details.senders_address, token_address, paid_group_details.amount)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            tracing::error!("Failed to execute query: {}", e);
            ApiError::Internal("Database issues")
        })?;
    tracing::info!("calling the pay group function 10");
    // store every users data
    for member in paid_group_details.group_members {
        sqlx::query!(r#"INSERT INTO distributions_history (group_address, tx_hash, member_address, token_address, token_amount) VALUES ($1, $2, $3, $4, $5)"#, paid_group_details.group_address.clone(), payload.txn, member.member_address, paid_group_details.token_address.clone(), member.amount)
            .execute(&mut *tx)
            .await
            .map_err(|e| {
                tracing::error!("this is it {}", e.to_string());
                ApiError::Internal("Database Error Occured")
            })?;
    }

    tx.commit().await.map_err(|e| {
        dbg!(e);
        ApiError::Internal("Failed to commit transaction")
    })?;

    Ok((StatusCode::OK, Json("TOKEN SPLIT SUCCESSFULLY")))
}
