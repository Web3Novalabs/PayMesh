use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct PayGroupContractDetails {
    pub transaction_hash: String,
    pub group_address: String,
    pub token_address: String,
    pub amount: String,
    pub senders_address: String,
    pub group_members: Vec<GroupMember>,
    pub paid_at: String,
    pub usage_remaining: String,
}

#[derive(Debug, Serialize)]
pub struct GroupMember {
    pub member_address: String,
    pub amount: String,
}
