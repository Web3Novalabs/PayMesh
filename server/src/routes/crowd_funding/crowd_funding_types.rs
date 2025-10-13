use crate::util::validate_address::validate_address;
use bigdecimal::BigDecimal;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CrowdFunding {
    pub id: i32,
    pub name: String,
    pub pool_address: String,
    pub creator_address: String,
    pub target_amount: String,
    pub is_complete: bool,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CrowdFundingDetails {
    pub crowd_funding: CrowdFunding,
    pub token_history: Vec<TokenBalance>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct TokenBalance {
    pub token_address: String,
    pub balance: String,

}

#[derive(Debug, Deserialize, ToSchema, Validate)]
pub struct CreateCrowdFundingRequest {
    pub name: String,
    #[validate(custom(function = "validate_address"))]
    pub pool_address: String,
    #[validate(custom(function = "validate_address"))]
    pub creator_address: String,
    pub target_amount: String,
}

#[derive(Debug, Deserialize, ToSchema, Validate)]
pub struct DonateToCrowdFundingRequest {
    #[validate(custom(function = "validate_address"))]
    pub donor_address: String,
    pub amount: String,
    #[validate(custom(function = "validate_address"))]
    pub token_address: String,
    #[validate(custom(function = "validate_address"))]
    pub transaction_hash: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Donation {
    pub id: i32,
    pub crowd_funding_id: i32,
    pub donor_address: String,
    pub amount: String,
    pub token_address: String,
    pub transaction_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PreviousBalance {
    pub total_amount: BigDecimal,
}

#[derive(Debug, Serialize, Deserialize, Validate, ToSchema)]
pub struct ResolveCrowdFundingRequest {
    pub amount: String,
    #[validate(custom(function = "validate_address"))]
    pub withdrawn_by: String,
    #[validate(custom(function = "validate_address"))]
    pub token_address: String,
    #[validate(custom(function = "validate_address"))]
    pub transaction_hash: String,
}
