use starknet::ContractAddress;
// GroupMember type
#[derive(Serde, Drop, Copy, starknet::Store, PartialEq, Debug)]
pub struct GroupMember {
    pub addr: ContractAddress,
    pub percentage: u256,
}

// Group type
#[derive(Serde, Drop, Clone, starknet::Store, PartialEq)]
pub struct Group {
    pub id: u256,
    pub name: ByteArray,
    pub usage_limit_reached: bool,
    pub creator: ContractAddress,
    pub group_address: ContractAddress,
    pub date: u64,
    pub total_amount: u256,
}

// GroupUpdateRequest type for tracking update requests
#[derive(Drop, Serde, PartialEq, starknet::Store, Clone)]
pub struct GroupUpdateRequest {
    pub group_id: u256,
    pub new_name: ByteArray,
    pub requester: ContractAddress,
    pub fee_paid: bool,
    // pub approval_count: u8,
// pub total_members: u8,
// pub is_completed: bool,
}
