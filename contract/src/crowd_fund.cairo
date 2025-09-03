#[starknet::contract]
pub mod CrowdFund {
    use core::array::ArrayTrait;
    use core::byte_array::ByteArray;
    use core::num::traits::Zero;
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::introspection::src5::SRC5Component;

    // oz import
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use openzeppelin::upgrades::UpgradeableComponent;

    const ADMIN_ROLE: felt252 = selector!("ADMIN");
    const OVERALL_ADMIN_ROLE: felt252 = selector!("OVERALL_ADMIN_ROLE");
    use starknet::storage::{
        Map, MutableVecTrait, StorageMapReadAccess, StorageMapWriteAccess, StoragePathEntry,
        StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait,
    };
    use starknet::syscalls::deploy_syscall;
    use starknet::{
        ClassHash, ContractAddress, contract_address_const, get_block_timestamp, get_caller_address,
        get_contract_address,
    };
    use crate::base::crowd_fund_type::Pool;
    use crate::base::events::{PoolCreated, PoolPaid};
    use crate::crowd_fund_child::{
        ICrowdFundChild, ICrowdFundChildDispatcher, ICrowdFundChildDispatcherTrait,
    };
    use crate::interfaces::icrowdfund::ICrowdFund;
    // const ONE_STRK: u256 = 1_000_000_000_000_000_000;

    // components definition
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // components impl
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl InternalImpl = OwnableComponent::InternalImpl<ContractState>;
    // AccessControl
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    // SRC5
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;


    #[storage]
    pub struct Storage {
        pools: Map<u256, Pool>,
        // stires the id of all pool created by an address
        pool_created_by_address: Map<ContractAddress, Vec<u256>>,
        beneficiary_in_pool_by_address: Map<
            ContractAddress, Vec<u256>,
        >, // all pool a dress is a beneficiary in by pool id
        donors_count: u256, // total number of donors in all pool
        pool_donors_count: Map<u256, u256>,
        pool_count: u256,
        pool_usage_fee: u256,
        is_pool_paid: Map<u256, bool>, // checker for when a pool is resolve / paid
        //pool_update_fee: u256,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        token_address: ContractAddress,
        child_contract_class_hash: ClassHash,
        pool_addresses: Map<u256, ContractAddress>, // pool_id -> child_contract_address
        pool_addresses_map: Map<ContractAddress, u256>, // child_contract_address ->  pool_id
        emergency_withdraw_address: ContractAddress,
        platform_percentage: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        PoolCreated: PoolCreated,
        PoolPaid: PoolPaid,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[constructor]
    pub fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        token_address: ContractAddress,
        emergency_withdraw_address: ContractAddress,
        child_contract_class_hash: ClassHash,
    ) {
        assert(owner != contract_address_const::<0>(), 'zero address');
        // initialize owner of contract
        self.ownable.initializer(owner);
        self.accesscontrol.initializer();
        self.accesscontrol.set_role_admin(ADMIN_ROLE, OVERALL_ADMIN_ROLE);
        self.accesscontrol._grant_role(ADMIN_ROLE, owner);
        self.accesscontrol._grant_role(OVERALL_ADMIN_ROLE, owner);

        self.token_address.write(token_address);
        self.emergency_withdraw_address.write(emergency_withdraw_address);
        self.child_contract_class_hash.write(child_contract_class_hash);
        self.pool_usage_fee.write(1_000_000_000_000_000_000);
        self.platform_percentage.write(1);
    }

    #[generate_trait]
    impl SecurityImpl of SecurityTrait {
        fn assert_group_creation_fee_requirements(
            self: @ContractState,
            token: IERC20Dispatcher,
            amount: Option<u256>,
            creator: ContractAddress,
            contract_address: ContractAddress,
        ) {
            let creator_balance = token.balance_of(creator);
            let amount = amount
                .unwrap_or(
                    self.pool_usage_fee.read(),
                ); // if none is passed then we use the pool creation fee
            assert(creator_balance >= amount, 'insufficient balance');

            let allowed_amount = token.allowance(creator, contract_address);
            assert(allowed_amount >= amount, 'insufficient allowance');
        }
    }

    #[abi(embed_v0)]
    impl crowdfund of ICrowdFund<ContractState> {
        fn create_pool(
            ref self: ContractState,
            name: ByteArray,
            target_amount: u256,
            beneficiary: ContractAddress,
        ) -> ContractAddress {
            assert(get_caller_address() != contract_address_const::<0>(), 'zero address');
            assert(target_amount > 1_000_000_000_000_000_000, 'target amount <= 1 STRK');
            let caller = get_caller_address();
            let id = self.pool_count.read() + 1;
            let mut pool = Pool {
                balance: 0,
                id,
                beneficiary,
                name: name.clone(),
                create_at: get_block_timestamp(),
                creator: caller,
                donors: 0,
                target: target_amount,
                pool_address: caller,
                is_complete: false,
            };

            // Collect pool creation fee based on how much we are charging for the pool usage
            let fee = self.pool_usage_fee.read();
            self._collect_pool_creation_fee(caller, fee);
            self.pools.write(id, pool.clone());

            let mut constructor_calldata: Array<felt252> = array![];
            (
                id,
                pool.clone(),
                self.emergency_withdraw_address.read(),
                self.token_address.read(),
                self.ownable.owner(),
            )
                .serialize(ref constructor_calldata);

            let (contract_address_for_pool, _) = deploy_syscall(
                self.child_contract_class_hash.read(), 0, constructor_calldata.span(), false,
            )
                .unwrap();
            self.pool_addresses.write(id, contract_address_for_pool);
            self.pool_addresses_map.write(contract_address_for_pool, id);
            self.pool_created_by_address.entry(caller).push(id);
            self.beneficiary_in_pool_by_address.entry(beneficiary).push(id);

            let child_contract = ICrowdFundChildDispatcher {
                contract_address: contract_address_for_pool,
            };
            child_contract.set_and_approve_main_contract(get_contract_address());
            pool.pool_address = contract_address_for_pool;
            self.pools.write(id, pool.clone());
            self.is_pool_paid.write(id, false);
            self.pool_count.write(id);

            self
                .emit(
                    Event::PoolCreated(
                        PoolCreated {
                            pool_address: contract_address_for_pool,
                            pool_id: id,
                            creator: get_caller_address(),
                            pool_name: name.clone(),
                        },
                    ),
                );
            contract_address_for_pool
        }
        // Returns all groups
        fn get_all_pools(self: @ContractState) -> Array<Pool> {
            let mut pools: Array<Pool> = ArrayTrait::new();
            let count = self.pool_count.read();
            let mut i: u256 = 1;
            while i <= count {
                let pool = self.pools.read(i);
                pools.append(pool);
                i = i + 1;
            }
            pools
        }

        fn get_pool(self: @ContractState, pool_id: u256) -> Pool {
            let pool: Pool = self.pools.read(pool_id);
            pool
        }

        fn get_donor_count(self: @ContractState, pool_id: u256) -> u256 {
            let donor = self.pool_donors_count.read(pool_id);
            donor
        }

        fn get_pool_balance(self: @ContractState, pool_address: ContractAddress) -> u256 {
            self._check_token_balance_of_child(pool_address)
        }

        fn get_pool_target(self: @ContractState, pool_id: u256) -> u256 {
            let pool = self.pools.read(pool_id);
            pool.target
        }

        fn paymesh_donate(ref self: ContractState, pool_address: ContractAddress, amount: u256) {
            let pool_id: u256 = self.pool_addresses_map.read(pool_address);
            assert(pool_id != 0, 'pool id is 0');
            let mut pool = self.pools.read(pool_id);
            let is_complete = self.is_pool_completed(pool_id);
            assert(!is_complete, 'pool is completed');
            let current_balance = self._check_token_balance_of_child(pool_address);
            self._check_token_allowance(get_caller_address(), get_contract_address(), amount);
            assert(current_balance < pool.target, 'target reach');

            // Add this transfer:
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            token.transfer_from(get_caller_address(), pool_address, amount);

            let new_balance = self._check_token_balance_of_child(pool_address);
            pool.balance = new_balance;
            pool.donors = pool.donors + 1;

            let donate = self.donors_count.read() + 1;
            self.donors_count.write(donate);
            self.pools.write(pool_id, pool);

            let donor_num = self.pool_donors_count.read(pool_id) + 1;
            self.pool_donors_count.write(pool_id, donor_num);
        }

        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.accesscontrol.assert_only_role(ADMIN_ROLE);

            assert(new_class_hash.is_non_zero(), 'Class hash cannot be zero');

            starknet::syscalls::replace_class_syscall(new_class_hash).unwrap();
        }

        fn is_pool_completed(self: @ContractState, pool_id: u256) -> bool {
            self.is_pool_paid.read(pool_id)
        }

        fn set_platform_percentage(ref self: ContractState, value: u256) {
            let caller = get_caller_address();
            let is_admin = self.accesscontrol.has_role(ADMIN_ROLE, caller);
            assert(is_admin, 'caller not admin or EMG admin');
            self.platform_percentage.write(value);
        }

        fn get_platform_percentage(self: @ContractState) -> u256 {
            self.platform_percentage.read()
        }

        fn paymesh(ref self: ContractState, pool_address: ContractAddress) {
            let pool_id: u256 = self.pool_addresses_map.read(pool_address);
            assert(pool_id != 0, 'pool id is 0');
            let mut pool = self.pools.read(pool_id);
            let caller = get_caller_address();

            let caller = pool.beneficiary == caller
                || caller == pool.creator
                || self.accesscontrol.has_role(ADMIN_ROLE, caller);
            assert(caller, 'not creator, member or admin');
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let current_balance = self._check_token_balance_of_child(pool_address);
            // calculate platform % and send to platform
            let platform_fee = current_balance * self.platform_percentage.read() / 100;
            println!("platform fee {}", platform_fee);
            assert(current_balance >= pool.target, 'target not reach yet');
            token.transfer_from(pool_address, get_contract_address(), platform_fee);
            // remaining balance after platform fee
            let remaining_balance = self._check_token_balance_of_child(pool_address);
            println!("remaining fee befor {} after {}", current_balance, remaining_balance);
            token.transfer_from(pool_address, pool.beneficiary, remaining_balance);
            
            // check the contract balance after paymesh
            let group_balance_after_paymesh = token.balance_of(pool_address);
            assert(group_balance_after_paymesh == 0, 'balance shuld b 0 after paymesh');

            // update the pool balance
            pool.balance = group_balance_after_paymesh;

            pool.is_complete = true;
            self.pools.write(pool_id, pool);
            self.is_pool_paid.write(pool_id, true);

            self
                .emit(
                    Event::PoolPaid(
                        PoolPaid {
                            pool_id: pool_id,
                            amount: current_balance,
                            paid_by: get_caller_address(),
                            paid_at: get_block_timestamp(),
                        },
                    ),
                );
        }
    }

    #[generate_trait]
    impl internal of InternalTrait {
        // Collects the pool creation fee from the creator.
        fn _collect_pool_creation_fee(
            ref self: ContractState, creator: ContractAddress, amount: u256,
        ) {
            // Retrieve the STRK token contract
            let strk_token = IERC20Dispatcher { contract_address: self.token_address.read() };

            // Check group creation fee requirements using SecurityTrait
            let _contract_address = get_contract_address();
            self
                .assert_group_creation_fee_requirements(
                    strk_token, Some(amount), creator, _contract_address,
                );

            // Transfer the pool creation fee from creator to the contract
            strk_token.transfer_from(creator, _contract_address, amount);
        }

        fn _check_token_balance_of_child(
            self: @ContractState, group_address: ContractAddress,
        ) -> u256 {
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let balance = token.balance_of(group_address);
            balance
        }

        fn _check_token_allowance(
            ref self: ContractState, owner: ContractAddress, spender: ContractAddress, amount: u256,
        ) {
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let allowance = token.allowance(owner, spender);
            assert(allowance >= amount, 'insufficient allowance');
        }
    }
}
