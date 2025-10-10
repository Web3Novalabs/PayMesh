use crate::libs::auth::TokenClaims;
use crate::routes::types::{GetProfileResponse, LoginRequest, UserQueryResponse};
use crate::{
    AppState,
    libs::{
        auth::AuthenticatedUser,
        error::{ApiError, map_sqlx_error},
    },
    routes::types::RegisterRequest,
};
use argon2::PasswordVerifier;
use argon2::{Argon2, password_hash};
use argon2::{PasswordHash, PasswordHasher};
use axum::http::{HeaderMap, Response, header};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use axum_extra::extract::cookie::{Cookie, SameSite};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, encode};
use serde_json::json;
use sqlx::types::chrono;
use std::time::Duration;

pub async fn get_profile(
    State(state): State<AppState>,
    AuthenticatedUser(user): AuthenticatedUser,
) -> Result<impl IntoResponse, ApiError> {
    let profile: GetProfileResponse = sqlx::query_as!(
        GetProfileResponse,
        "SELECT email, wallet_address, role FROM users WHERE email = $1",
        user.sub
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    Ok((StatusCode::OK, Json(profile)))
}

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let wallet_address = &payload.wallet_address.to_owned().to_ascii_lowercase();
    let email = &payload.email.to_owned().to_ascii_lowercase();

    let user_exists: Option<bool> =
        sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
            .bind(email)
            .fetch_one(&state.db)
            .await
            .map_err(|e| {
                tracing::error!("Error while getting user from database {}", e.to_string());
                map_sqlx_error(&e)
            })?;

    if let Some(exists) = user_exists {
        if exists {
            return Err(ApiError::Conflict(
                "User with that email address already exists",
            ));
        }
    }

    let salt = password_hash::SaltString::generate(&mut password_hash::rand_core::OsRng);
    let hashed_password = Argon2::default()
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|e| {
            tracing::error!("error while hashing {}", e);
            ApiError::Internal("Error while hashing password")
        })
        .map(|hash| hash.to_string())?;

    sqlx::query!(
        "INSERT INTO users ( email, wallet_address, password) VALUES ($1, $2, $3)",
        email,
        wallet_address,
        hashed_password
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    Ok(StatusCode::OK)
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let email = &payload.email.to_owned().to_ascii_lowercase();

    let user: UserQueryResponse = sqlx::query_as!(
        UserQueryResponse,
        "SELECT email, wallet_address, role, password FROM users WHERE email = $1",
        email
    )
    .fetch_optional(&state.db)
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
        return Err(ApiError::BadRequest("Invalid wallet_address or password"));
    }

    let now = chrono::Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + Duration::from_secs(3600)).timestamp() as usize;
    let claims: TokenClaims = TokenClaims {
        sub: user.email.to_string(),
        role: user.role.to_string(),
        exp,
        iat,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.env.jwt_secret.as_ref()),
    )
    .unwrap();

    let refresh_exp = (now + Duration::from_secs(60 * 60 * 24 * 7)).timestamp() as usize;

    let refresh_claims = TokenClaims {
        sub: user.email.to_string(),
        role: user.role.to_string(),
        exp: refresh_exp,
        iat,
    };

    let refresh_token = encode(
        &Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(state.env.jwt_secret.as_ref()),
    )
    .unwrap();

    let refresh_cookie = Cookie::build(("refresh_token", refresh_token.clone()))
        .path("/")
        .max_age(time::Duration::days(7))
        .same_site(SameSite::Lax)
        .http_only(true);

    let cookie = Cookie::build(("token", token.to_owned()))
        .path("/")
        .max_age(time::Duration::hours(1))
        .same_site(SameSite::Lax)
        .http_only(true);

    let mut response = Response::new(json!({"status": "success", "token": token}).to_string());
    response
        .headers_mut()
        .append(header::SET_COOKIE, cookie.to_string().parse().unwrap());
    response.headers_mut().append(
        header::SET_COOKIE,
        refresh_cookie.to_string().parse().unwrap(),
    );
    Ok(response)
}

pub async fn refresh_token(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    let cookie_header = headers
        .get(header::COOKIE)
        .and_then(|val| val.to_str().ok())
        .unwrap_or("");

    let token = cookie_header.split(';').find_map(|cookie| {
        let cookie = cookie.trim();
        cookie.strip_prefix("token=").map(|v| v.to_string())
    });

    let token = match token {
        Some(t) => t,
        None => return Err(ApiError::Unauthorized("Missing refresh token")),
    };
    let decoding_key = DecodingKey::from_secret(state.env.jwt_secret.as_ref());

    let claims = jsonwebtoken::decode::<TokenClaims>(&token, &decoding_key, &Validation::default())
        .map_err(|_| ApiError::Unauthorized("Invalid or expired refresh token"))?
        .claims;

    let user: UserQueryResponse = sqlx::query_as!(
        UserQueryResponse,
        "SELECT email, wallet_address, role, password FROM users WHERE email = $1",
        claims.sub
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or_else(|| ApiError::BadRequest("Invalid email or password"))?;

    let now = chrono::Utc::now();
    let exp = (now + Duration::from_secs(3600)).timestamp() as usize;
    let new_claims = TokenClaims {
        sub: claims.sub,
        role: claims.role,
        iat: now.timestamp() as usize,
        exp,
    };

    let new_token = encode(
        &Header::default(),
        &new_claims,
        &EncodingKey::from_secret(state.env.jwt_secret.as_ref()),
    )
    .unwrap();

    let access_cookie = Cookie::build(("token", new_token.clone()))
        .path("/")
        .max_age(time::Duration::hours(1))
        .same_site(SameSite::Lax)
        .http_only(true);

    let mut response = Response::new(json!({"token": new_token}).to_string());
    response.headers_mut().insert(
        header::SET_COOKIE,
        access_cookie.to_string().parse().unwrap(),
    );

    Ok(response)
}

pub async fn logout(
    AuthenticatedUser(_user): AuthenticatedUser,
) -> Result<impl IntoResponse, ApiError> {
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
