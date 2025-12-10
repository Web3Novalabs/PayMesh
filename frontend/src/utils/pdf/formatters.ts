import { TOKEN_MAP } from "./config";

export const getTokenName = (address: string) => {
  return TOKEN_MAP[address] || address.slice(0, 6) + "...";
};

export const getDecimals = (tokenName: string) => {
  if (tokenName === "USDC" || tokenName === "USDT") return 6;
  if (tokenName === "WBTC") return 8;
  return 18;
};

export const formatAmount = (amount: string, tokenAddress: string) => {
  const tokenName = getTokenName(tokenAddress);
  const decimals = getDecimals(tokenName);

  const value = parseFloat(amount) / Math.pow(10, decimals);
  return `${value.toFixed(2)} ${tokenName}`;
};

export const formatMemberAmount = (amount: string, tokenAddress: string) => {
  const tokenName = getTokenName(tokenAddress);
  const decimals = getDecimals(tokenName);
  const value = parseFloat(amount) / Math.pow(10, decimals);
  return `${value.toFixed(2)} ${tokenName}`;
};
