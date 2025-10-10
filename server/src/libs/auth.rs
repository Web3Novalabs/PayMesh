use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts},
};
use jsonwebtoken::{DecodingKey, Validation};

use crate::libs::error::ApiError;

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
