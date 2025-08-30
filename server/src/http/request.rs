use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use sqlx::types::BigDecimal;
#[derive(Serialize)]
pub struct Response {
    pub message: String,
}
use crate::{
    AppState,
    util::connector::{contract_address_felt, is_valid_address, signer_account},
};
use serde::Serialize;
use starknet::{
    accounts::Account,
    core::{
        types::{Call, Felt},
        utils::get_selector_from_name,
    },
    macros::selector,
};

struct PaymeshGroup {
    pub group_address: String,
    pub usage_remaining: BigDecimal,
}

pub async fn new() -> (StatusCode, Json<&'static str>) {
    (StatusCode::OK, Json("PAYMESH IS ACTIVE"))
}

pub async fn pay(
    Json(address): Json<String>,
) -> Result<(StatusCode, Json<String>), (StatusCode, Json<Response>)> {
    let account = signer_account();
    let contract_address = contract_address_felt();
    println!("this address is: {}", contract_address);

    if !is_valid_address(address.as_str()) {
        let err = format!("INVALID ADDRESS");
        let message = Response {
            message: err.clone(),
        };
        return Err((StatusCode::BAD_GATEWAY, Json(message)));
    }

    let address = Felt::from_hex(address.as_str()).expect("TOKEN ADDRESS NOT PROVIDED");

    let pay_call = Call {
        to: contract_address,
        selector: get_selector_from_name("pay").unwrap(),
        calldata: vec![address],
    };

    let execute = account.execute_v3(vec![pay_call]).send().await;

    match execute {
        Ok(data) => {
            println!("DATA:  {:?}", data.transaction_hash);
            let msg = format!("AMOUNT SPLIT SUCCESFULLY {}", data.transaction_hash);
            Ok((StatusCode::OK, Json(msg)))
        }
        Err(data) => {
            println!("ERROR:  {}", data);
            let err = format!("unable to make request");
            let message = Response {
                message: err.clone(),
            };
            return Err((StatusCode::BAD_GATEWAY, Json(message)));
        }
    }
}

#[derive(Debug, Serialize)]
pub struct SuccessResponse {
    pub success: bool,
}

pub async fn create_group(
    State(state): State<AppState>,
    Json(payload): Json<PaymeshGroup>,
) -> Result<(StatusCode, Json<String>), (StatusCode, Json<Response>)> {
    let query = "INSERT INTO paymesh_group (group_address, usage_remaining) VALUES ($1, $2)";

    if let Err(e) = sqlx::query(query)
        .bind(payload.group_address)
        .bind(payload.usage_remaining)
        .execute(&state.pool)
        .await
    {
        let message = Response {
            message: format!("DB error: {}", e),
        };
        return Err((StatusCode::INTERNAL_SERVER_ERROR, Json(message)));
    }

    Ok((StatusCode::OK, Json("j".to_owned())))
}
