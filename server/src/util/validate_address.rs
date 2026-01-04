use sqlx::types::chrono;
use validator::ValidationError;

use crate::libs::error::ApiError;

pub fn validate_address(address: &str) -> Result<(), ValidationError> {
    (address.starts_with("0x")
        && address.len() == 66
        && address[2..].chars().all(|c| c.is_ascii_hexdigit()))
    .then_some(())
    .ok_or(ValidationError::new("invalid address format"))
}

pub fn validate_address_api_err(address: &str) -> Result<(), ApiError> {
    (address.starts_with("0x")
        && address.len() == 66
        && address[2..].chars().all(|c| c.is_ascii_hexdigit()))
    .then_some(())
    .ok_or(ApiError::BadRequest("INVALID ADDRESS FORMAT"))
}

pub fn validate_date(date_str: &str) -> Result<(), ApiError> {
    match chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
        Ok(_) => Ok(()),
        Err(_) => Err(ApiError::BadRequest("INVALID DATE FORMAT")),
    }
}
