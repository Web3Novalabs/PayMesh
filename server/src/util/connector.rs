use std::{env::var, sync::LazyLock};

use starknet::{
    accounts::{ExecutionEncoding, SingleOwnerAccount},
    core::{chain_id, types::Felt},
    providers::{
        Url,
        jsonrpc::{HttpTransport, JsonRpcClient},
    },
    signers::{LocalWallet, SigningKey},
};

pub const ADDRESS_PREFIX: &str = "0x";
pub const ADDRESS_LENGTH: usize = 66;

/// Returns true if the wallet address is valid.
pub fn is_valid_address(address: &str) -> Result<(), String> {
    (address.starts_with(ADDRESS_PREFIX)
        && address.len() == ADDRESS_LENGTH
        && address[2..].chars().all(|c| c.is_ascii_hexdigit()))
    .then_some(())
    .ok_or("invalid address format".to_owned())
}

static RPC_URL: LazyLock<String> = LazyLock::new(|| var("RPC_URL").expect("RPC URL NOT PROVIDED"));
static CONTRACT_ADDRESS: LazyLock<String> =
    LazyLock::new(|| var("CONTRACT_ADDRESS").expect("CONTRACT ADDRESS NOT PROVIDED"));

fn rpc_provider() -> JsonRpcClient<HttpTransport> {
    JsonRpcClient::new(HttpTransport::new(Url::parse(&RPC_URL).unwrap()))
}

pub fn contract_address_felt() -> Felt {
    Felt::from_hex(&CONTRACT_ADDRESS).unwrap()
}

pub fn signer_account() -> SingleOwnerAccount<JsonRpcClient<HttpTransport>, LocalWallet> {
    let provider = rpc_provider();
    let private_key = var("PRIVATE_KEY").unwrap();
    let public_key = var("PUBLIC_KEY").unwrap();

    let signer = LocalWallet::from(SigningKey::from_secret_scalar(
        Felt::from_hex(&private_key).unwrap(),
    ));
    let address = Felt::from_hex(&public_key).unwrap();
    SingleOwnerAccount::new(
        provider,
        signer,
        address,
        chain_id::SEPOLIA,
        ExecutionEncoding::New,
    )
}
