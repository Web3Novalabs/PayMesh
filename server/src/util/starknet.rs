use starknet::{
    accounts::{Account, SingleOwnerAccount},
    core::types::Call,
    providers::{JsonRpcClient, jsonrpc::HttpTransport},
    signers::LocalWallet,
};

use crate::util::util_types::PayGroupContractDetails;

pub async fn call_paymesh_contract_function(
    account: SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet>,
    pay_call: Call,
) -> Result<PayGroupContractDetails, &'static str> {
    let execute = account.execute_v3(vec![pay_call]).send().await;

    match execute {
        Ok(data) => {
            println!("DATA:  {:?}", data.transaction_hash);
            let msg = format!("AMOUNT SPLIT SUCCESFULLY {}", data.transaction_hash);
        }
        Err(data) => {
            println!("ERROR:  {:?}", data);
        }
    }

    todo!()
}
