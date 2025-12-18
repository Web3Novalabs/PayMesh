import {
  PayoutRecord,
  GroupPayoutRecord,
  CrowdfundingPayoutRecord,
  WeeklyData,
  MonthlyData,
  TokenInfo,
} from "@/types/adminMetrics";

// Token configuration with metadata
export const TOKEN_CONFIG: Record<string, TokenInfo> = {
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8": {
    address:
      "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    symbol: "USDC",
    decimals: 6,
    color: "#2775CA",
  },
  "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8": {
    address:
      "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    symbol: "USDT",
    decimals: 6,
    color: "#26A17B",
  },
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    symbol: "ETH",
    decimals: 18,
    color: "#627EEA",
  },
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d": {
    address:
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    symbol: "STRK",
    decimals: 18,
    color: "#EC796B",
  },
  "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac": {
    address:
      "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
    symbol: "WBTC",
    decimals: 8,
    color: "#F7931A",
  },
};

/**
 * Get ISO week number for a date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Format token amount from smallest unit to human-readable number
 */
export function formatTokenAmount(
  amount: string,
  tokenAddress: string
): number {
  const token = TOKEN_CONFIG[tokenAddress];
  if (!token) return 0;

  const decimals = token.decimals;
  return parseFloat(amount) / Math.pow(10, decimals);
}

/**
 * Get token symbol from address
 */
export function getTokenSymbol(tokenAddress: string): string {
  return TOKEN_CONFIG[tokenAddress]?.symbol || "Unknown";
}

/**
 * Get token color for charts
 */
export function getTokenColor(tokenAddress: string): string {
  return TOKEN_CONFIG[tokenAddress]?.color || "#999999";
}

/**
 * Group payouts by week
 */
export function groupByWeek(
  payouts: (PayoutRecord | GroupPayoutRecord | CrowdfundingPayoutRecord)[]
): WeeklyData[] {
  const weekMap = new Map<string, WeeklyData>();

  payouts.forEach((payout) => {
    const date = new Date(payout.payout_at);
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    const weekKey = `${year}-W${weekNumber}`;

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        week: `Week ${weekNumber}, ${year}`,
        weekNumber,
        year,
        total: 0,
      });
    }

    const weekData = weekMap.get(weekKey)!;
    const tokenSymbol = getTokenSymbol(payout.token_address);
    const amount = formatTokenAmount(payout.amount, payout.token_address);

    weekData[tokenSymbol] = ((weekData[tokenSymbol] as number) || 0) + amount;
    weekData.total += amount;
  });

  return Array.from(weekMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.weekNumber - b.weekNumber;
  });
}

/**
 * Group payouts by month
 */
export function groupByMonth(
  payouts: (PayoutRecord | GroupPayoutRecord | CrowdfundingPayoutRecord)[]
): MonthlyData[] {
  const monthMap = new Map<string, MonthlyData>();

  payouts.forEach((payout) => {
    const date = new Date(payout.payout_at);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthName = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthName,
        year,
        total: 0,
      });
    }

    const monthData = monthMap.get(monthKey)!;
    const tokenSymbol = getTokenSymbol(payout.token_address);
    const amount = formatTokenAmount(payout.amount, payout.token_address);

    monthData[tokenSymbol] = ((monthData[tokenSymbol] as number) || 0) + amount;
    monthData.total += amount;
  });

  return Array.from(monthMap.values()).sort(
    (a, b) => a.year - b.year || a.month.localeCompare(b.month)
  );
}

/**
 * Filter out tokens with zero values from data
 */
export function filterNonZeroTokens<T extends Record<string, unknown>>(
  data: T[]
): T[] {
  if (data.length === 0) return data;

  // Get all token symbols that have non-zero values across all data points
  const tokenSymbols = Object.values(TOKEN_CONFIG).map((t) => t.symbol);
  const activeTokens = new Set<string>();

  data.forEach((item) => {
    tokenSymbols.forEach((symbol) => {
      if (typeof item[symbol] === "number" && (item[symbol] as number) > 0) {
        activeTokens.add(symbol);
      }
    });
  });

  // Filter data to only include active tokens
  return data.map((item) => {
    const filtered: Record<string, unknown> = {};
    Object.keys(item).forEach((key) => {
      if (
        !tokenSymbols.includes(key) ||
        activeTokens.has(key) ||
        key === "total"
      ) {
        filtered[key] = item[key];
      }
    });
    return filtered as T;
  });
}

/**
 * Get list of active token symbols from data
 */
export function getActiveTokens<T extends Record<string, unknown>>(
  data: T[]
): string[] {
  const tokenSymbols = Object.values(TOKEN_CONFIG).map((t) => t.symbol);
  const activeTokens = new Set<string>();

  data.forEach((item) => {
    tokenSymbols.forEach((symbol) => {
      if (typeof item[symbol] === "number" && (item[symbol] as number) > 0) {
        activeTokens.add(symbol);
      }
    });
  });

  return Array.from(activeTokens);
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return formatCurrency(value);
}

/**
 * Group payouts by day of week (for detailed weekly view)
 * Shows Sunday through Saturday for each week
 */
export interface DailyData {
  day: string; // "Sun", "Mon", "Tue", etc.
  date: string; // Full date for reference
  weekNumber: number;
  year: number;
  total: number;
  [key: string]: number | string; // For dynamic token amounts
}

export function groupByDayOfWeek(
  payouts: (PayoutRecord | GroupPayoutRecord | CrowdfundingPayoutRecord)[]
): DailyData[] {
  const dayMap = new Map<string, DailyData>();

  payouts.forEach((payout) => {
    const date = new Date(payout.payout_at);
    const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        day: dayName,
        date: dayKey,
        weekNumber,
        year,
        total: 0,
      });
    }

    const dayData = dayMap.get(dayKey)!;
    const tokenSymbol = getTokenSymbol(payout.token_address);
    const amount = formatTokenAmount(payout.amount, payout.token_address);

    dayData[tokenSymbol] = ((dayData[tokenSymbol] as number) || 0) + amount;
    dayData.total += amount;
  });

  return Array.from(dayMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Get all available weeks from payouts
 */
export function getAvailableWeeks(
  payouts: (PayoutRecord | GroupPayoutRecord | CrowdfundingPayoutRecord)[]
): { weekNumber: number; year: number; label: string }[] {
  const weeks = new Set<string>();

  payouts.forEach((payout) => {
    const date = new Date(payout.payout_at);
    const weekNumber = getWeekNumber(date);
    const year = date.getFullYear();
    weeks.add(`${year}-W${weekNumber}`);
  });

  return Array.from(weeks)
    .map((weekKey) => {
      const [year, week] = weekKey.split("-W");
      const weekNumber = parseInt(week);
      return {
        weekNumber,
        year: parseInt(year),
        label: `Week ${weekNumber}, ${year}`,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.weekNumber - a.weekNumber;
    });
}

/**
 * Get specific week's data
 */
export function getWeekData(
  payouts: (PayoutRecord | GroupPayoutRecord | CrowdfundingPayoutRecord)[],
  weekNumber: number,
  year: number
): DailyData[] {
  const allDays = groupByDayOfWeek(payouts);
  return allDays.filter(
    (day) => day.weekNumber === weekNumber && day.year === year
  );
}
