use starknet::{ClassHash, ContractAddress};
use crate::base::types::{Group, GroupMember};
#[starknet::interface]
pub trait IAutoShare<TContractState> {
    fn create_group(
        ref self: TContractState, name: ByteArray, members: Array<GroupMember>, usage_count: u256,
    ) -> ContractAddress;

    fn get_group(self: @TContractState, group_id: u256) -> Group;
    fn get_group_address(self: @TContractState, group_id: u256) -> ContractAddress;
    fn get_all_groups(self: @TContractState) -> Array<Group>;
    fn get_groups_by_usage_limit_reached(
        self: @TContractState, usage_limit_reached: bool,
    ) -> Array<Group>;
    // returns an array of groups created by address
    fn get_groups_created_by_address(
        self: @TContractState, address: ContractAddress,
    ) -> Array<Group>;
    fn get_group_member(self: @TContractState, group_id: u256) -> Array<GroupMember>;
    // renews a subscription fo a group
    fn top_subscription(ref self: TContractState, group_id: u256, new_planned_usage_count: u256);
    // gets contract usage fee +
    fn get_group_usage_fee(self: @TContractState) -> u256;
    // set contract usage fee +
    fn set_group_usage_fee(ref self: TContractState, group_usage_fee: u256);
    // get contract update fee
    fn get_group_update_fee(self: @TContractState) -> u256;
    // set contract update fee
    fn set_group_update_fee(ref self: TContractState, group_update_fee: u256);
    // gets the subscription history for a group
    fn get_group_usage_paid_history(self: @TContractState, group_id: u256) -> Array<u256>;
    //get how much the group subscribed +
    fn get_group_usage_paid(self: @TContractState, group_id: u256) -> u256;
    // gets a group current usage count +
    fn get_group_usage_count(self: @TContractState, group_id: u256) -> u256;
    // gets the amount to be paid based on the usage count
    // fn get_group_usage_amount(self: @TContractState, usage_count: u256) -> u256;
    // return the list of groups that a address is part of
    fn group_address_has_shares_in(self: @TContractState, address: ContractAddress) -> Array<Group>;
    fn set_supported_token(ref self: TContractState, new_token_address: ContractAddress);
    fn get_supported_token(self: @TContractState) -> Array<ContractAddress>;
    // Upgradeability
    /// @notice Upgrades the contract implementation.
    /// @param new_class_hash The class hash of the new implementation.
    /// @dev Can only be called by admin when contract is not paused.
    fn upgrade(ref self: TContractState, new_class_hash: ClassHash);

    fn paymesh(ref self: TContractState, group_address: ContractAddress);
    fn get_group_balance(self: @TContractState, group_address: ContractAddress) -> u256;

    fn request_group_update(
        ref self: TContractState,
        group_id: u256,
        new_name: ByteArray,
        new_members: Array<GroupMember>,
    );
    // fn approve_group_update(ref self: TContractState, group_id: u256);
    // // fn reject_group_update(ref self: TContractState, group_id: u256);
    // fn execute_group_update(ref self: TContractState, group_id: u256);
    fn withdraw(ref self: TContractState);
    // fn get_group_update_requests(self: @TContractState) -> Array<GroupUpdateRequest>;
// fn get_group_update_request(self: @TContractState, group_id: u256) -> GroupUpdateRequest;
}
