use dotenvy::from_filename;

#[derive(Debug, Clone)]
pub enum Network {
    Mainnet,
    Sepolia,
}
#[derive(Clone)]
pub struct Env {
    pub network: Network,
    pub rpc_url: String,
    pub private_key: String,
    pub public_key: String,
    pub contract_address: String,
    pub crowd_funding_contract_address: String,
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_expired_in: String,
    pub jwt_maxage: String,
    pub redis_url: String,
}

impl Env {
    pub fn init(network: Network) -> Env {

         let file = match network {
            Network::Mainnet => ".env.mainnet",
            Network::Sepolia => ".env.sepolia",
        };

        from_filename(file).expect(&format!("Failed to load {}", file));

        let database_url = std::env::var("DATABASE_URL").expect("Database url must be set");
        let rpc_url = std::env::var("RPC_URL").expect("RPC url must be set");
        let private_key = std::env::var("PRIVATE_KEY").expect("Private key must be set");
        let public_key = std::env::var("PUBLIC_KEY").expect("public key must be set");
        let contract_address =
            std::env::var("CONTRACT_ADDRESS").expect("contract address must be set");
        let crowd_funding_contract_address = std::env::var("CROWD_FUNDING_CONTRACT_ADDRESS")
            .expect("crowd funding contract address must be set");
        let jwt_secret = std::env::var("JWT_SECRET").expect("jwt secret must be set");
        let jwt_expired_in = std::env::var("JWT_EXPIRED_IN").expect("jwt secret must be set");
        let jwt_maxage = std::env::var("JWT_MAXAGE").expect("jwt secret must be set");
        let redis_url = std::env::var("REDIS_URL").expect("Redis url must be set");

        Env {
            network,
            rpc_url,
            private_key,
            public_key,
            contract_address,
            crowd_funding_contract_address,
            database_url,
            jwt_secret,
            jwt_expired_in,
            jwt_maxage,
            redis_url,
        }
    }
}
