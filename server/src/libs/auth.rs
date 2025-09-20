use axum::{
    body::Body,
    extract::State,
    http::{Request, header},
    middleware::Next,
    response::IntoResponse,
};

use axum_extra::extract::cookie::CookieJar;
use jsonwebtoken::{DecodingKey, Validation, decode};
use serde::{Deserialize, Serialize};
use sqlx::types::uuid;

use crate::{AppState, libs::error::ApiError, routes::admin::TokenClaims};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub email: String,
    pub role: String,
}

pub async fn auth(
    cookie_jar: CookieJar,
    State(data): State<AppState>,
    mut req: Request<Body>,
    next: Next,
) -> Result<impl IntoResponse, ApiError> {
    let token = cookie_jar
        .get("token")
        .map(|cookie| cookie.value().to_string())
        .or_else(|| {
            req.headers()
                .get(header::AUTHORIZATION)
                .and_then(|auth_header| auth_header.to_str().ok())
                .and_then(|auth_value| {
                    if auth_value.starts_with("Bearer ") {
                        Some(auth_value[7..].to_owned())
                    } else {
                        None
                    }
                })
        });

    let token = token.ok_or_else(|| {
        return ApiError::Unauthorized("You are not logged in, please provide token");
    })?;

    let claims = decode::<TokenClaims>(
        &token,
        &DecodingKey::from_secret(data.env.jwt_secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| {
        return ApiError::Unauthorized("Invalid token");
    })?
    .claims;

    let user_id = uuid::Uuid::parse_str(&claims.sub)
        .map_err(|_| return ApiError::Unauthorized("Invalid token"))?;

    let user = sqlx::query_as!(User, "SELECT email, role FROM users WHERE id = $1", user_id)
        .fetch_optional(&data.db)
        .await
        .map_err(|_| {
            return ApiError::Unauthorized("Error fetching user from database");
        })?;

    let user: User = user.ok_or_else(|| {
        return ApiError::Unauthorized("The user belonging to this token no longer exists");
    })?;

    req.extensions_mut().insert(user);
    Ok(next.run(req).await)
}
