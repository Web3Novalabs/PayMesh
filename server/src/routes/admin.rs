use std::time::Duration;

use serde::{Deserialize, Serialize};

use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use axum::{
    Extension, Json,
    extract::State,
    http::{Response, StatusCode, header},
    response::IntoResponse,
};
use axum_extra::extract::cookie::{Cookie, SameSite};
use jsonwebtoken::{EncodingKey, Header, encode};
use serde_json::json;
use sqlx::types::chrono;
use validator::Validate;

use crate::{
    AppState,
    libs::{
        auth::User,
        error::{ApiError, map_sqlx_error},
    },
};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub iat: usize,
    pub exp: usize,
}

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterUserReq {
    #[validate(custom(function = "crate::routes::types::validate_address"))]
    pub wallet_address: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct UserDetails {
    pub id: String,
    pub wallet_address: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterUserRes {
    pub wallet_address: String,
    pub password: String,
    verified: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct LoginUserReq {
    #[validate(custom(function = "crate::routes::types::validate_address"))]
    pub wallet_address: String,
    pub password: String,
}

pub async fn register_user_handler(
    State(data): State<AppState>,
    Json(payload): Json<RegisterUserReq>,
) -> Result<impl IntoResponse, ApiError> {
    let wallet_address = &payload.wallet_address.to_owned().to_ascii_lowercase();
    let user_exists: Option<bool> =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE wallet_address = $1)")
            .bind(wallet_address)
            .fetch_one(&data.db)
            .await
            .map_err(|e| {
                tracing::error!("Error while getting user from database {}", e.to_string());
                map_sqlx_error(&e)
            })?;

    if let Some(exists) = user_exists {
        if exists {
            return Err(ApiError::Conflict("User with that wallet_address already exists"));
        }
    }

    let salt = SaltString::generate(&mut OsRng);
    let hashed_password = Argon2::default()
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|e| {
            tracing::error!("error while hashing {}", e);
            ApiError::Conflict("Error while hashing password")
        })
        .map(|hash| hash.to_string())?;

    sqlx::query!(
        "INSERT INTO users ( wallet_address, password) VALUES ($1, $2)",
        wallet_address,
        hashed_password
    )
    .fetch_one(&data.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    Ok(StatusCode::OK)
}

pub async fn login_user_handler(
    State(data): State<AppState>,
    Json(payload): Json<LoginUserReq>,
) -> Result<impl IntoResponse, ApiError> {
    let wallet_address = &payload.wallet_address.to_ascii_lowercase();

    let user: UserDetails = sqlx::query_as!(
        UserDetails,
        "SELECT id, wallet_address, password FROM users WHERE wallet_address = $1",
        wallet_address
    )
    .fetch_optional(&data.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or_else(|| ApiError::BadRequest("Invalid wallet_address or password"))?;

    let is_valid = match PasswordHash::new(&user.password) {
        Ok(parsed_hash) => Argon2::default()
            .verify_password(payload.password.as_bytes(), &parsed_hash)
            .map_or(false, |_| true),
        Err(_) => false,
    };

    if !is_valid {
        return Err(ApiError::BadRequest("Invalid wallet_address or password"));
    }

    let now = chrono::Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + Duration::from_secs(3600)).timestamp() as usize;
    let claims: TokenClaims = TokenClaims {
        sub: user.id.to_string(),
        exp,
        iat,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(data.env.jwt_secret.as_ref()),
    )
    .unwrap();

    let cookie = Cookie::build(("token", token.to_owned()))
        .path("/")
        .max_age(time::Duration::hours(1))
        .same_site(SameSite::Lax)
        .http_only(true);

    let mut response = Response::new(json!({"status": "success", "token": token}).to_string());
    response
        .headers_mut()
        .insert(header::SET_COOKIE, cookie.to_string().parse().unwrap());
    Ok(response)
}

pub async fn logout_handler() -> Result<impl IntoResponse, ApiError> {
    let cookie = Cookie::build(("token", ""))
        .path("/")
        .max_age(time::Duration::hours(-1))
        .same_site(SameSite::Lax)
        .http_only(true);

    let mut response = Response::new(json!({"status": "success"}).to_string());
    response
        .headers_mut()
        .insert(header::SET_COOKIE, cookie.to_string().parse().unwrap());
    Ok(response)
}

pub async fn get_me_handler(
    Extension(user): Extension<User>,
) -> Result<impl IntoResponse, ApiError> {
    let json_response = serde_json::json!({
        "status":  "success",
        "data": serde_json::json!({
            "user": &user
        })
    });

    Ok(Json(json_response))
}
