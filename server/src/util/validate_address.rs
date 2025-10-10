use validator::ValidationError;

pub fn validate_address(address: &str) -> Result<(), ValidationError> {
    (address.starts_with("0x")
        && address.len() == 66
        && address[2..].chars().all(|c| c.is_ascii_hexdigit()))
    .then_some(())
    .ok_or(ValidationError::new("invalid address format"))
}
