use std::time::Duration;

use serde::{Deserialize, Serialize};

use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use axum::{
    Extension, Json,
    extract::State,
    http::{Response, header},
    response::IntoResponse,
};
use axum_extra::extract::cookie::{Cookie, SameSite};
use jsonwebtoken::{EncodingKey, Header, encode};
use serde_json::json;
use sqlx::types::chrono;

use crate::{
    libs::{auth::User, error::{map_sqlx_error, ApiError}}, AppState
};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub iat: usize,
    pub exp: usize,
}

#[derive(Debug, Deserialize)]
pub struct RegisterUserReq {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct UserDetails {
    pub id: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterUserRes {
    pub email: String,
    pub password: String,
    verified: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginUserReq {
    pub email: String,
    pub password: String,
}

pub async fn register_user_handler(
    State(data): State<AppState>,
    Json(payload): Json<RegisterUserReq>,
) -> Result<impl IntoResponse, ApiError> {
    let email = &payload.email.to_owned().to_ascii_lowercase();
    let user_exists: Option<bool> =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
            .bind(email)
            .fetch_one(&data.db)
            .await
            .map_err(|e| {
                tracing::error!("Error while getting user from database {}", e.to_string());
                map_sqlx_error(&e)
            })?;

    if let Some(exists) = user_exists {
        if exists {
            return Err(ApiError::Conflict("User with that email already exists"));
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

    let user: RegisterUserRes = sqlx::query_as!(
        RegisterUserRes,
        "INSERT INTO users ( email, password) VALUES ($1, $2) RETURNING email, password, verified",
        email,
        hashed_password
    )
    .fetch_one(&data.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    Ok(Json(user))
}

pub async fn login_user_handler(
    State(data): State<AppState>,
    Json(payload): Json<LoginUserReq>,
) -> Result<impl IntoResponse, ApiError> {
    let email = &payload.email.to_ascii_lowercase();

    let user: UserDetails = sqlx::query_as!(
        UserDetails,
        "SELECT id, email, password FROM users WHERE email = $1",
        email
    )
    .fetch_optional(&data.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or_else(|| ApiError::BadRequest("Invalid email or password"))?;

    let is_valid = match PasswordHash::new(&user.password) {
        Ok(parsed_hash) => Argon2::default()
            .verify_password(payload.password.as_bytes(), &parsed_hash)
            .map_or(false, |_| true),
        Err(_) => false,
    };

    if !is_valid {
        return Err(ApiError::BadRequest("Invalid email or password"));
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
