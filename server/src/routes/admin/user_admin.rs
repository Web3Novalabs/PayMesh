use axum::{Json, Router, extract::State, http::StatusCode, response::IntoResponse, routing::get};

use crate::{
    AppState,
    libs::{auth::AdminUser, error::ApiError},
    routes::admin::admin_types::{OverviewResponse, User, UserEmailRequest},
};

pub fn router() -> Router<AppState> {
    let user_admin = Router::new()
        // .route("/overview", get(user::get_overview))
        // .route("/promote_to_admin", post(user::promote_to_admin))
        // .route("/demote_from_admin", post(user::demote_from_admin))
        .route("/all_users", get(get_all_users))
        // .route("/change_role", post(user::change_role))
        // .route("/delete_user", post(user::delete_user))
        // .route("/all_wallet_addresses", get(user::get_all_wallet_addresses))
        // .route("/all_emails", get(user::get_all_emails));
    ;
    user_admin
}

pub async fn get_all_users(
    State(state): State<AppState>,
    AdminUser(_user): AdminUser,
) -> Result<impl IntoResponse, ApiError> {
    let users: Vec<User> = sqlx::query_as::<_, User>(r#"SELECT id::text as "id", email, wallet_address, role, created_at::text as "created_at" FROM users"#)
        .fetch_all(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Error while fetching all users: {}", e.to_string());
            ApiError::Internal("Failed to fetch users")
        })?;
    Ok((StatusCode::OK, Json(users)))
}

pub async fn promote_to_admin(
    State(state): State<AppState>,
    AdminUser(_user): AdminUser,
    Json(payload): Json<UserEmailRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let email = &payload.email.trim().to_lowercase();

    let rows_affected = sqlx::query!(r#"UPDATE users SET role = 'admin' WHERE email = $1"#, email)
        .execute(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Error while promoting user to admin: {}", e.to_string());
            ApiError::Internal("Failed to promote user")
        })?
        .rows_affected();

    (rows_affected > 0).then(|| ()).ok_or_else(|| {
        tracing::error!("No user found with email: {}", email);
        ApiError::NotFound("User not found")
    })?;

    tracing::info!("User with email {} promoted to admin", email);

    Ok((StatusCode::OK, "User promoted to admin"))
}

pub async fn demote_from_admin(
    State(state): State<AppState>,
    AdminUser(_user): AdminUser,
    Json(payload): Json<UserEmailRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let email = &payload.email.trim().to_lowercase();

    let rows_affected = sqlx::query!(r#"UPDATE users SET role = 'user' WHERE email = $1"#, email)
        .execute(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Error while demoting user to admin: {}", e.to_string());
            ApiError::Internal("Failed to demote user")
        })?
        .rows_affected();

    (rows_affected > 0).then(|| ()).ok_or_else(|| {
        tracing::error!("No user found with email: {}", email);
        ApiError::NotFound("User not found")
    })?;

    tracing::info!("User with email {} demoted from admin", email);

    Ok((StatusCode::OK, "User demoted from admin"))
}

pub async fn delete_user(
    State(state): State<AppState>,
    AdminUser(_user): AdminUser,
    Json(payload): Json<UserEmailRequest>,
) -> Result<impl IntoResponse, ApiError> {
    let email = &payload.email.trim().to_lowercase();

    sqlx::query!(r#"DELETE FROM public.users WHERE email = $1"#, email)
        .execute(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Error while deleting user: {}", e.to_string());
            ApiError::Internal("Failed to delete user")
        })?;

    tracing::info!("User with email {} deleted", email);

    Ok((StatusCode::OK, "User deleted"))
}

pub async fn get_overview(
    State(state): State<AppState>,
    AdminUser(_user): AdminUser,
) -> Result<impl IntoResponse, ApiError> {
    let total_users: (i64,) = sqlx::query_as(r#"SELECT COUNT(*) FROM users"#)
        .fetch_one(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Error while fetching total users: {}", e.to_string());
            ApiError::Internal("Failed to fetch total users")
        })?;

    let total_admins: (i64,) = sqlx::query_as(r#"SELECT COUNT(*) FROM users WHERE role = 'admin'"#)
        .fetch_one(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Error while fetching total admins: {}", e.to_string());
            ApiError::Internal("Failed to fetch total admins")
        })?;

    let overview = OverviewResponse {
        total_users: total_users.0,
        total_admins: total_admins.0,
    };

    Ok((StatusCode::OK, Json(overview)))
}
