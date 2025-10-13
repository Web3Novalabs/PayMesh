use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use bigdecimal::BigDecimal;

use crate::{
    libs::{
        auth::AuthApiKey,
        error::{map_sqlx_error, ApiError},
        utopia::CROWD_FUNDING_TAG,
    }, routes::crowd_funding::crowd_funding_types::{
        CreateCrowdFundingRequest, CrowdFunding, CrowdFundingDetails, DonateToCrowdFundingRequest, Donation, PreviousBalance, ResolveCrowdFundingRequest, USDCBalance
    }, util::{
        paymesh_crowd_funding::paymesh_crowd_funding, validate_address::validate_address_api_err
    }, AppState
};

const STRK_TOKEN: &str = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

#[utoipa::path(
    method(get),
    path = "/{crowd_funding_address}",
    responses(
        (status = OK, description = "Success", body = CrowdFundingDetails),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to get crowd funding", body = ApiError),
        (status = NOT_FOUND, description = "Crowd Funding Not Found", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Crowd Funding Address", body = ApiError),
    ),
    tag = CROWD_FUNDING_TAG,
)]
pub async fn get_crowd_funding(
    State(state): State<AppState>,
    Path(crowd_funding_address): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    validate_address_api_err(&crowd_funding_address)?;
    let crowd_funding_address = crowd_funding_address;

    let crowd_funding = sqlx::query_as!(
        CrowdFunding,
        r#"
            SELECT 
                id, 
                name, 
                pool_address, 
                creator_address, 
                target_amount::text as "target_amount!", 
                is_complete
            FROM crowd_funding 
            WHERE pool_address = $1
        "#,
        crowd_funding_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or(ApiError::NotFound("Crowd Funding Not Found"))?;

    let total_donated_usdc: USDCBalance = sqlx::query_as!(
        USDCBalance,
        r#"SELECT total_amount::text as "balance!" FROM crowd_funding_token_balances WHERE crowd_funding_id = $1 AND token_address = $2"#,
        crowd_funding.id,
        STRK_TOKEN
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or(ApiError::NotFound("Crowd Funding Not Found"))?;

    Ok(Json(CrowdFundingDetails {
        crowd_funding,
        usdc_balance: total_donated_usdc,
    }))
}

#[utoipa::path(
    method(post),
    path = "/",
    responses(
        (status = CREATED, description = "Success"),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to create crowd funding", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Request Payload", body = ApiError),
        (status = CONFLICT, description = "Duplicate Crowd Funding", body = ApiError),
    ),
    request_body = CreateCrowdFundingRequest,
    tag = CROWD_FUNDING_TAG,
    security(("api_key" = [])),
)]
pub async fn create_crowd_funding(
    State(state): State<AppState>,
    AuthApiKey(_hello): AuthApiKey,
    Json(payload): Json<CreateCrowdFundingRequest>,
) -> Result<StatusCode, ApiError> {
    let pool_address = payload.pool_address;
    let creator_address = payload.creator_address;
    let name = payload.name;
    let target_amount = payload.target_amount.parse::<BigDecimal>().map_err(|e| {
        tracing::error!("Failed to parse target amount: {}", e);
        ApiError::BadRequest("Invalid target amount")
    })?;

    let mut tx = state.db.begin().await.map_err(|e| {
        tracing::error!("Failed to begin transaction: {}", e);
        ApiError::Internal("Failed to begin transaction")
    })?;

    sqlx::query!(
        r#"INSERT INTO crowd_funding (pool_address, creator_address, name, target_amount) VALUES ($1, $2, $3, $4)"#,
        pool_address,
        creator_address,
        name,
        target_amount
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    tx.commit().await.map_err(|e| {
        tracing::error!("Failed to commit transaction: {}", e);
        ApiError::Internal("Failed to commit transaction")
    })?;

    tracing::info!("Crowd funding created: {}", pool_address);

    Ok(StatusCode::CREATED)
}

#[utoipa::path(
    method(post),
    path = "/{crowd_funding_address}/donate",
    responses(
        (status = OK, description = "Success"),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to donate to crowd funding", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Request Payload", body = ApiError),
        (status = NOT_FOUND, description = "Crowd Funding Not Found", body = ApiError),
        (status = CONFLICT, description = "Duplicate Donation", body = ApiError),
    ),
    request_body = DonateToCrowdFundingRequest,
    tag = CROWD_FUNDING_TAG,
    security(("api_key" = [])),
)]
pub async fn donate_to_crowd_funding(
    State(state): State<AppState>,
    Path(crowd_funding_address): Path<String>,
    Json(payload): Json<DonateToCrowdFundingRequest>,
) -> Result<StatusCode, ApiError> {
    validate_address_api_err(&crowd_funding_address)?;
    let crowd_funding_address = crowd_funding_address;
    let donor_address = payload.donor_address;
    let amount = payload.amount.parse::<BigDecimal>().map_err(|e| {
        tracing::error!("Failed to parse amount: {}", e);
        ApiError::BadRequest("Invalid amount")
    })?;
    let token_address = payload.token_address;
    let transaction_hash = payload.transaction_hash;

    let mut tx = state.db.begin().await.map_err(|e| {
        tracing::error!("Failed to begin transaction: {}", e);
        ApiError::Internal("Failed to begin transaction")
    })?;

    // Check if the crowd funding exists
    let crowd_funding = sqlx::query_as!(
        CrowdFunding,
        r#"SELECT id, name, pool_address, creator_address, target_amount::text as "target_amount!", is_complete FROM crowd_funding WHERE pool_address = $1"#,
        crowd_funding_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or(ApiError::NotFound("Crowd Funding Not Found"))?;

    // Check if the donation already exists
    let donation = sqlx::query_as!(
        Donation,
        r#"SELECT id, crowd_funding_id, donor_address, amount::text as "amount!", token_address, transaction_hash FROM donations WHERE crowd_funding_id = $1 AND donor_address = $2 AND token_address = $3 AND transaction_hash = $4"#,
        crowd_funding.id,
        donor_address,
        token_address,
        transaction_hash
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    if donation.is_some() {
        return Err(ApiError::Conflict("Duplicate Donation"));
    }

    // Insert the donation
    sqlx::query!(
        r#"INSERT INTO donations (crowd_funding_id, donor_address, amount, token_address, transaction_hash) VALUES ($1, $2, $3, $4, $5)"#,
        crowd_funding.id,
        donor_address,
        amount,
        token_address,
        transaction_hash
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    let update_result = sqlx::query!(
        r#"UPDATE crowd_funding_token_balances 
           SET total_amount = total_amount + $1, updated_at = NOW()
           WHERE crowd_funding_id = $2 AND token_address = $3"#,
        amount,
        crowd_funding.id,
        token_address
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    if update_result.rows_affected() == 0 {
        sqlx::query!(
            r#"INSERT INTO crowd_funding_token_balances (crowd_funding_id, token_address, total_amount) 
               VALUES ($1, $2, $3)"#,
            crowd_funding.id,
            token_address,
            amount
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| map_sqlx_error(&e))?;
    }

    tx.commit().await.map_err(|e| {
        tracing::error!("Failed to commit transaction: {}", e);
        ApiError::Internal("Failed to commit transaction")
    })?;

    if crowd_funding.is_complete {
        paymesh_crowd_funding(crowd_funding_address.clone(), state.env.crowd_funding_contract_address.clone()).await?;
    }

    let active_token = sqlx::query_scalar(
        "SELECT token_address FROM supported_crowd_funding_tokens WHERE is_active = true"
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .unwrap_or(String::from(STRK_TOKEN));

    dbg!(format!("active token: {}", active_token));

    let active_token_balance = sqlx::query_as!(
        PreviousBalance,
        r#"SELECT total_amount FROM crowd_funding_token_balances WHERE crowd_funding_id = $1 AND token_address = $2"#,
        crowd_funding.id,
        active_token
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    dbg!(format!("active token balance: {:?}", active_token_balance));

    if let Some(balance) = active_token_balance {
        let target_amount = match crowd_funding.target_amount.parse::<BigDecimal>() {
            Ok(val) => val,
            Err(_) => return Err(ApiError::Internal("Invalid target amount")),
        };

        dbg!(format!("balance: {:?}", balance.total_amount.to_string()));
        dbg!(format!("target amount: {:?}", target_amount.to_string()));

        if balance.total_amount >= target_amount {
            paymesh_crowd_funding(crowd_funding_address.clone(), state.env.crowd_funding_contract_address.clone()).await?;
            tracing::info!("Crowd funding resolved: {}", crowd_funding_address);
        }
    }

    Ok(StatusCode::OK)
}

#[utoipa::path(
    method(post),
    path = "/{crowd_funding_address}/resolve",
    responses(
        (status = OK, description = "Success"),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to resolve crowd funding", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Crowd Funding Address", body = ApiError),
    ),
    tag = CROWD_FUNDING_TAG,
    security(("api_key" = [])),
)]
pub async fn resolve_crowd_funding(
    State(state): State<AppState>,
    Path(crowd_funding_address): Path<String>,
    Json(payload): Json<ResolveCrowdFundingRequest>,
) -> Result<StatusCode, ApiError> {
    validate_address_api_err(&crowd_funding_address)?;
    let crowd_funding_address = crowd_funding_address;
    let amount = payload.amount.parse::<BigDecimal>().map_err(|e| {
        tracing::error!("Failed to parse amount: {}", e);
        ApiError::BadRequest("Invalid amount")
    })?;
    let withdrawn_by = payload.withdrawn_by;
    let token_address = payload.token_address;
    let transaction_hash = payload.transaction_hash;

    let crowd_funding = sqlx::query_as!(
        CrowdFunding,
        r#"SELECT id, name, pool_address, creator_address, target_amount::text as "target_amount!", is_complete FROM crowd_funding WHERE pool_address = $1"#,
        crowd_funding_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or(ApiError::NotFound("Crowd Funding Not Found"))?;

    // insert into withdrawals table
    sqlx::query!(
        r#"INSERT INTO withdrawals (crowd_funding_id, withdrawn_by, token_address, amount, transaction_hash) VALUES ($1, $2, $3, $4, $5)"#,
        crowd_funding.id,
        withdrawn_by,
        token_address,
        amount,
        transaction_hash
    )
    .execute(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    Ok(StatusCode::OK)
}

#[utoipa::path(
    method(get),
    path = "/addresses",
    responses(
        (status = OK, description = "Success", body = Vec<String>),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to get all crowd funding addresses", body = ApiError),
    ),
    tag = CROWD_FUNDING_TAG,
    security(("api_key" = [])),
)]
pub async fn get_all_crowd_funding_addresses(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    let crowd_funding_addresses = sqlx::query_scalar!(r#"SELECT pool_address FROM crowd_funding"#,)
        .fetch_all(&state.db)
        .await
        .map_err(|e| map_sqlx_error(&e))?;

    Ok(Json(crowd_funding_addresses))
}
