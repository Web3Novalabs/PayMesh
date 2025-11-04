export const getNetworkColor = (
  mainnet: string,
  sepolia: string,
  chainId?: string
) => {
  if (!chainId) return "text-gray-500";
  if (String(chainId) === sepolia) return "text-orange-600";
  if (String(chainId) === mainnet) return "text-green-600";
  return "text-gray-500";
};

export const getNetworkName = (
  mainnet: string,
  sepolia: string,
  chainId?: string
) => {
  if (!chainId) return "Not Connected";

  if (String(chainId) === sepolia) return "Sepolia Testnet";
  if (String(chainId) === mainnet) return "Mainnet";
  return "Unknown Network";
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const gradientColors = [
  "#BCC0C5",
  "#FF929F",
  "#FFAC92",
  "#FFD392",
  "#92FFB0",
  "#92F2FF",
  "#92CAFF",
  "#A192FF",
  "#DC92FF",
];
// button border gradient
export const gradientStops = gradientColors
  .map((color, index) => {
    const percentage = (index / (gradientColors.length - 1)) * 100;
    return `${color} ${percentage}%`;
  })
  .join(", ");
