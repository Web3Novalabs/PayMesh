import { TOKEN_MAP } from "./config";

export const getTokenName = (address: string) =>
  TOKEN_MAP[address] || "Unknown";

export const getDecimals = (tokenName: string) => {
  if (["USDC", "USDT"].includes(tokenName)) return 6;
  if (["ETH", "WBTC", "STRK"].includes(tokenName)) return 18;
  return 18;
};

export const formatAmount = (amount: string, tokenName: string) => {
  const decimals = getDecimals(tokenName);
  const val = Number(amount) / 10 ** decimals;

  if (tokenName === "ETH" || tokenName === "WBTC") {
    return val.toFixed(6);
  }
  return val.toFixed(2);
};

export const formatMemberAmount = (amount: string, tokenName: string) => {
  return formatAmount(amount, tokenName);
};
