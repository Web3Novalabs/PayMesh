pub mod base {
    pub mod crowd_fund_type;
    pub mod errors;
    pub mod events;
    pub mod types;
}

pub mod interfaces {
    pub mod iautoshare;
    pub mod icrowdfund;
}
pub mod autoshare;
pub mod autoshare_child;
pub mod crowd_fund;
pub mod crowd_fund_child;

pub mod mock_strk;
pub mod mock_usdc;
pub mod mock_usdt;
