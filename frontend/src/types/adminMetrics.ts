// Admin Metrics API Response Types

export interface PaymentsTotalsResponse {
  // Group metrics
  total_groups: number;
  total_payments: number;

  // Crowdfunding metrics
  total_crowdfunding_pools: number;
  total_crowdfunding_withdrawals: number;

  // Per token breakdowns - Groups
  total_usdc_paid: string;
  total_usdt_paid: string;
  total_eth_paid: string;
  total_strk_paid: string;
  total_wbtc_paid: string;

  // Per token breakdowns - Crowdfunding pools
  total_usdc_pooled: string;
  total_usdt_pooled: string;
  total_eth_pooled: string;
  total_strk_pooled: string;
  total_wbtc_pooled: string;

  // Combined totals
  total_usdc_combined: string;
  total_usdt_combined: string;
  total_eth_combined: string;
  total_strk_combined: string;
  total_wbtc_combined: string;
}

// Combined payout timeline (groups + crowdfunding)
export interface PayoutTimelineResponse {
  payouts: PayoutRecord[];
}

export interface PayoutRecord {
  payout_at: string;
  source: string; // "group" | "crowdfunding"
  token_address: string;
  amount: string;
}

// Group-specific payout timeline
export interface GroupPayoutTimelineResponse {
  payouts: GroupPayoutRecord[];
}

export interface GroupPayoutRecord {
  payout_at: string;
  group_address: string;
  token_address: string;
  amount: string;
  tx_hash: string;
}

// Crowdfunding-specific payout timeline
export interface CrowdfundingPayoutTimelineResponse {
  payouts: CrowdfundingPayoutRecord[];
}

export interface CrowdfundingPayoutRecord {
  payout_at: string;
  pool_address: string;
  pool_name: string;
  recipient: string;
  token_address: string;
  amount: string;
  transaction_hash: string;
}

// Chart data types
export interface WeeklyData {
  week: string;
  weekNumber: number;
  year: number;
  total: number;
  [key: string]: number | string; // For dynamic token amounts
}

export interface DailyData {
  day: string; // "Sun", "Mon", "Tue", etc.
  date: string; // Full date for reference
  weekNumber: number;
  year: number;
  total: number;
  [key: string]: number | string; // For dynamic token amounts
}

export interface MonthlyData {
  month: string;
  year: number;
  total: number;
  [key: string]: number | string; // For dynamic token amounts
}

// Token metadata
export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  color: string; // For chart colors
}
