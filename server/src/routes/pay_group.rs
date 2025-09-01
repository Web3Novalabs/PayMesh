use std::str::FromStr;

use crate::{
    libs::error::ApiError, routes::{group, types::{GetGroupUsageRemaining, PayGroupRequest}}, util::{
        connector::{contract_address_felt, is_valid_address, signer_account},
        starknet::call_paymesh_contract_function,
        util_types::PayGroupContractDetails,
    }, AppState
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
    amount: BigDecimal
}

pub async fn pay_group(
    State(state): State<AppState>,
    Json(payload): Json<PayGroupRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let account = signer_account();
    let contract_address = contract_address_felt();
    let group_address = payload.group_address;

    tracing::info!("calling the pay group function");
    is_valid_address(&group_address).map_err(|_| ApiError::BadRequest("INVALID GROUP ADDRESS"))?;

    let record = sqlx::query_as!(
        GetGroupUsageRemaining,
        r#"select usage_remaining from paymesh_group where group_address = $1"#,
        group_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|_| ApiError::Internal("Database Error Occured"))?
    .ok_or(ApiError::NotFound("Group Not Found"))?;
    
    tracing::info!("calling the pay group function 2");

    if record.usage_remaining <= BigDecimal::from(0) {
        return Err(ApiError::BadRequest("USAGE COUNT FOR GROUP EXHAUSTED, TOP UP GROUP!"));
    }

    let address = Felt::from_hex(group_address.as_str())
        .map_err(|_| ApiError::BadRequest("TOKEN ADDRESS NOT VALID"))?;

    let pay_call: Call = Call {
        to: contract_address,
        selector: get_selector_from_name("paymesh").unwrap(),
        calldata: vec![address],
    };

    let paid_group_details: PayGroupContractDetails =
        call_paymesh_contract_function(account, pay_call)
            .await
            .map_err(|_| ApiError::BadRequest("Failed to call paymesh contract"))?;

    let usage_remaining: BigDecimal = BigDecimal::from_str(&paid_group_details.usage_remaining)
        .map_err(|_| ApiError::Internal("Failed to parse usage remaining"))?;

    let token_address = paid_group_details.token_address.clone();
    tracing::info!("calling the pay group function 3");

    let rows_affected = sqlx::query!(
        r#"
        UPDATE paymesh_group 
        SET usage_remaining = $1 
        WHERE group_address = $2
        "#,
        usage_remaining,
        group_address
    )
    .execute(&state.db)
    .await
    .map_err(|_| ApiError::Internal("Database Error Occured"))?
    .rows_affected();
    tracing::info!("calling the pay group function 4");

    if rows_affected != 1 {
        return Err(ApiError::BadRequest("Failed to update group usage"));
    }
    tracing::info!("calling the pay group function 5");

    let previous_amount: Amount = sqlx::query_as!(
        Amount,
        r#"
        SELECT amount FROM group_token_amounts WHERE group_address = $1 AND token_address = $2
        "#,
        group_address,
        token_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|_| ApiError::Internal("Database Error Occured"))?
    .unwrap_or_default();
    tracing::info!("calling the pay group function 6");

    let new_amount = previous_amount.amount + paid_group_details.amount.clone();

    let insert_group_payments_query = "UPDATE group_token_amounts SET amount = $1 WHERE group_address = $2 AND token_address = $3";
    tracing::info!("calling the pay group function 7");

    sqlx::query(insert_group_payments_query)
        .bind(new_amount)
        .bind(group_address.clone())
        .bind(token_address.clone())
        .execute(&state.db)
        .await
        .map_err(|_| ApiError::Internal("Database Error Occured"))?;
    tracing::info!("calling the pay group function 8");

    // insert into the group payments table
    let insert_group_payments_query = "INSERT INTO group_payments (transaction_hash, group_address, sender_address, token_address, amount) VALUES ($1, $2, $3, $4, $5)";
    tracing::info!("calling the pay group function 89");

    sqlx::query(insert_group_payments_query)
        .bind(payload.txn)
        .bind(group_address)
        .bind(paid_group_details.senders_address)
        .bind(token_address)
        .bind(paid_group_details.amount)
        .execute(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Failed to execute query: {}", e);
            ApiError::Internal("Database issues")
        })?;
    tracing::info!("calling the pay group function 10");
    // store every users data 
    for member in paid_group_details.group_members {
        let insert_member_payment_query = "INSERT INTO payment_distributions (member_address, group_address, token_address, token_amount) VALUES ($1, $2, $3, $4)";

        sqlx::query(insert_member_payment_query)
            .bind(member.member_address)
            .bind(paid_group_details.group_address.clone())
            .bind(paid_group_details.token_address.clone())
            .bind(member.amount)
            .execute(&state.db)
            .await
            .map_err(|e| { 
                tracing::error!("this is it {}", e.to_string());
                ApiError::Internal("Database Error Occured")
            })?;
    }
    Ok((StatusCode::OK, Json("TOKEN SPLIT SUCCESSFULLY")))
}
