use starknet::ContractAddress;

#[derive(Serde, Drop, Debug, Clone, starknet::Store, PartialEq)]
pub struct Pool {
    pub id: u256,
    pub name: ByteArray,
    pub target: u256,
    pub creator: ContractAddress,
    pub create_at: u64,
    pub balance: u256,
    pub beneficiary: ContractAddress,
    pub donors: u256,
    pub pool_address: ContractAddress,
    pub is_complete: bool,
}
