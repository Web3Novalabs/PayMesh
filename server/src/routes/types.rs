use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct PaymeshGroup {
    pub group_address: String,
    pub group_name: String,
    pub creator_address: String,
    pub usage_remaining: String,
    pub members: Vec<GroupPaymentMembers>,
}

#[derive(Debug, Deserialize)]
pub struct GroupPaymentMembers {
    pub member_address: String,
    pub member_percentage: String,
}

#[derive(Debug, Deserialize)]
pub struct PayGroupRequest {
    pub group_address: String,
}

#[derive(Debug, Deserialize)]
pub struct GetGroupDetailsRequest {
    pub group_address: String,
}

#[derive(Debug, Serialize)]
pub struct GetGroupDetailsResponse {
    pub group_address: String,
    pub group_name: String,
    pub creator_address: String,
    pub usage_remaining: bigdecimal::BigDecimal,
    pub created_at: String,
    pub updated_at: Option<String>,
    pub members: Vec<GroupMemberResponse>,
}

#[derive(Debug, Serialize)]
pub struct PaymeshGroupResponse {
    pub group_address: String,
    pub group_name: String,
    pub creator_address: String,
    pub usage_remaining: bigdecimal::BigDecimal,
    pub created_at: String,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct GroupMemberResponse {
    pub member_address: String,
    pub member_percentage: bigdecimal::BigDecimal,
    pub is_active: bool,
    pub added_at: String,
}

#[derive(Debug, Serialize)]
pub struct GetGroupUsageRemaining {
    pub usage_remaining: bigdecimal::BigDecimal,
}
