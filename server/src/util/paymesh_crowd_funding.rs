use starknet::{
    accounts::Account,
    core::{
        types::{Call, Felt},
        utils::get_selector_from_name,
    },
};

use crate::{libs::error::ApiError, util::connector::signer_account};

pub async fn paymesh_crowd_funding(
    crowd_funding_address: String,
    crowd_funding_contract_address: String,
) -> Result<(), ApiError> {
    let contract_address = Felt::from_hex(&crowd_funding_contract_address).unwrap();
    let crowd_funding_address = Felt::from_hex(&crowd_funding_address).unwrap();
    let account = signer_account();

    let pay_call = Call {
        to: contract_address,
        selector: get_selector_from_name("paymesh").unwrap(),
        calldata: vec![crowd_funding_address],
    };

    let execute = account.execute_v3(vec![pay_call]).send().await;

    match execute {
        Ok(data) => {
            tracing::info!(
                "Transaction successful with hash: {}",
                data.transaction_hash
            );
            Ok(())
        }
        Err(data) => {
            let message = format!("Error calling paymesh contract function: {:?}", data);
            tracing::error!(message);
            return Err(ApiError::Internal(
                "Error calling paymesh contract function",
            ));
        }
    }
}
