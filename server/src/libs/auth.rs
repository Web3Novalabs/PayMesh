use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts},
};
use jsonwebtoken::{DecodingKey, Validation};
    use sha2::{Sha256, Digest};

use crate::{
    AppState,
    libs::error::{ApiError, map_sqlx_error},
};

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct TokenClaims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
    pub iat: usize,
}

pub struct AuthenticatedUser(pub TokenClaims);

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let token = parts
            .headers
            .get(header::COOKIE)
            .and_then(|cookie_hdr| cookie_hdr.to_str().ok())
            .and_then(|cookie_str| {
                cookie_str.split(';').find_map(|cookie| {
                    let cookie = cookie.trim();
                    cookie.strip_prefix("token=").map(|v| v.to_string())
                })
            })
            .or_else(|| {
                parts
                    .headers
                    .get(header::AUTHORIZATION)
                    .and_then(|hdr| hdr.to_str().ok())
                    .and_then(|val| {
                        if val.to_ascii_lowercase().starts_with("bearer ") {
                            Some(val[7..].trim().to_string())
                        } else {
                            None
                        }
                    })
            });

        let token = token.ok_or(ApiError::Unauthorized("Missing token"))?;
        let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
        let decoding_key = DecodingKey::from_secret(secret.as_ref());

        let claims =
            jsonwebtoken::decode::<TokenClaims>(&token, &decoding_key, &Validation::default())
                .map_err(|_| ApiError::Unauthorized("Invalid token"))?
                .claims;

        Ok(AuthenticatedUser(claims))
    }
}

pub struct AdminUser(pub TokenClaims);

impl<S> FromRequestParts<S> for AdminUser
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let AuthenticatedUser(claims) = AuthenticatedUser::from_request_parts(parts, state).await?;

        if claims.role != "admin" {
            return Err(ApiError::Unauthorized("Admin access required"));
        }

        Ok(AdminUser(claims))
    }
}

pub struct ApiKey();

impl FromRequestParts<AppState> for ApiKey {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let api_key = match parts.headers.get("paymesh-api-key") {
            Some(val) => val.to_str().unwrap_or_default(),
            None => return Err(ApiError::Unauthorized("Missing Paymesh Api Key")),
        };

        let hashed_api_key = hash_api_key(api_key);


        let api_key_details: ApiDetails = sqlx::query_as!(
            ApiDetails,
            "SELECT num_of_usages FROM api_keys WHERE api_key_hash = $1  AND revoked = false",
            hashed_api_key
        )
        .fetch_optional(&state.db)
        .await
        .map_err(|e| map_sqlx_error(&e))?
        .ok_or_else(|| ApiError::BadRequest("Invalid ApiKey"))?;

        let new_usage_count = api_key_details.num_of_usages + 1;

        sqlx::query!(
            r#"UPDATE api_keys SET num_of_usages = $1, last_used = NOW() WHERE api_key_hash = $2"#,
            new_usage_count,
            hashed_api_key
        )
        .execute(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Error while updating usage count");
            map_sqlx_error(&e)
        })?;

        Ok(ApiKey())
    }
}
#[derive(Debug)]
pub struct ApiDetails {
    num_of_usages: i32,
}


fn hash_api_key(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    format!("{:x}", hasher.finalize())
}