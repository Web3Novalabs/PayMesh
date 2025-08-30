use starknet::{ClassHash, ContractAddress};
use crate::base::crowd_fund_type::Pool;
#[starknet::interface]
pub trait ICrowdFund<TContractState> {
    fn create_pool(
        ref self: TContractState,
        name: ByteArray,
        target_amount: u256,
        beneficiary: ContractAddress,
    ) -> ContractAddress;
    fn upgrade(ref self: TContractState, new_class_hash: ClassHash);
    fn paymesh(ref self: TContractState, pool_address: ContractAddress);
    fn get_all_pools(self: @TContractState) -> Array<Pool>;
    fn get_pool(self: @TContractState, pool_id: u256) -> Pool;
    fn paymesh_donate(ref self: TContractState, pool_address: ContractAddress, amount: u256);
    //  get a specific crowd funding donation count
    fn get_donor_count(self: @TContractState, pool_id: u256) -> u256;
    fn get_pool_balance(self: @TContractState, pool_address: ContractAddress) -> u256;
    fn get_pool_target(self: @TContractState, pool_id: u256) -> u256;
    fn is_pool_completed(self: @TContractState, pool_id: u256) -> bool;
    fn set_platform_percentage(ref self: TContractState, value: u256);
    fn get_platform_percentage(self: @TContractState) -> u256;
}
