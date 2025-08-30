use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address};
use crate::base::crowd_fund_type::Pool;
#[starknet::interface]
pub trait ICrowdFundChild<TContractState> {
    fn get_details_of_child(
        self: @TContractState,
    ) -> (u256, Pool, u256, u64); // id, beneficiary address, target , balance, created_at
    fn emergency_withdraw(ref self: TContractState);
    fn set_and_approve_main_contract(
        ref self: TContractState, main_contract_address: ContractAddress,
    );
    fn get_main_contract_address(self: @TContractState) -> ContractAddress;
}
#[starknet::contract]
pub mod CrowdFundChild {
    use core::num::traits::Zero;
    use super::{*, StoragePointerReadAccess};

    #[storage]
    struct Storage {
        id: u256,
        pool_data: Pool,
        emergency_withdraw_address: ContractAddress,
        created_at: u64,
        token_address: ContractAddress,
        admin: ContractAddress,
        main_contract_address: ContractAddress,
    }

    #[constructor]
    pub fn constructor(
        ref self: ContractState,
        group_id: u256,
        pool: Pool,
        emergency_withdraw_address: ContractAddress,
        token_address: ContractAddress,
        admin: ContractAddress,
    ) {
        self.id.write(group_id);
        self.pool_data.write(pool);
        self.emergency_withdraw_address.write(emergency_withdraw_address);
        self.created_at.write(get_block_timestamp());
        self.token_address.write(token_address);
        self.admin.write(admin);
    }

    const MAIN_AMOUNT: u256 = 900_000_000_000_000_000_000_000_000_000_000;

    #[abi(embed_v0)]
    impl CrowdFundChildImpl of ICrowdFundChild<ContractState> {
        fn get_details_of_child(self: @ContractState) -> (u256, Pool, u256, u64) {
            let contract_address = get_contract_address();

            let id = self.id.read();

            let created_at = self.created_at.read();

            let balance = self._check_token_balance(contract_address);
            let pool: Pool = self.pool_data.read();
            return (id, pool, balance, created_at);
        }

        fn emergency_withdraw(ref self: ContractState) {
            self.assert_only_admin();
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let balance = self._check_token_balance(get_contract_address());
            token.transfer(self.emergency_withdraw_address.read(), balance);
        }

        fn set_and_approve_main_contract(
            ref self: ContractState, main_contract_address: ContractAddress,
        ) {
            assert(self.main_contract_address.read().is_zero(), 'Main contract already set');
            self.main_contract_address.write(main_contract_address);
            self._approve_main_contract();
        }

        fn get_main_contract_address(self: @ContractState) -> ContractAddress {
            self.main_contract_address.read()
        }
    }

    #[generate_trait]
    impl SecurityImpl of SecurityTrait {
        fn assert_only_admin(self: @ContractState) {
            let caller = get_caller_address();
            assert(self.admin.read() == caller, 'Only admin allowed');
        }

        fn assert_main_contract_set(self: @ContractState) {
            assert(self.main_contract_address.read().is_non_zero(), 'Main contract not set');
        }
    }

    #[generate_trait]
    impl internal of InternalTrait {
        fn _check_token_balance(self: @ContractState, caller: ContractAddress) -> u256 {
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let balance = token.balance_of(caller);
            balance
        }

        fn _approve_main_contract(ref self: ContractState) {
            self.assert_main_contract_set();
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            token.approve(self.main_contract_address.read(), MAIN_AMOUNT);
        }
    }
}
