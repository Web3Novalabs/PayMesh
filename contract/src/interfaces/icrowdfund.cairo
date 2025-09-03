use starknet::{ClassHash, ContractAddress};
use crate::base::crowd_fund_type::Pool;
#[starknet::interface]
pub trait ICrowdFund<TContractState> {
    // create a pool with a name, target amount and beneficiary
    fn create_pool(
        ref self: TContractState,
        name: ByteArray,
        target_amount: u256,
        beneficiary: ContractAddress,
    ) -> ContractAddress;
    // upgrade the contract
    fn upgrade(ref self: TContractState, new_class_hash: ClassHash);
    // paymesh to a pool beneficiary
    fn paymesh(ref self: TContractState, pool_address: ContractAddress);
    // get all pools created
    fn get_all_pools(self: @TContractState) -> Array<Pool>;
    // get a specific pool by pool id
    fn get_pool(self: @TContractState, pool_id: u256) -> Pool;
    // paymesh to a pool beneficiary and donate to a pool
    fn paymesh_donate(ref self: TContractState, pool_address: ContractAddress, amount: u256);
    //  get a specific crowd funding donation count
    fn get_donor_count(self: @TContractState, pool_id: u256) -> u256;
    // get a pool balance by pool address
    fn get_pool_balance(self: @TContractState, pool_address: ContractAddress) -> u256;
    // get a pool target by pool id
    fn get_pool_target(self: @TContractState, pool_id: u256) -> u256;
    // check if a pool is completed by pool id
    fn is_pool_completed(self: @TContractState, pool_id: u256) -> bool;
    // set the platform percentage
    fn set_platform_percentage(ref self: TContractState, value: u256);
    // get the platform percentage
    fn get_platform_percentage(self: @TContractState) -> u256;
}
