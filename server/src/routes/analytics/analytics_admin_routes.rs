use axum::{
    Json,
    extract::{Query, State},
};
use bigdecimal::BigDecimal;

use crate::{
    AppState,
    libs::{
        auth::AdminUser,
        error::{ApiError, map_sqlx_error},
        utopia::ADMIN_TAG,
    },
    routes::analytics::analytics_type::{
        AnalyticsItem, AnalyticsRow, DisbursedResponse, DisbursedVolumeRequest, FlowDirection,
        VolumeDetails, VolumeRequest, VolumeSource,
    },
    util::validate_address::validate_date,
};
use sqlx::Arguments;

#[utoipa::path(
    method(get),
    description = "Get volume processed",
    path = "/volume",
    responses(
        (status = OK, description = "Success", body = VolumeDetails),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to get crowd funding", body = ApiError),
        (status = NOT_FOUND, description = "Crowd Funding Not Found", body = ApiError),
        (status = BAD_REQUEST, description = "Invalid Crowd Funding Address", body = ApiError),
    ),
    params(
        VolumeRequest,
    ),
    tag = ADMIN_TAG,
    security(
        ("bearer" = [])
    )
)]
pub async fn get_volume(
    State(state): State<AppState>,
    // AdminUser(_hello): AdminUser,
    Query(params): Query<VolumeRequest>,
) -> Result<Json<Vec<AnalyticsItem>>, ApiError> {
    let volume_source_payments_group_inflow = "
                SELECT token_address, token_amount, created_at::timestamptz AS time, 'payment_group_in' AS source
            FROM group_tx_hashes";

    let volume_source_payments_group_outflow = "
            SELECT token_address, amount AS token_amount, paid_at::timestamptz AS time, 'payment_group_out' AS source
            FROM payments
    ";

    let volume_source_crowdfunding_inflow = "
                SELECT token_address, amount AS token_amount, created_at::timestamptz AS time, 'crowdfunding_in' AS source
            FROM donations
    ";
    let volume_source_crowdfunding_outflow = "
                       SELECT token_address, amount AS token_amount, created_at::timestamptz AS time, 'crowdfunding_out' AS source
            FROM withdrawals
    ";

    let union_all = " UNION ALL ";

    let volume_source = params.sources.clone().unwrap_or(VolumeSource::Both);

    let flow_direction = params.direction.clone().unwrap_or(FlowDirection::Both);

    let mut base_sql_command = String::from(
        "SELECT *
        FROM (

        ",
    );

    let mut _i: i32 = 1;
    let mut args: sqlx::postgres::PgArguments = sqlx::postgres::PgArguments::default();

    match volume_source {
        VolumeSource::PaymentGroup => match flow_direction {
            FlowDirection::Inflow => {
                base_sql_command.push_str(volume_source_payments_group_inflow);
            }
            FlowDirection::Outflow => {
                base_sql_command.push_str(volume_source_payments_group_outflow);
            }
            FlowDirection::Both => {
                base_sql_command.push_str(volume_source_payments_group_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_payments_group_outflow);
            }
        },
        VolumeSource::Crowdfunding => match flow_direction {
            FlowDirection::Inflow => {
                base_sql_command.push_str(volume_source_crowdfunding_inflow);
            }
            FlowDirection::Outflow => {
                base_sql_command.push_str(volume_source_crowdfunding_outflow);
            }
            FlowDirection::Both => {
                base_sql_command.push_str(volume_source_crowdfunding_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_outflow);
            }
        },
        VolumeSource::Both => match flow_direction {
            FlowDirection::Inflow => {
                base_sql_command.push_str(volume_source_payments_group_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_inflow);
            }
            FlowDirection::Outflow => {
                base_sql_command.push_str(volume_source_payments_group_outflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_outflow);
            }
            FlowDirection::Both => {
                base_sql_command.push_str(volume_source_payments_group_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_payments_group_outflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_inflow);
                base_sql_command.push_str(union_all);
                base_sql_command.push_str(volume_source_crowdfunding_outflow);
            }
        },
    }

    base_sql_command.push_str(") AS all_tx");

    if let (Some(from), Some(to)) = (params.from.as_ref(), params.to.as_ref()) {
        validate_date(&from)?;
        validate_date(&to)?;
        base_sql_command.push_str(&format!(
            " WHERE time BETWEEN ${}::timestamptz AND ${}::timestamptz",
            _i,
            _i + 1
        ));
        args.add(from.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        args.add(to.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        _i += 2;
    } else if let Some(from) = params.from.as_ref() {
        validate_date(&from)?;
        base_sql_command.push_str(&format!(" WHERE time >= ${}::timestamptz", _i));
        args.add(from.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        _i += 1;
    } else if let Some(to) = params.to.as_ref() {
        validate_date(&to)?;
        base_sql_command.push_str(&format!(" WHERE time <= ${}::timestamptz", _i));
        args.add(to.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        _i += 1;
    }

    if let Some(token) = params.token.as_ref() {
        if _i == 1 {
            base_sql_command.push_str(&format!(" WHERE token_address = ${}", _i));
        } else {
            base_sql_command.push_str(&format!(" AND token_address = ${}", _i));
        }
        args.add(token.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        _i += 1;
    }
    base_sql_command.push_str(" ORDER BY time DESC;");

    // println!("params: {:?}", &params);
    // println!("SQL COMMAND: {}", &base_sql_command);
    // println!("ARGS: {:?}", &args);

    let rows: Vec<AnalyticsRow> = sqlx::query_as_with(&base_sql_command, args)
        .fetch_all(&state.db)
        .await
        .map_err(|e| {
            dbg!(&e);
            map_sqlx_error(&e)
        })?;

    let items: Vec<AnalyticsItem> = rows
        .into_iter()
        .map(
            |(token_address, token_amount, time, source)| AnalyticsItem {
                token_address: token_address,
                token_amount: BigDecimal::to_string(&token_amount),
                time: time.to_rfc3339(),
                source: source,
            },
        )
        .collect();

    Ok(Json(items))
}

#[utoipa::path(
    method(get),
    description = "Get total disbursed volume",
    path = "/disbursed-volume",
    responses(
        (status = OK, description = "Success", body = Vec<DisbursedResponse>),
        (status = INTERNAL_SERVER_ERROR, description = "Database Error | Failed to get disbursed volume", body = ApiError),
    ),
    params(
        DisbursedVolumeRequest,
    ),
    tag = ADMIN_TAG,
    security(
        ("bearer" = [])
    )
)]
pub async fn get_disbursed_volume(
    State(state): State<AppState>,
    Query(params): Query<DisbursedVolumeRequest>,
) -> Result<Json<Vec<DisbursedResponse>>, ApiError> {
    let payment_group_disbursement = "
        SELECT token_address, amount AS token_amount, paid_at::timestamptz AS time
        FROM payments
    ";

    let crowdfunding_disbursement = "
        SELECT token_address, amount AS token_amount, created_at::timestamptz AS time
        FROM withdrawals
    ";

    let union_all = " UNION ALL ";

    let volume_source = params.sources.clone().unwrap_or(VolumeSource::Both);

    let mut base_sql = String::from(
        "SELECT token_address, SUM(token_amount) AS token_amount
         FROM (",
    );

    match volume_source {
        VolumeSource::PaymentGroup => {
            base_sql.push_str(payment_group_disbursement);
        }
        VolumeSource::Crowdfunding => {
            base_sql.push_str(crowdfunding_disbursement);
        }
        VolumeSource::Both => {
            base_sql.push_str(payment_group_disbursement);
            base_sql.push_str(union_all);
            base_sql.push_str(crowdfunding_disbursement);
        }
    }

    base_sql.push_str(") AS disbursements");

    let mut args = sqlx::postgres::PgArguments::default();
    let mut i: i32 = 1;
    let mut has_where = false;

    // Date filters
    if let (Some(from), Some(to)) = (params.from.as_ref(), params.to.as_ref()) {
        validate_date(from)?;
        validate_date(to)?;

        base_sql.push_str(&format!(
            " WHERE time BETWEEN ${}::timestamptz AND ${}::timestamptz",
            i,
            i + 1
        ));

        args.add(from.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        args.add(to.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        i += 2;
        has_where = true;
    } else if let Some(from) = params.from.as_ref() {
        validate_date(from)?;

        base_sql.push_str(&format!(" WHERE time >= ${}::timestamptz", i));

        args.add(from.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        i += 1;
        has_where = true;
    } else if let Some(to) = params.to.as_ref() {
        validate_date(to)?;

        base_sql.push_str(&format!(" WHERE time <= ${}::timestamptz", i));

        args.add(to.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        i += 1;
        has_where = true;
    }

    // Token filter
    if let Some(token) = params.token.as_ref() {
        if has_where {
            base_sql.push_str(&format!(" AND token_address = ${}", i));
        } else {
            base_sql.push_str(&format!(" WHERE token_address = ${}", i));
        }

        args.add(token.clone())
            .map_err(|_| ApiError::Internal("Failed to add limit arg"))?;
        i += 1;
    }

    base_sql.push_str(" GROUP BY token_address;");

    let rows: Vec<(String, BigDecimal)> = sqlx::query_as_with(&base_sql, args)
        .fetch_all(&state.db)
        .await
        .map_err(|e| {
            dbg!(&e);
            map_sqlx_error(&e)
        })?;

    let response = rows
        .into_iter()
        .map(|(token_address, token_amount)| DisbursedResponse {
            token_address,
            token_amount: token_amount.to_string(),
        })
        .collect();

    Ok(Json(response))
}
