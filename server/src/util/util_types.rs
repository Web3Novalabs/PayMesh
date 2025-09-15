use bigdecimal::BigDecimal;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct PayGroupContractDetails {
    pub transaction_hash: String,
    pub group_address: String,
    pub token_address: String,
    pub amount: BigDecimal,
    pub senders_address: String,
    pub group_members: Vec<GroupMember>,
    pub usage_remaining: String,
}

impl PayGroupContractDetails {
    pub fn new(
        transaction_hash: String,
        group_address: String,
        token_address: String,
        amount: BigDecimal,
        senders_address: String,
        group_members: Vec<GroupMember>,
        usage_remaining: String,
    ) -> Self {
        Self {
            transaction_hash,
            group_address,
            token_address,
            amount,
            senders_address,
            group_members,
            usage_remaining,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct GroupMember {
    pub member_address: String,
    pub amount: BigDecimal,
}
