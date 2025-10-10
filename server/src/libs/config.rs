#[derive(Clone)]
pub struct Env {
    pub rpc_url: String,
    pub private_key: String,
    pub public_key: String,
    pub contract_address: String,
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_expired_in: String,
    pub jwt_maxage: String,
}

impl Env {
    pub fn init() -> Env {
        let database_url = std::env::var("DATABASE_URL").expect("Database url must be set");
        let rpc_url = std::env::var("RPC_URL").expect("RPC url must be set");
        let private_key = std::env::var("private_key").expect("Private key must be set");
        let public_key = std::env::var("PUBLIC_KEY").expect("public key must be set");
        let contract_address =
            std::env::var("CONTRACT_ADDRESS").expect("contract address must be set");
        let jwt_secret = std::env::var("JWT_SECRET").expect("jwt secret must be set");
        let jwt_expired_in = std::env::var("JWT_EXPIRED_IN").expect("jwt secret must be set");
        let jwt_maxage = std::env::var("JWT_MAXAGE").expect("jwt secret must be set");

        Env {
            rpc_url,
            private_key,
            public_key,
            contract_address,
            database_url,
            jwt_secret,
            jwt_expired_in,
            jwt_maxage,
        }
    }
}
