use starknet::{
    accounts::Account,
    core::{
        types::{Call, Felt},
        utils::get_selector_from_name,
    },
};

use crate::util::connector::{contract_address_felt, signer_account};

pub async fn call_paymesh_contract_function(group_address: Felt) -> Result<(), String> {
    let contract_address = contract_address_felt();
    let account = signer_account();

    let pay_call = Call {
        to: contract_address,
        selector: get_selector_from_name("paymesh").unwrap(),
        calldata: vec![group_address],
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
            return Err(message);
        }
    }
}
