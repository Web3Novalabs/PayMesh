use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use bigdecimal::BigDecimal;

use crate::{
    AppState,
    libs::{
        auth::AuthApiKey,
        error::{ApiError, map_sqlx_error},
        utopia::CROWD_FUNDING_TAG,
    },
    routes::crowd_funding::crowd_funding_types::{
        CreateCrowdFundingRequest, CrowdFunding, CrowdFundingDetails, DonateToCrowdFundingRequest,
        Donation, DonationDetails, PreviousBalance, ResolveCrowdFundingRequest, TokenBalance,
        UpdateCrowdFundingRequest,
    },
    util::{
        paymesh_crowd_funding::paymesh_crowd_funding, validate_address::validate_address_api_err,
    },
};

const USDC_TOKEN: &str = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

#[utoipa::path(
    method(get),
    description = "Get details of a specific crowd funding campaign by its address",
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
                is_complete,
                description
            FROM crowd_funding 
            WHERE pool_address = $1
        "#,
        crowd_funding_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or(ApiError::NotFound("Crowd Funding Not Found"))?;

    let total_donated_tokens: Vec<TokenBalance> = sqlx::query_as!(
        TokenBalance,
        r#"SELECT token_address, total_amount::text as "balance!" FROM crowd_funding_token_balances WHERE crowd_funding_id = $1"#,
        crowd_funding.id
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    // get the total donation and the total number of people that donated
    let donation_details = sqlx::query_as!(
        DonationDetails,
        r#"SELECT COUNT(DISTINCT donor_address) as "total_donors!", COUNT(*) as "total_numbers_of_donations!" FROM donations WHERE crowd_funding_id = $1"#,
        crowd_funding.id
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    Ok(Json(CrowdFundingDetails {
        crowd_funding,
        token_history: total_donated_tokens,
        donation_count: donation_details,
    }))
}

#[utoipa::path(
    method(post),
    description = "Create a new crowd funding campaign",
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
    AuthApiKey: AuthApiKey,
    Json(payload): Json<CreateCrowdFundingRequest>,
) -> Result<StatusCode, ApiError> {
    let pool_address = payload.pool_address;
    let creator_address = payload.creator_address;
    let name = payload.name;
    let description = payload.description;
    let target_amount = payload.target_amount.parse::<BigDecimal>().map_err(|e| {
        tracing::error!("Failed to parse target amount: {}", e);
        ApiError::BadRequest("Invalid target amount")
    })?;

    let mut tx = state.db.begin().await.map_err(|e| {
        tracing::error!("Failed to begin transaction: {}", e);
        ApiError::Internal("Failed to begin transaction")
    })?;

    sqlx::query!(
        r#"INSERT INTO crowd_funding (pool_address, creator_address, name, target_amount,description) VALUES ($1, $2, $3, $4, $5)"#,
        pool_address,
        creator_address,
        name,
        target_amount,
        description
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
    method(put),
    description = "Update crowd funding campaign name and description",
    path = "/{crowd_funding_address}",
    params(
        ("crowd_funding_address" = String, Path, description = "Pool address of crowd funding"),
    ),
    responses(
        (status = OK, description = "Success", body = CrowdFundingDetails),
        (status = NOT_FOUND, description = "Crowd funding not found", body = ApiError),
        (status = FORBIDDEN, description = "Only creator can update", body = ApiError),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error", body = ApiError),
    ),
    request_body = UpdateCrowdFundingRequest,
    tag = CROWD_FUNDING_TAG,
    security(("api_key" = [])),
)]

pub async fn update_crowd_funding(
    State(state): State<AppState>,
    // AuthApiKey: AuthApiKey,
    Path(pool_address): Path<String>,
    Json(payload): Json<UpdateCrowdFundingRequest>,
) -> Result<StatusCode, ApiError> {
    let mut tx = state.db.begin().await.map_err(|e| {
        tracing::error!("Failed to begin transaction: {}", e);
        ApiError::Internal("Failed to begin transaction")
    })?;

    let existing_row = sqlx::query!(
        r#"SELECT id, name, pool_address, creator_address, target_amount::TEXT as "target_amount!", is_complete, description 
           FROM crowd_funding WHERE pool_address = $1"#,
        &pool_address
    )
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    let existing = if let Some(row) = existing_row {
        CrowdFunding {
            id: row.id,
            name: row.name,
            pool_address: row.pool_address,
            creator_address: row.creator_address,
            target_amount: row.target_amount,
            is_complete: row.is_complete,
            description: row.description,
        }
    } else {
        return Err(ApiError::NotFound("Crowd funding not found"));
    };

    // is requester creator
    if existing.creator_address != payload.creator_address {
        return Err(ApiError::Unauthorized("Only creator can update"));
    }

    // update pool
    sqlx::query!(
        r#"
        UPDATE crowd_funding 
        SET name = $2, description = $3
        WHERE pool_address = $1
        RETURNING id, name, pool_address, creator_address, target_amount::TEXT as "target_amount!", is_complete, description
        "#,
        &pool_address,
        &payload.name,
        &payload.description
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    tx.commit().await.map_err(|e| {
        tracing::error!("Failed to commit transaction: {}", e);
        ApiError::Internal("Failed to commit transaction")
    })?;

    tracing::info!(
        "Crowd funding updated: pool={}, by={}",
        pool_address,
        payload.creator_address
    );

    Ok(StatusCode::OK)
}

#[utoipa::path(
    method(post),
    description = "Donate to a specific crowd funding campaign",
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
    AuthApiKey: AuthApiKey,
    Json(payload): Json<DonateToCrowdFundingRequest>,
) -> Result<StatusCode, ApiError> {
    validate_address_api_err(&crowd_funding_address)?;
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

    let crowd_funding = sqlx::query_as!(
        CrowdFunding,
        r#"SELECT id, name, pool_address, creator_address, target_amount::text as "target_amount!", is_complete , description FROM crowd_funding WHERE pool_address = $1"#,
        crowd_funding_address
    )
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or(ApiError::NotFound("Crowd Funding Not Found"))?;

    let donation = sqlx::query_as!(
        Donation,
        r#"SELECT id, crowd_funding_id, donor_address, amount::text as "amount!", token_address, transaction_hash FROM donations WHERE crowd_funding_id = $1 AND donor_address = $2 AND token_address = $3 AND transaction_hash = $4"#,
        crowd_funding.id,
        donor_address,
        token_address,
        transaction_hash
    )
    .fetch_optional(&mut *tx)
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

    sqlx::query!(
        r#"
    INSERT INTO crowd_funding_token_balances (crowd_funding_id, token_address, total_amount)
    VALUES ($1, $2, $3)
    ON CONFLICT (crowd_funding_id, token_address)
    DO UPDATE SET
        total_amount = crowd_funding_token_balances.total_amount + EXCLUDED.total_amount,
        updated_at = NOW()
    "#,
        crowd_funding.id,
        token_address,
        amount
    )
    .execute(&mut *tx)
    .await
    .map_err(|e| map_sqlx_error(&e))?;

    if crowd_funding.is_complete {
        paymesh_crowd_funding(
            crowd_funding_address.clone(),
            state.env.crowd_funding_contract_address.clone(),
        )
        .await;
        tracing::info!(
            "Crowd funding already completed: {} Sending tokens",
            crowd_funding_address
        );
    } else {
        tracing::info!("Crowd funding not completed: {}", crowd_funding_address);
        let active_token = sqlx::query_scalar(
            "SELECT token_address FROM supported_crowd_funding_tokens WHERE is_active = true",
        )
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| map_sqlx_error(&e))?
        .unwrap_or(String::from(USDC_TOKEN));

        let active_token_balance = sqlx::query_as!(
        PreviousBalance,
        r#"SELECT total_amount FROM crowd_funding_token_balances WHERE crowd_funding_id = $1 AND token_address = $2 FOR UPDATE"#,
        crowd_funding.id,
        active_token
        )
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| map_sqlx_error(&e))?;

        if let Some(balance) = active_token_balance {
            let target_amount = match crowd_funding.target_amount.parse::<BigDecimal>() {
                Ok(val) => val,
                Err(_) => return Err(ApiError::Internal("Invalid target amount")),
            };
            if balance.total_amount >= target_amount {
                tracing::info!(
                    "Crowd funding target reached: {} Sending tokens",
                    crowd_funding_address
                );
                paymesh_crowd_funding(
                    crowd_funding_address.clone(),
                    state.env.crowd_funding_contract_address.clone(),
                )
                .await;
                sqlx::query!(
                    r#"
                        UPDATE crowd_funding
                        SET is_complete = true
                        WHERE id = $1
                        "#,
                    crowd_funding.id
                )
                .execute(&mut *tx)
                .await
                .map_err(|e| map_sqlx_error(&e))?;
            }
        }
    }

    tx.commit().await.map_err(|e| {
        tracing::error!("Failed to commit transaction: {}", e);
        ApiError::Internal("Failed to commit transaction")
    })?;

    tracing::info!(
        "Donation made to crowd funding {}: {} {}",
        crowd_funding_address,
        amount,
        token_address
    );

    Ok(StatusCode::OK)
}

#[utoipa::path(
    method(post),
    description = "Resolve a crowd funding campaign by withdrawing funds",
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
    AuthApiKey: AuthApiKey,
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
        r#"SELECT id, name, pool_address, creator_address, target_amount::text as "target_amount!", is_complete , description FROM crowd_funding WHERE pool_address = $1"#,
        crowd_funding_address
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| map_sqlx_error(&e))?
    .ok_or(ApiError::NotFound("Crowd Funding Not Found"))?;

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

    tracing::info!(
        "Crowd funding resolved: {} by {} withdrawing {} {}",
        crowd_funding_address,
        withdrawn_by,
        amount,
        token_address
    );

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
