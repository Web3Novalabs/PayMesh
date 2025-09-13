use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use starknet::storage::{
    Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
    StoragePointerWriteAccess,
};
use starknet::{
    ContractAddress, contract_address_const, get_block_timestamp, get_caller_address,
    get_contract_address,
};
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
    fn set_supported_token(ref self: TContractState, new_token_address: ContractAddress);
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
        supported_tokens: Map<u256, ContractAddress>, // id -> token address
        token_count: u256,
        creator_address: ContractAddress,
    }

    #[constructor]
    pub fn constructor(
        ref self: ContractState,
        pool_id: u256,
        pool: Pool,
        emergency_withdraw_address: ContractAddress,
        token_address: ContractAddress,
        admin: ContractAddress,
        creator_address: ContractAddress,
    ) {
        self.id.write(pool_id);
        self.pool_data.write(pool);
        self.emergency_withdraw_address.write(emergency_withdraw_address);
        self.created_at.write(get_block_timestamp());
        self.admin.write(admin);
        self.creator_address.write(creator_address);
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
            let supported_tokens_count = self.token_count.read();
            for i in 1..=supported_tokens_count {
                let token_address: ContractAddress = self.supported_tokens.read(i);
                let token = IERC20Dispatcher { contract_address: token_address };
                let balance = token.balance_of(get_caller_address());
                token.transfer(self.emergency_withdraw_address.read(), balance);
            }
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

        fn set_supported_token(ref self: ContractState, new_token_address: ContractAddress) {
            let caller = get_caller_address();
            let is_authorized = caller == self.main_contract_address.read()
                || caller == self.creator_address.read();
            assert(is_authorized, 'Unauthorized caller');
            assert(new_token_address != contract_address_const::<0>(), 'Invalid token address');

            let id = self.token_count.read() + 1;
            self.token_count.write(id);
            self.supported_tokens.write(id, new_token_address);
            self._approve_main_contract();
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
            let supported_tokens_count = self.token_count.read();
            for i in 1..=supported_tokens_count {
                let token_address: ContractAddress = self.supported_tokens.read(i);
                let token = IERC20Dispatcher { contract_address: token_address };
                token.approve(self.main_contract_address.read(), MAIN_AMOUNT);
            }
        }
    }
}
