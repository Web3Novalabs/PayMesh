// Admin Metrics API Response Types

export interface PayoutRecord {
  payout_at: string;
  source: string; // "group" | "crowdfunding"
  token_address: string;
  amount: string;
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
