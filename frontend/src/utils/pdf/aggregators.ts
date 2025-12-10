import { GroupDetails } from "@/types/groups";
import { getTokenName, getDecimals } from "./formatters";

export const calculateGlobalTotals = (history: GroupDetails["history"]) => {
  const totals: Record<string, number> = {};
  history.forEach((item) => {
    const tokenName = getTokenName(item.token_address);
    const decimals = getDecimals(tokenName);
    const amount = parseFloat(item.total_amount_paid) / Math.pow(10, decimals);
    totals[tokenName] = (totals[tokenName] || 0) + amount;
  });
  return totals;
};

export type MemberStats = {
  address: string;
  percentage: string;
  tokens: Record<string, number>;
};

export const calculateMemberStats = (history: GroupDetails["history"]) => {
  const memberMap = new Map<string, MemberStats>();

  history.forEach((item) => {
    const tokenName = getTokenName(item.token_address);
    const decimals = getDecimals(tokenName);

    item.members.forEach((m) => {
      if (!memberMap.has(m.member_address)) {
        memberMap.set(m.member_address, {
          address: m.member_address,
          percentage: m.member_percentage,
          tokens: {},
        });
      }
      const stats = memberMap.get(m.member_address)!;
      stats.percentage = m.member_percentage;

      const amount = parseFloat(m.member_amount) / Math.pow(10, decimals);
      stats.tokens[tokenName] = (stats.tokens[tokenName] || 0) + amount;
    });
  });

  return Array.from(memberMap.values());
};
