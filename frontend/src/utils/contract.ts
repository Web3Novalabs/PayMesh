import { useBalance } from "@starknet-react/core";
import { uint256, RpcProvider } from "starknet";

export const PAYMESH_ADDRESS =
  "0x01710ab6e17d6809cd9d5e9b22e6bb1d1d09ca40f50449ea7ac81d67bef80f31";
// "0x01be0fc9d374adc3b63dc87032d5828ed0a73ac0b773d5d611287739e0259d00" // main/major testing contract on mainnet
// "0x011aaf724f9259a5d55fc54f5c40e63b35bb614b492af1a41f137951779c31de";  // new testing contract deploy on 17/12/2025
// "0x03eb5cc3d473d59331c48096cafa360d52b49fcd6a08b14a6811223c773a2d73";
// // export const CONTRACT_ADDRESS =
// //   "0x0319c0feb56d2352681e58efc8aefa12efe0389b020efdcf7b822971a999f8c2";
// // ;
export const strkTokenAddress =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export const USDC_ADDRESS_1 =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
export const USDC_ADDRESS_2 =
  "0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb";

export const USDC_ADDRESSES = [USDC_ADDRESS_1, USDC_ADDRESS_2];

export const isUsdc = (address: string): boolean => {
  if (!address) return false;
  return USDC_ADDRESSES.some((usdcAddr) => compareAddresses(address, usdcAddr));
};

export const ONE_STK = 1000000000000000000;
export const ONE_USDC = 1000000;
export const myProvider = new RpcProvider({
  nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
});

// Types
export interface GroupMember {
  addr: string;
  percentage: number;
}

export interface CreateGroupData {
  name: string;
  amount: string;
  members: GroupMember[];
  tokenAddress: string;
}

// Utility functions
export const formatU256 = (amount: string): { low: string; high: string } => {
  const uint256Value = uint256.bnToUint256(amount);
  return {
    low: uint256Value.low.toString(),
    high: uint256Value.high.toString(),
  };
};

export const formatByteArray = (
  text: string
): { data: string[]; pending_word: string; pending_word_len: number } => {
  // Convert string to byte array format
  const bytes = Array.from(text).map((char) =>
    char.charCodeAt(0).toString(16).padStart(2, "0")
  );
  const chunks = [];

  // Split into 31-byte chunks (bytes31)
  for (let i = 0; i < bytes.length; i += 62) {
    const chunk = bytes.slice(i, i + 62).join("");
    chunks.push(`0x${chunk.padEnd(62, "0")}`);
  }

  return {
    data: chunks,
    pending_word: "0x0",
    pending_word_len: 0,
  };
};

export const formatGroupMembers = (members: GroupMember[]) => {
  return members.map((member) => ({
    addr: member.addr,
    percentage: member.percentage,
  }));
};

export function epocTime(time: string) {
  const epochSeconds = time.replace("n", "");

  const date = new Date(+epochSeconds * 1000); // multiply by 1000 to convert to milliseconds

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function epocTimeReadable(dateString: string) {
  if (!dateString) return "Unknown Date";

  let date: Date;

  // If the date contains "-", it's the ISO format from your API
  if (dateString.includes("-")) {
    date = new Date(dateString);
  } else {
    // Fallback: handle dd/mm/yyyy format
    const parts = dateString.split("/");
    if (parts.length !== 3) return "Invalid date";
    const [day, month, year] = parts.map(Number);
    date = new Date(year, month - 1, day);
  }

  if (isNaN(date.getTime())) return "Invalid date";

  const day = date.getDate();
  const monthName = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${monthName} ${day}${suffix}, ${year}`;
}

export function getTimeFromEpoch(time: string) {
  const epochSeconds = time.replace("n", "");
  const date = new Date(+epochSeconds * 1000);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

// get balance of an address
export const useGetBalance = (userAddress: string) => {
  const { data: balance } = useBalance({
    token:
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d" as `0x${string}`,
    address: userAddress
      ? (userAddress as `0x${string}`)
      : ("0x0" as `0x${string}`),
  });

  return balance;
};

export const normalizeAddress = (address: string): string => {
  // Remove 0x prefix if present
  if (address.length === 66) {
    // console.log("man-2",address.slice(2))
    return `${address.slice(2)}`;
  }
  const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

  // Pad with zeros to make it 64 characters (standard length)
  const paddedAddress = cleanAddress.padStart(64, "0");
  // console.log("man-",paddedAddress);
  // Add back 0x prefix
  return `${paddedAddress}`;
};

export const compareAddresses = (addr1: string, addr2: string): boolean => {
  if (!addr1 || !addr2) return false;
  const normalized1 = normalizeAddress(addr1.toLowerCase());
  const normalized2 = normalizeAddress(addr2.toLowerCase());
  return normalized1 === normalized2;
};

export const checkAddressNetwork = async (address: string) => {
  const mainnetProvider = new RpcProvider({
    nodeUrl:
      "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/l3W2omp97bsZzhe8YXQOU",
  });

  try {
    // Ensure address is properly formatted
    const formattedAddress = address.startsWith("0x")
      ? address
      : `0x${address}`;

    // Try to get nonce - if it works, address exists on mainnet
    const nonce = await mainnetProvider.getNonceForAddress(formattedAddress);

    // console.log(`Mainnet nonce for ${formattedAddress}:`, nonce);

    // If nonce is not "0x0", address exists on mainnet
    if (nonce && nonce !== "0x0") {
      return nonce; // Return the nonce value (like 0x26)
    } else {
      return null; // Address doesn't exist or has no transactions
    }
  } catch (error) {
    if (error instanceof Error) {
      // console.log("Address not found on mainnet:", error.message);
    } else {
      // console.log("Address not found on mainnet:", error);
    }
    return null; // Address doesn't exist on mainnet
  }
};

// export const checkAddressNetwork = async (address: string) => {
//   const ress = await fetch(
//     "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_8/l3W2omp97bsZzhe8YXQOU",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         jsonrpc: "2.0",
//         method: "starknet_getNonce",
//         params: ["latest", address],
//         id: 0,
//       }),
//     }
//   );
//   const data = await ress.json();
//   console.log("DATA FROM NONCE", data);
//   return data;
// };
