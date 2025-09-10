use starknet::ContractAddress;
use super::types::GroupMember;

// Event emitted when a group is created
#[derive(Serde, Drop, starknet::Event)]
pub struct GroupCreated {
    #[key]
    pub group_address: ContractAddress,
    pub group_id: u256,
    pub creator: ContractAddress,
    pub name: ByteArray,
    pub usage_count: u256,
    pub members: Array<GroupMember>,
}

#[derive(Serde, Drop, starknet::Event)]
pub struct PoolCreated {
    #[key]
    pub pool_address: ContractAddress,
    pub pool_id: u256,
    pub creator: ContractAddress,
    pub pool_name: ByteArray,
}


// Event emitted when a group update is requested
#[derive(Serde, Drop, starknet::Event)]
pub struct GroupUpdateRequested {
    #[key]
    pub group_id: u256,
    pub requester: ContractAddress,
    pub new_name: ByteArray,
}

// Event emitted when a group member approves an update
#[derive(Serde, Drop, starknet::Event)]
pub struct GroupUpdateApproved {
    #[key]
    pub group_id: u256,
    pub approver: ContractAddress,
    pub approval_count: u8,
    pub total_members: u8,
}

// Event emitted when a group update is executed
#[derive(Serde, Drop, starknet::Event)]
pub struct GroupUpdated {
    #[key]
    pub group_id: u256,
    pub old_name: ByteArray,
    pub new_name: ByteArray,
}

// event emmitted when a group is paid
#[derive(Serde, Drop, starknet::Event)]
pub struct GroupPaid {
    #[key]
    pub group_address: ContractAddress,
    pub amount: u256,
    pub paid_by: ContractAddress,
    pub paid_at: u64,
    pub members: Array<MemberShare>,
    pub usage_count: u256,
    pub token_address: ContractAddress,
}

// event emmitted when a pool is paid
#[derive(Serde, Drop, starknet::Event)]
pub struct PoolPaid {
    #[key]
    pub pool_id: u256,
    pub amount: u256,
    pub paid_by: ContractAddress,
    pub paid_at: u64,
}

#[derive(Serde, Drop, starknet::Event)]
pub struct SubscriptionTopped {
    #[key]
    pub group_address: ContractAddress,
    pub usage_count: u256,
}

#[derive(Drop, Serde, PartialEq, starknet::Store, Clone)]
pub struct MemberShare {
    pub addr: ContractAddress,
    pub share: u256,
}
