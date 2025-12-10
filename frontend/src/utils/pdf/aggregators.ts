import { HistoryItem } from "@/types/groups";
import { getTokenName, getDecimals } from "./formatters";

export const calculateGlobalTotals = (history: HistoryItem[]) => {
  const totals: { [key: string]: number } = {};
  history.forEach((tx) => {
    const tokenName = getTokenName(tx.token_address);
    const decimals = getDecimals(tokenName);
    const amount = Number(tx.total_amount_paid) / 10 ** decimals;
    totals[tokenName] = (totals[tokenName] || 0) + amount;
  });
  return totals;
};

// Aggregates total received by each member per token
export const calculateMemberStats = (history: HistoryItem[]) => {
  // memberAddress -> { tokenName -> amount }
  const stats: { [memberAddr: string]: { [token: string]: number } } = {};

  history.forEach((tx) => {
    const tokenName = getTokenName(tx.token_address);
    const decimals = getDecimals(tokenName);

    tx.members.forEach((m) => {
      const addr = m.member_address;
      if (!stats[addr]) stats[addr] = {};
      const amount = Number(m.member_amount) / 10 ** decimals;
      stats[addr][tokenName] = (stats[addr][tokenName] || 0) + amount;
    });
  });

  return stats;
};
