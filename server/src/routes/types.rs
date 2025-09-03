use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};

#[derive(Debug, Deserialize, Validate)]
pub struct GroupRequest {
    #[validate(custom(function = "validate_address"))]
    pub group_address: String,
    #[validate(length(min = 2, max = 100))]
    pub group_name: String,
    #[validate(custom(function = "validate_address"))]
    pub created_by: String,
    pub usage_remaining: u32,
    pub members: Vec<GroupMembersRequest>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct GroupMembersRequest {
    #[validate(custom(function = "validate_address"))]
    pub addr: String,
    #[validate(range(min = 1, max = 100))]
    pub percentage: u8,
}

#[derive(Debug, Deserialize, Validate)]
pub struct GetGroupDetailsRequest {
    #[validate(custom(function = "validate_address"))]
    pub group_address: String,
}
#[derive(Debug, Serialize)]
pub struct GetGroupDetailsResponse {
    pub group_address: String,
    pub group_name: String,
    pub created_by: String,
    pub usage_remaining: bigdecimal::BigDecimal,
    pub created_at: String,
    pub updated_at: Option<String>,
    pub members: Vec<GroupMemberResponse>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct PayGroupRequest {
    #[validate(custom(function = "validate_address"))]
    pub group_address: String,
    #[validate(custom(function = "validate_address"))]
    pub token_address: String,
    #[validate(custom(function = "validate_address"))]
    pub tx_hash: String,
    pub usage_remaining: u32,
    pub token_amount: String,
    pub members: Vec<PayGroupMembersRequest>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CallContractRequest {
    #[validate(custom(function = "validate_address"))]
    pub group_address: String,
    #[validate(custom(function = "validate_address"))]
    pub from_address: String,
    #[validate(custom(function = "validate_address"))]
    pub tx_hash: String
}

#[derive(Debug, Deserialize, Validate)]
pub struct PayGroupMembersRequest {
    #[validate(custom(function = "validate_address"))]
    pub member_address: String,
    #[validate(range(min = 1, max = 100))]
    pub member_amount: u32,
}

#[derive(Debug, Serialize)]
pub struct GroupsResponse {
    pub group_address: String,
    pub group_name: String,
    pub created_by: String,
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

pub fn validate_address(address: &str) -> Result<(), ValidationError> {
    (address.starts_with("0x")
        && address.len() == 66
        && address[2..].chars().all(|c| c.is_ascii_hexdigit()))
    .then_some(())
    .ok_or(ValidationError::new("invalid address format"))
}
