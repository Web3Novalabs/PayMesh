#[starknet::contract]
pub mod AutoShare {
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
    use crate::autoshare_child::{
        IAutoshareChild, IAutoshareChildDispatcher, IAutoshareChildDispatcherTrait,
    };
    use crate::base::errors::{
        ERROR_ZERO_ADDRESS, ERR_ALREADY_APPROVED, ERR_DUPLICATE_ADDRESS, ERR_GROUP_NOT_FOUND,
        ERR_INSUFFICIENT_APPROVALS, ERR_INVALID_PERCENTAGE_SUM, ERR_NOT_GROUP_MEMBER,
        ERR_TOO_FEW_MEMBERS, ERR_UNAUTHORIZED, ERR_UPDATE_FEE_NOT_PAID,
        ERR_UPDATE_REQUEST_NOT_FOUND, INSUFFICIENT_ALLOWANCE, INSUFFICIENT_STRK_BALANCE,
    };
    use crate::base::events::{
        GroupCreated, GroupPaid, GroupUpdateApproved, GroupUpdateRequested, GroupUpdated,
        MemberShare, SubscriptionTopped,
    };
    use crate::base::types::{Group, GroupMember, GroupUpdateRequest};
    use crate::interfaces::iautoshare::IAutoShare;
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
        groups: Map<u256, Group>,
        group_members: Map<u256, Vec<GroupMember>>,
        // stires the id of all groups created by an address
        groups_created_by_address: Map<ContractAddress, Vec<u256>>,
        group_count: u256,
        group_usage_fee: u256,
        group_update_fee: u256,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        token_address: ContractAddress,
        supported_tokens: Map<u256, ContractAddress>, // id -> token address
        token_count: u256,
        // Group update storage
        update_request_count: u256,
        update_requests: Map<u256, GroupUpdateRequest>, // group_id -> update_request
        update_request_new_members: Map<u256, Vec<GroupMember>>, // group_id -> new_members
        update_approvals: Map<(u256, ContractAddress), bool>, // (group_id, member) -> has_approved
        has_pending_update: Map<u256, bool>, // group_id -> has_pending_update
        child_contract_class_hash: ClassHash,
        group_addresses: Map<u256, ContractAddress>, // group_id -> child_contract_address
        group_addresses_map: Map<ContractAddress, u256>, // child_contract_address ->  group_id
        emergency_withdraw_address: ContractAddress,
        // stores all paid usage count for a group

        group_usage_paid_history: Map<
            u256, Vec<u256>,
        >, // group_id -> paid_usage_count eg if the user paid for 20 usages then its going to be 20
        group_usage_paid: Map<
            u256, u256,
        >, // group_id -> paid_usage_count eg if the user paid for 20 usages then its going to be 20
        usage_count: Map<
            u256, u256,
        > // group_id to the usage_count rn, ie how many usages he has remaining
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        // #[flat]
        GroupCreated: GroupCreated,
        GroupUpdateRequested: GroupUpdateRequested,
        GroupUpdateApproved: GroupUpdateApproved,
        GroupUpdated: GroupUpdated,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        // #[flat]
        GroupPaid: GroupPaid,
        SubscriptionTopped: SubscriptionTopped,
    }

    #[constructor]
    pub fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        token_address: ContractAddress,
        emergency_withdraw_address: ContractAddress,
        child_contract_class_hash: ClassHash,
    ) {
        assert(owner != contract_address_const::<0>(), ERROR_ZERO_ADDRESS);
        // initialize owner of contract
        self.ownable.initializer(owner);
        self.accesscontrol.initializer();
        self.accesscontrol.set_role_admin(ADMIN_ROLE, OVERALL_ADMIN_ROLE);
        self.accesscontrol._grant_role(ADMIN_ROLE, owner);
        self.accesscontrol._grant_role(OVERALL_ADMIN_ROLE, owner);

        self.group_count.write(0);
        self.update_request_count.write(0);
        self.token_address.write(token_address);
        self.emergency_withdraw_address.write(emergency_withdraw_address);
        self.child_contract_class_hash.write(child_contract_class_hash);
        self.group_usage_fee.write(1_000_000_000_000_000_000);
        self.group_update_fee.write(1_000_000_000_000_000_000);
    }

    #[generate_trait]
    impl SecurityImpl of SecurityTrait {
        fn is_admin_or_creator(self: @ContractState, group: Group) {
            let caller = get_caller_address();

            let is_admin = self.accesscontrol.has_role(ADMIN_ROLE, caller);
            let is_creator = caller == group.creator;
            let permission = is_admin || is_creator;
            assert(permission, 'only owner or admin');
        }

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
                    self.group_update_fee.read(),
                ); // if none is passed then we use the group creation fee
            assert(creator_balance >= amount, INSUFFICIENT_STRK_BALANCE);

            let allowed_amount = token.allowance(creator, contract_address);
            assert(allowed_amount >= amount, INSUFFICIENT_ALLOWANCE);
        }

        fn _get_group_id(self: @ContractState, address: ContractAddress) -> u256 {
            let group_id = self.group_addresses_map.read(address);
            group_id
        }
    }

    #[abi(embed_v0)]
    impl autoshare of IAutoShare<ContractState> {
        fn create_group(
            ref self: ContractState,
            name: ByteArray,
            members: Array<GroupMember>,
            usage_count: u256,
        ) -> ContractAddress {
            assert(get_caller_address() != contract_address_const::<0>(), ERROR_ZERO_ADDRESS);
            let member_count: usize = members.len();
            assert(member_count >= 2, 'member is less than 2');

            let mut sum: u32 = 0;
            let mut i: usize = 0;

            // check for duplicate address and
            // the split calculation will be 100% across all address
            while i < member_count {
                let m = members.at(i).clone();
                sum += m.percentage.try_into().unwrap();
                let mut j: usize = i + 1;
                while j < member_count {
                    let duplicate = m.addr == members.at(j).clone().addr;
                    assert(!duplicate, 'list contain dublicate address');
                    j += 1;
                }
                i += 1;
            }
            let caller = get_caller_address();
            assert(caller != contract_address_const::<0>(), ERROR_ZERO_ADDRESS);
            assert(sum == 100, 'cummulative share not 100%');
            let id = self.group_count.read() + 1;

            let mut group = Group {
                id,
                name: name.clone(),
                usage_limit_reached: false,
                creator: get_caller_address(),
                date: get_block_timestamp(),
                group_address: get_caller_address(),
                total_amount: 0,
            };
            self.groups.write(id, group.clone());

            i = 0;
            while i < member_count {
                self.group_members.entry(id).push(members.at(i).clone());
                i += 1;
            }
            // Collect pool creation fee based on how much we are charging for the group usage
            let fee = self._get_group_usage_amount(usage_count);
            self._collect_group_creation_fee(caller, fee);
            self.group_count.write(id);

            let mut constructor_calldata: Array<felt252> = array![];
            (
                id,
                group.clone(),
                self.emergency_withdraw_address.read(),
                members.clone(),
                self.token_address.read(),
                self.ownable.owner(),
                get_caller_address(),
            )
                .serialize(ref constructor_calldata);

            let (contract_address_for_group, _) = deploy_syscall(
                self.child_contract_class_hash.read(), 0, constructor_calldata.span(), false,
            )
                .unwrap();
            self.group_addresses.write(id, contract_address_for_group);
            self.group_addresses_map.write(contract_address_for_group, id);
            self.groups_created_by_address.entry(caller).push(id);

            let len = self.token_count.read();
            let child_contract = IAutoshareChildDispatcher {
                contract_address: contract_address_for_group,
            };
            child_contract.set_and_approve_main_contract(get_contract_address());
            for i in 1..=len {
                let token_address: ContractAddress = self.supported_tokens.read(i);
                let child_contract = IAutoshareChildDispatcher {
                    contract_address: contract_address_for_group,
                };
                child_contract.set_supported_token(token_address);
            }

            self.usage_count.write(id, usage_count);
            self.group_usage_paid_history.entry(id).push(usage_count);
            self.group_usage_paid.entry(id).write(usage_count);
            self
                .emit(
                    Event::GroupCreated(
                        GroupCreated {
                            group_address: contract_address_for_group,
                            group_id: id,
                            creator: get_caller_address(),
                            name,
                            usage_count,
                            members: members,
                        },
                    ),
                );
            group.group_address = contract_address_for_group;
            self.groups.write(id, group.clone());

            contract_address_for_group
        }

        fn get_group(self: @ContractState, group_id: u256) -> Group {
            let group: Group = self.groups.read(group_id);
            group
        }

        // Returns all groups
        fn get_all_groups(self: @ContractState) -> Array<Group> {
            let mut groups: Array<Group> = ArrayTrait::new();
            let count = self.group_count.read();
            let mut i: u256 = 1;
            while i <= count {
                let group = self.groups.read(i);
                groups.append(group);
                i = i + 1;
            }
            groups
        }


        fn top_subscription(
            ref self: ContractState, group_id: u256, new_planned_usage_count: u256,
        ) {
            let mut group: Group = self.get_group(group_id);
            let caller = get_caller_address();
            let group_address = group.group_address;
            let is_member = self.is_group_member(group_id, caller);
            let caller = is_member || caller == group.creator;
            assert(caller, 'Only creator or member');
            assert(new_planned_usage_count > 0, 'must be greater than 0');
            let mut usage_count_remaining = self.usage_count.entry(group_id).read();
            let new_planned_usage_count_to_write = usage_count_remaining + new_planned_usage_count;
            let fee = self.group_update_fee.read() * new_planned_usage_count;
            self._collect_group_creation_fee(get_caller_address(), fee);
            group.usage_limit_reached = false;
            self.groups.write(group_id, group);
            self.group_usage_paid.entry(group_id).write(new_planned_usage_count_to_write);
            self.usage_count.entry(group_id).write(new_planned_usage_count_to_write);
            self.group_usage_paid_history.entry(group_id).push(new_planned_usage_count);
            usage_count_remaining = self.usage_count.entry(group_id).read();
            self
                .emit(
                    Event::SubscriptionTopped(
                        SubscriptionTopped { group_address, usage_count: usage_count_remaining },
                    ),
                )
        }

        fn get_group_usage_fee(self: @ContractState) -> u256 {
            self.group_usage_fee.read()
        }

        fn set_group_usage_fee(ref self: ContractState, group_usage_fee: u256) {
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            self.group_usage_fee.write(group_usage_fee);
        }

        fn get_group_update_fee(self: @ContractState) -> u256 {
            self.group_update_fee.read()
        }

        fn set_group_update_fee(ref self: ContractState, group_update_fee: u256) {
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            self.group_update_fee.write(group_update_fee);
        }

        fn get_group_usage_paid_history(self: @ContractState, group_id: u256) -> Array<u256> {
            let mut arr_usage_paid = ArrayTrait::new();
            let group_usage_paid_history_storage = self.group_usage_paid_history.entry(group_id);
            for i in 0..group_usage_paid_history_storage.len() {
                let usage_count = group_usage_paid_history_storage.at(i).read();
                arr_usage_paid.append(usage_count);
            }
            arr_usage_paid
        }

        fn get_group_usage_paid(self: @ContractState, group_id: u256) -> u256 {
            let group_usage_paid_storage = self.group_usage_paid.entry(group_id);
            group_usage_paid_storage.read()
        }

        fn get_group_usage_count(self: @ContractState, group_id: u256) -> u256 {
            let group_usage_count_storage = self.usage_count.entry(group_id);
            group_usage_count_storage.read()
        }

        // Returns all groups where usage_limit_reached matches the argument
        fn get_groups_by_usage_limit_reached(
            self: @ContractState, usage_limit_reached: bool,
        ) -> Array<Group> {
            let mut groups: Array<Group> = ArrayTrait::new();
            let count = self.group_count.read();
            let mut i: u256 = 1;
            while i <= count {
                let group = self.groups.read(i);
                if group.usage_limit_reached == usage_limit_reached {
                    groups.append(group);
                }
                i = i + 1;
            }
            groups
        }

        fn get_groups_created_by_address(
            self: @ContractState, address: ContractAddress,
        ) -> Array<Group> {
            let mut groups: Array<Group> = ArrayTrait::new();
            let groups_created_by_address_ptr = self.groups_created_by_address.entry(address);
            for i in 0..groups_created_by_address_ptr.len() {
                let group_id: u256 = groups_created_by_address_ptr.at(i).read();
                let group = self.groups.entry(group_id).read();
                groups.append(group);
            }
            groups
        }

        fn get_group_member(self: @ContractState, group_id: u256) -> Array<GroupMember> {
            let members = self.group_members.entry(group_id);
            let mut group_members: Array<GroupMember> = ArrayTrait::new();

            let mut i: u64 = 0;
            let len: u64 = members.len();
            while i < len {
                group_members.append(members.at(i).read());
                i += 1;
            }
            group_members
        }
        fn group_address_has_shares_in(
            self: @ContractState, address: ContractAddress,
        ) -> Array<Group> {
            let mut group: Array<Group> = ArrayTrait::new();
            let count = self.group_count.read();
            let len = count;

            for i in 1..=len {
                let group_member = self.group_members.entry(i);
                for member in 0..group_member.len() {
                    let vec = group_member.at(member).read();
                    if vec.addr == address {
                        let has_share_in_group = self.groups.read(i);
                        group.append(has_share_in_group);
                    }
                }
            }
            group
        }


        fn get_group_address(self: @ContractState, group_id: u256) -> ContractAddress {
            let group_address: ContractAddress = self.group_addresses.read(group_id);
            group_address
        }

        fn set_supported_token(ref self: ContractState, new_token_address: ContractAddress) {
            let caller = get_caller_address();
            let caller = self.accesscontrol.has_role(ADMIN_ROLE, caller);
            assert(caller, 'Unauthorize caller');
            let len = self.token_count.read();
            if len > 0 {
                for i in 1..=len {
                    let token_address: ContractAddress = self.supported_tokens.read(i);
                    let token_check = new_token_address == token_address;
                    assert(!token_check, 'token added already')
                }
            }

            let id = self.token_count.read() + 1;
            self.token_count.write(id);
            self.supported_tokens.write(id, new_token_address);
            let len = self.group_count.read();
            for i in 1..=len {
                let group_address = self.group_addresses.read(i);
                let child_contract = IAutoshareChildDispatcher { contract_address: group_address };
                child_contract.set_supported_token(new_token_address);
            }
        }

        fn get_supported_token(self: @ContractState) -> Array<ContractAddress> {
            let mut token: Array<ContractAddress> = ArrayTrait::new();
            let len = self.token_count.read();
            for i in 1..=len {
                let token_address: ContractAddress = self.supported_tokens.read(i);
                token.append(token_address);
            }
            token
        }

        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.accesscontrol.assert_only_role(ADMIN_ROLE);
            self.upgradeable.upgrade(new_class_hash);
        }

        fn upgrade_child(ref self: ContractState, new_class_hash: ClassHash) {
            self.accesscontrol.assert_only_role(ADMIN_ROLE);

            assert(new_class_hash.is_non_zero(), 'Class hash cannot be zero');
            self.child_contract_class_hash.write(new_class_hash)
        }

        fn paymesh(ref self: ContractState, group_address: ContractAddress) {
            let group_id: u256 = self._get_group_id(group_address);
            let mut group: Group = self.get_group(group_id);
            let caller = get_caller_address();
            let is_member = self.is_group_member(group_id, caller);
            let caller = is_member
                || caller == group.creator
                || self.accesscontrol.has_role(ADMIN_ROLE, caller);
            assert(caller, 'not creator, member or admin');
            let mut usage_count = self.usage_count.read(group_id);
            assert(
                usage_count > 0 || !group.clone().usage_limit_reached,
                'Max Usage Renew Subscription',
            );
            assert(group.id != 0, 'group id is 0');
            // removed the logic where caller is the creator
            let group_members_vec = self.group_members.entry(group_id);
            let group_address = self.get_group_address(group_id);
            // let amount = self._check_token_balance_of_child(group_address);

            let len = self.token_count.read();
            let mut pay_happen = false;
            for i in 1..=len {
                let token_address: ContractAddress = self.supported_tokens.read(i);
                let balance = self
                    ._check_token_balance_of_group_by_tokens(group_address, token_address);
                if balance > 0 {
                    let mut usage_count = self.usage_count.read(group_id);
                    assert(
                        usage_count > 0 || !group.clone().usage_limit_reached,
                        'Max Usage Renew Subscription',
                    );
                    let mut members_arr: Array<MemberShare> = ArrayTrait::new();
                    for member in 0..group_members_vec.len() {
                        let member: GroupMember = group_members_vec.at(member).read();
                        let members_money: u256 = balance
                            * member.percentage.try_into().unwrap()
                            / 100;
                        let member_share: MemberShare = MemberShare {
                            addr: member.addr, share: members_money,
                        };
                        // now transfer from group address to member address
                        members_arr.append(member_share);
                        let token = IERC20Dispatcher { contract_address: token_address };
                        token.transfer_from(group_address, member.addr, members_money);
                    }
                    pay_happen = true;

                    usage_count -= 1;
                    if usage_count == 0 {
                        group.usage_limit_reached = true;
                    }
                    group.total_amount += balance;
                    self.groups.write(group_id, group.clone());
                    // once paid, we decrement the planned usage count
                    self.usage_count.write(group_id, usage_count);
                    self
                        .emit(
                            Event::GroupPaid(
                                GroupPaid {
                                    group_address,
                                    amount: balance,
                                    paid_by: get_caller_address(),
                                    paid_at: get_block_timestamp(),
                                    members: members_arr,
                                    usage_count: usage_count,
                                    token_address,
                                },
                            ),
                        );
                }
            }

            assert(pay_happen, 'no payment made');
        }

        fn request_group_update(
            ref self: ContractState,
            group_id: u256,
            new_name: ByteArray,
            new_members: Array<GroupMember>,
        ) {
            let mut group: Group = self.get_group(group_id);
            assert(group.id != 0, ERR_GROUP_NOT_FOUND);
            let caller = get_caller_address();
            assert(caller == group.creator, 'caller is not the group creator');

            let mut sum: u32 = 0;
            let mut i: usize = 0;

            // This code checks for duplicate addresses among group members
            let member_count = new_members.len();
            while i < member_count {
                let m = new_members.at(i).clone();
                sum += m.percentage.try_into().unwrap();
                let mut j: usize = i + 1;
                while j < member_count {
                    let duplicate = m.addr == new_members.at(j).clone().addr;
                    assert(!duplicate, 'list contain duplicate address');
                    j += 1;
                }
                i += 1;
            }
            assert(sum == 100, 'total percentage must be 100');

            // Store the new members separately
            let mut i: usize = 0;
            let member_count = new_members.len();
            while i < member_count {
                let member = new_members.at(i);

                self.update_request_new_members.entry(group_id).append().write(*member);
                i += 1;
            }

            let update_request = GroupUpdateRequest {
                group_id, new_name: new_name.clone(), requester: caller, fee_paid: false,
            };

            // Collect the update fee
            self._collect_group_update_fee(caller);

            // set fee_paid to true after collecting the fee
            let mut update_request_paid = update_request.clone();
            update_request_paid.fee_paid = true;
            self.update_requests.write(group_id, update_request_paid);

            self.has_pending_update.write(group_id, true);

            self
                .emit(
                    Event::GroupUpdateRequested(
                        GroupUpdateRequested {
                            group_id, requester: caller, new_name: new_name.clone(),
                        },
                    ),
                );

            self._execute_group_update(group_id);
        }

        fn get_group_balance(self: @ContractState, group_address: ContractAddress) -> u256 {
            self._check_token_balance_of_child(group_address)
        }

        fn withdraw(ref self: ContractState) {
            let current_caller = get_caller_address();
            let is_admin = self.accesscontrol.has_role(ADMIN_ROLE, current_caller);
            let emergency_address = self.emergency_withdraw_address.read();

            assert(
                current_caller == emergency_address || is_admin, 'caller not admin or EMG admin',
            );
            let contract_address = get_contract_address();

            // check contract balance
            let amount = self._check_token_balance_of_child(contract_address);

            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            token.transfer(current_caller, amount);
        }
    }

    #[generate_trait]
    impl internal of InternalTrait {
        /// Returns true if the address is found among the group members, false otherwise.
        fn is_group_member(
            ref self: ContractState, group_id: u256, member_addr: ContractAddress,
        ) -> bool {
            // Get the vector of group members for the given group_id
            let group_members = self.group_members.entry(group_id);

            // Iterate over the group members
            let mut i: u64 = 0;
            let len: u64 = group_members.len();
            while i < len {
                let member = group_members.at(i).read();
                if member_addr == member.addr {
                    return true;
                }
                i += 1;
            }
            false
        }

        fn _collect_group_update_fee(ref self: ContractState, requester: ContractAddress) {
            // Retrieve the STRK token contract
            let strk_token = IERC20Dispatcher { contract_address: self.token_address.read() };

            // Check update fee requirements
            let _contract_address = get_contract_address();
            self
                .assert_group_creation_fee_requirements(
                    strk_token, None, requester, _contract_address,
                );

            // Transfer the update fee from requester to the contract
            strk_token.transfer_from(requester, _contract_address, self.group_update_fee.read());
        }

        fn get_update_request_new_members(
            self: @ContractState, group_id: u256,
        ) -> Array<GroupMember> {
            let new_members_vec = self.update_request_new_members.entry(group_id);
            let mut result = ArrayTrait::new();

            let mut i: u64 = 0;
            let len: u64 = new_members_vec.len();
            while i < len {
                let member = new_members_vec.at(i).read();
                result.append(member);
                i += 1;
            }

            result
        }

        // Collects the group creation fee from the creator.
        fn _collect_group_creation_fee(
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

        fn _check_token_allowance(ref self: ContractState, spender: ContractAddress, amount: u256) {
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let allowance = token.allowance(spender, starknet::get_contract_address());
            assert(allowance >= amount, 'insufficient allowance');
        }

        fn _check_token_balance(ref self: ContractState, caller: ContractAddress, amount: u256) {
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let balance = token.balance_of(caller);
            assert(balance >= amount, 'insufficient balance');
        }

        fn _check_token_balance_of_child(
            self: @ContractState, group_address: ContractAddress,
        ) -> u256 {
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let balance = token.balance_of(group_address);
            balance
        }

        fn _check_token_balance_of_group_by_tokens(
            self: @ContractState, group_address: ContractAddress, token_address: ContractAddress,
        ) -> u256 {
            let token = IERC20Dispatcher { contract_address: token_address };
            let balance = token.balance_of(group_address);
            balance
        }
        fn _get_group_usage_amount(self: @ContractState, usage_count: u256) -> u256 {
            let group_usage_amount = usage_count * self.group_usage_fee.read();
            group_usage_amount
        }

        fn _execute_group_update(ref self: ContractState, group_id: u256) {
            let mut group: Group = self.get_group(group_id);
            assert(group.id != 0, ERR_GROUP_NOT_FOUND);
            let caller = get_caller_address();

            // Retrieve the update request
            let update_request: GroupUpdateRequest = self.update_requests.read(group_id);

            // assert(update_request.is_completed == true, 'update request not completed');

            // Check if the caller is the group creator
            let is_creator = caller == group.creator;
            assert(is_creator, 'caller is not the group creator');

            // Store old and new values for the event BEFORE moving group
            let old_name = group.name.clone();
            let new_name = update_request.new_name.clone();

            // Update the group with new values
            group.name = new_name.clone();
            self.groups.write(group_id, group);

            // Clear the update request
            self
                .update_requests
                .write(
                    group_id,
                    GroupUpdateRequest {
                        group_id: 0,
                        new_name: "",
                        requester: starknet::contract_address_const::<0>(),
                        fee_paid: false,
                    },
                );

            // remove all previous members
            let new_members = self.get_update_request_new_members(group_id);

            // Clear the previous members for the update request
            let mut previous_member = self.group_members.entry(group_id);
            let mut len = previous_member.len();
            while len > 0 {
                previous_member.pop();
                len -= 1;
            }

            let mut i: u32 = 0;
            let member_count = self.update_request_new_members.entry(group_id);
            let mut len: u32 = member_count.len().try_into().unwrap();

            // push new member to the group member storage
            while i < len {
                let m: u64 = i.try_into().unwrap();
                let member = new_members.at(i).clone();
                self.group_members.entry(group_id).push(member);
                i += 1;
            }

            // Clear the new members for the update request
            let mut new_members_vec = self.update_request_new_members.entry(group_id);
            let mut len = new_members_vec.len();
            while len > 0 {
                new_members_vec.pop();
                len -= 1;
            }

            // Clear the update approvals for all current group members
            let group_members_vec = self.group_members.entry(group_id);
            let mut i: u64 = 0;
            let len: u64 = group_members_vec.len();
            while i < len {
                let member = group_members_vec.at(i).read();
                self.update_approvals.write((group_id, member.addr), false);
                i += 1;
            }

            // Clear the pending update status
            self.has_pending_update.write(group_id, false);

            // Emit the GroupUpdated event
            self.emit(Event::GroupUpdated(GroupUpdated { group_id, old_name, new_name }));
        }
    }
}
