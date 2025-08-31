use crate::{
    libs::error::ApiError,
    util::connector::{contract_address_felt, is_valid_address, signer_account},
};
use axum::{Json, http::StatusCode, response::IntoResponse};
use starknet::{
    accounts::Account,
    core::{
        types::{Call, Felt},
        utils::get_selector_from_name,
    },
};

pub async fn pay_group(Json(address): Json<String>) -> Result<impl IntoResponse, ApiError> {
    let account = signer_account();
    let contract_address = contract_address_felt();
    println!("this address is: {}", contract_address);

    if !is_valid_address(address.as_str()) {
        return Err(ApiError::BadRequest("invalid address"));
    }

    let address = Felt::from_hex(address.as_str()).expect("TOKEN ADDRESS NOT PROVIDED");

    let pay_call = Call {
        to: contract_address,
        selector: get_selector_from_name("paymesh").unwrap(),
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
            println!("ERROR:  {:?}", data);
            return Err(ApiError::BadRequest("unable to make request"));
        }
    }
}
