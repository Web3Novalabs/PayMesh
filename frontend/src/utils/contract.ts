import { useBalance } from "@starknet-react/core";
import { Contract, Account, cairo, uint256, RpcProvider } from "starknet";
// import { useBalance } from "@starknet-react/core";

// // Contract configuration
// export const OLD_CONTRACT_ADDRESS =
//   "0x057500f7e000dafe7350eee771b791a4d885db920539e741f96410e42809a68d";
export const PAYMESH_ADDRESS =
  "0x07c23be2c3882e9f05ff720c4160c001f9b95bdf57a69220c3e2979cb9e00929";
// "0x03eb5cc3d473d59331c48096cafa360d52b49fcd6a08b14a6811223c773a2d73";
// // export const CONTRACT_ADDRESS =
// //   "0x0319c0feb56d2352681e58efc8aefa12efe0389b020efdcf7b822971a999f8c2";
// // ;
export const strkTokenAddress =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export const ONE_STK = 1000000000000000000;
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
  console.log("Input time:", time, "Processed:", epochSeconds);

  const date = new Date(+epochSeconds * 1000); // multiply by 1000 to convert to milliseconds
  console.log("Calculated date:", date);

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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

// // Contract interaction functions
// export const createContractInstance = (account: Account): Contract => {
//   return new Contract(PAYMESH_ABI, PAYMESH_ADDRESS, account);
// };

// export const createGroup = async (
//   account: Account,
//   groupData: CreateGroupData
// ): Promise<{ transaction_hash: string }> => {
//   try {
//     const contract = createContractInstance(account);

//     // Format the data
//     const formattedName = formatByteArray(groupData.name);
//     const formattedAmount = formatU256(groupData.amount);
//     const formattedMembers = formatGroupMembers(groupData.members);

//     console.log("Creating group with data:", {
//       name: formattedName,
//       amount: formattedAmount,
//       members: formattedMembers,
//       tokenAddress: groupData.tokenAddress,
//     });

//     // Call the contract
//     const result = await contract.create_group(
//       formattedName,
//       formattedAmount,
//       formattedMembers,
//       groupData.tokenAddress
//     );

//     console.log("Transaction result:", result);
//     return result;
//   } catch (error) {
//     console.error("Error creating group:", error);
//     throw error;
//   }
// };

// export const getGroup = async (
//   account: Account,
//   groupId: string
// ): Promise<object> => {
//   try {
//     const contract = createContractInstance(account);
//     const formattedGroupId = formatU256(groupId);

//     const result = await contract.get_group(formattedGroupId);
//     console.log("Group data:", result);
//     return result;
//   } catch (error) {
//     console.error("Error getting group:", error);
//     throw error;
//   }
// };

// // Hook for contract interactions
// export const useContract = (account: Account | null) => {
//   const createGroupWithContract = async (groupData: CreateGroupData) => {
//     if (!account) {
//       throw new Error("No account connected");
//     }
//     return await createGroup(account, groupData);
//   };

//   const getGroupWithContract = async (groupId: string) => {
//     if (!account) {
//       throw new Error("No account connected");
//     }
//     return await getGroup(account, groupId);
//   };

//   return {
//     createGroup: createGroupWithContract,
//     getGroup: getGroupWithContract,
//   };
// };

// Balance hook for contract interactions
// export const { data: balance } = useBalance({
//   token:
//     "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d" as `0x${string}`,
//   address: "0x0" as `0x${string}`,
// });
