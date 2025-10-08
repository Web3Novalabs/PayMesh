use crate::libs::auth::{AdminUser, TokenClaims};
use crate::libs::utopia::USER_TAG;
use crate::util::hash_api_key::hash_api_key;
use crate::util::validate_address::validate_address;
use crate::{
    AppState,
    libs::{
        auth::AuthenticatedUser,
        error::{ApiError, map_sqlx_error},
    },
};
use argon2::PasswordVerifier;
use argon2::{Argon2, password_hash};
use argon2::{PasswordHash, PasswordHasher};
use axum::http::{HeaderMap, Response, header};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use axum_extra::extract::cookie::{Cookie, SameSite};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, encode};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::types::{chrono};
use uuid::Uuid;
use std::time::Duration;
use utoipa::ToSchema;
use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;
use validator::Validate;

pub fn router() -> OpenApiRouter<AppState> {
    let user: OpenApiRouter<AppState> = OpenApiRouter::new()
        .routes(routes!(get_profile))
        .routes(routes!(register))
        .routes(routes!(login))
        .routes(routes!(generate_api_key))
        .routes(routes!(refresh_token))
        .routes(routes!(logout));

    user
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct RegisterRequest {
    #[validate(email)]
    pub email: String,
    #[validate(custom(function = "validate_address"))]
    pub wallet_address: Option<String>,
    #[validate(length(min = 8))]
    pub password: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct GetProfileResponse {
    pub email: String,
    pub wallet_address: Option<String>,
    pub role: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8))]
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UserQueryResponse {
    pub email: String,
    pub wallet_address: Option<String>,
    pub password: String,
    pub role: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct GenerateApiRequest {
    pub name: String,
}

#[utoipa::path(
    method(get),
    path = "/profile",
    responses(
        (status = OK, description = "Success", body = GetProfileResponse),
        (status = UNAUTHORIZED, description = "Unauthorized", body = ApiError),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error", body = ApiError)
    ), tag= USER_TAG,
    security(("bearer" = [])),
)]
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

#[utoipa::path(
    post,
    path = "/register",
    request_body = RegisterRequest,
    responses(
        (status = CREATED, description = "User registered successfully"),
        (status = BAD_REQUEST, description = "Invalid Request Data", body = ApiError),
        (status = CONFLICT, description = "Duplicate Data (User with this email already exists)", body = ApiError),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error", body = ApiError)
    ),
    tag = USER_TAG
)]
pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let wallet_address = payload
        .wallet_address
        .unwrap_or_default()
        .to_ascii_lowercase();
    let email = payload.email.to_ascii_lowercase();

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
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error while inserting user to database {}", e.to_string());
        map_sqlx_error(&e)
    })?;

    Ok(StatusCode::CREATED)
}

#[utoipa::path(
    method(post),
    path = "/login",
    responses(
        (status = OK, description = "Success", body = String),
        (status = BAD_REQUEST, description = "Invalid email or password", body = ApiError),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Login error", body = ApiError),
    ),
    tag = USER_TAG,
    request_body = LoginRequest,
)]
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
        return Err(ApiError::BadRequest("Invalid email or password"));
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
    .map_err(|_| ApiError::Internal("Login error"))?;

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
    .map_err(|_| ApiError::Internal("Login error"))?;

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

    let mut response: Response<String> = Response::new(json!({"status": "success", "token": token}).to_string());
    response.headers_mut().append(
        header::SET_COOKIE,
        cookie
            .to_string()
            .parse()
            .map_err(|_| ApiError::Internal("Login error"))?,
    );
    response.headers_mut().append(
        header::SET_COOKIE,
        refresh_cookie
            .to_string()
            .parse()
            .map_err(|_| ApiError::Internal("Login error"))?,
    );
    Ok(response)
}

#[utoipa::path(
    method(post),
    path = "/refresh",
    responses(
        (status = OK, description = "Success"),
        (status = UNAUTHORIZED, description = "Invalid or expired refresh token", body = ApiError),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Refresh token error", body = ApiError),
        (status = BAD_REQUEST, description = "User not found", body = ApiError),
    ),
    tag = USER_TAG,
    security(("bearer" = [])),
)]
pub async fn refresh_token(
    headers: HeaderMap,
    AuthenticatedUser(_user): AuthenticatedUser,
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
    .ok_or_else(|| ApiError::BadRequest("User not found"))?;

    let now = chrono::Utc::now();
    let exp = (now + Duration::from_secs(3600)).timestamp() as usize;
    let new_claims = TokenClaims {
        sub: user.email,
        role: user.role,
        iat: now.timestamp() as usize,
        exp,
    };

    let new_token = encode(
        &Header::default(),
        &new_claims,
        &EncodingKey::from_secret(state.env.jwt_secret.as_ref()),
    )
    .map_err(|_| ApiError::Internal("Refresh token error"))?;

    let access_cookie = Cookie::build(("token", new_token.clone()))
        .path("/")
        .max_age(time::Duration::hours(1))
        .same_site(SameSite::Lax)
        .http_only(true);

    let mut response = Response::new(json!({"token": new_token}).to_string());
    response.headers_mut().insert(
        header::SET_COOKIE,
        access_cookie
            .to_string()
            .parse()
            .map_err(|_| ApiError::Internal("Refresh token error"))?,
    );

    Ok(response)
}

#[utoipa::path(
    method(post),
    path = "/logout",
    responses(
        (status = OK, description = "Success"),
        (status = INTERNAL_SERVER_ERROR, description = "Logout error", body = ApiError),
    ),
    tag = USER_TAG,
    security(("bearer" = [])),
)]
pub async fn logout(
    AuthenticatedUser(_user): AuthenticatedUser,
) -> Result<impl IntoResponse, ApiError> {
    let cookie = Cookie::build(("token", ""))
        .path("/")
        .max_age(time::Duration::hours(-1))
        .same_site(SameSite::Lax)
        .http_only(true);

    let mut response = Response::new(json!({"status": "success"}).to_string());
    response.headers_mut().insert(
        header::SET_COOKIE,
        cookie
            .to_string()
            .parse()
            .map_err(|_| ApiError::Internal("Logout error"))?,
    );
    Ok(response)
}

// generates an api key for admin
#[utoipa::path(
    method(post),
    path = "/generate_api_key",
    request_body = GenerateApiRequest,
    responses(
        (status = OK, description = "Success", body = String),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to generate api key", body = ApiError),
    ),
    tag = USER_TAG,
    security(("bearer" = [])),
)]
async fn generate_api_key(
    State(state): State<AppState>,
    AdminUser(user): AdminUser,
    Json(payload): Json<GenerateApiRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let api_key = Uuid::new_v4().to_string();
    let api_key_hash = hash_api_key(&api_key);
    let name = payload.name.to_ascii_lowercase();

    sqlx::query!(
        "INSERT INTO api_keys (name, user_email, api_key_hash) VALUES ($1, $2, $3)",
        name,
        user.sub,
        api_key_hash
    )
    .execute(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    Ok((StatusCode::OK, Json(api_key)))
}

