use bigdecimal::BigDecimal;
use starknet::{
    accounts::{Account, SingleOwnerAccount},
    core::types::{Call, Felt},
    providers::{JsonRpcClient, jsonrpc::HttpTransport},
    signers::LocalWallet,
};

use crate::util::util_types::{GroupMember, PayGroupContractDetails};

pub async fn call_paymesh_contract_function(
    group_address: Felt,
) -> Result<PayGroupContractDetails, &'static str> {
    Ok(PayGroupContractDetails {
        transaction_hash: "214223".to_string(),
        group_address: "0x04f41EEf3F8691F20a86A414b5670862a8c470ECE32d018e5c2fb1038F1bF836"
            .to_string(),
        token_address: "12345678".to_string(),
        amount: BigDecimal::from(0),
        senders_address: "0x07f41EEB3F8691F20a86A414b5670862a8c470ECE32d018e5c2fb1038F1bF836"
            .to_string(),
        group_members: vec![
            GroupMember {
                member_address: "12345678".to_string(),
                amount: BigDecimal::from(0),
            },
            GroupMember {
                member_address: "12345678".to_string(),
                amount: BigDecimal::from(12345678),
            },
        ],
        usage_remaining: "2".to_string(),
    })
}
