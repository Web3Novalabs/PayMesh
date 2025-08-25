import { useAccount, useContract, useReadContract } from "@starknet-react/core";
import { useEffect, useState } from "react";
import {
  CreateGroupData,
  epocTime,
  ONE_STK,
  PAYMESH_ADDRESS,
} from "../utils/contract";
import { Abi } from "starknet";
import { PAYMESH_ABI } from "@/abi/swiftswap_abi";

export function useContractFetch(
  abi: Abi,
  functionName: string,
  args: [string | number]
) {
  const {
    data: readData,
    refetch: dataRefetch,
    isError: readIsError,
    isLoading: readIsLoading,
    error: readError,
    isFetching: readRefetching,
  } = useReadContract({
    abi: abi,
    functionName: functionName,
    address: PAYMESH_ADDRESS,
    args: args,
    refetchInterval: 600000,
  });

  return {
    readData,
    dataRefetch,
    readIsError,
    readIsLoading,
    readError,
    readRefetching,
  };
}

export const useContractInteraction = () => {
  const { account } = useAccount();

  const { contract } = useContract({
    address:
      "0x049dba901f9a9c50509c070c47f37d191783b24ec8021b06ec5d8464af827918",
    abi: [
      {
        type: "function",
        name: "create_group",
        inputs: [
          { name: "name", type: "core::byte_array::ByteArray" },
          { name: "amount", type: "core::integer::u256" },
          {
            name: "members",
            type: "core::array::Array::<contract::base::types::GroupMember>",
          },
          {
            name: "token_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
    ],
  });

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const createGroup = async (groupData: CreateGroupData) => {
    if (!account || !contract) {
      throw new Error("No account or contract connected");
    }

    setIsCreatingGroup(true);
    try {
      // Format the data for the contract call
      const { formatU256 } = await import("../utils/contract");

      const formattedAmount = formatU256(groupData.amount);

      // Format members as proper Cairo structs
      const formattedMembers = groupData.members.map((member) => ({
        addr: member.addr,
        percentage: member.percentage,
      }));

      console.log("Creating group with data:", {
        name: groupData.name,
        amount: formattedAmount,
        members: formattedMembers,
        tokenAddress: groupData.tokenAddress,
      });

      const result = await contract.create_group(
        groupData.name, // Pass name as string directly
        formattedAmount,
        formattedMembers,
        groupData.tokenAddress
      );

      console.log("Transaction result:", result);
      return result;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return {
    createGroup,
    isCreatingGroup,
    account,
  };
};

export function useGetAllGroups() {
  interface GroupData {
    creator: string;
    date: string;
    name: string;
    id: string;
    usage_limit_reached: boolean;
    groupAddress: string;
    amount: number;
  }

  const [transaction, setTransaction] = useState<GroupData[] | undefined>(
    undefined
  );
  const { readData: groupList } = useContractFetch(
    PAYMESH_ABI,
    "get_all_groups",
    // @ts-expect-error array need to be empty
    []
  );

  useEffect(() => {
    if (!groupList) return;
    const groupData: GroupData[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupList.map((data: any) => {
      console.log("DATA xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", data);
      groupData.push({
        creator: `0x0${data.creator.toString(16)}`,
        date: data.date ? epocTime(data.date.toString()) : "",
        name: data.name,
        id: data.id.toString(),
        usage_limit_reached: data.usage_limit_reached,
        groupAddress: `0x0${data["group_address"].toString(16)}`,
        amount: +data.total_amount.toString() / ONE_STK,
      });
    });
    setTransaction(groupData);
  }, [groupList]);

  return transaction;
}

/// list of group an address has shares in
// members in a group
export function useGroupMember(id: string) {
  interface GroupMember {
    addr: string;
    percentage: number;
  }

  interface ContractMemberData {
    addr: { toString: (radix: number) => string };
    percentage: { toString: () => string };
  }

  const [groupMember, setGroupMember] = useState<GroupMember[] | undefined>(
    undefined
  );

  console.log("useGroupMember called with ID:", id);

  const { readData: member } = useContractFetch(
    PAYMESH_ABI,
    "get_group_member",
    [id]
  );

  useEffect(() => {
    console.log("useGroupMember useEffect triggered for ID:", id);
    console.log("Raw member data:", member);

    if (!member) {
      console.log("No member data yet for ID:", id);
      return;
    }

    const membersData: GroupMember[] = [];
    console.log("Processing member data for ID:", id, "Data:", member);

    member.forEach((data: ContractMemberData) => {
      const memberData = {
        addr: `0x0${data.addr.toString(16)}`,
        percentage: Number(data.percentage),
      };
      membersData.push(memberData);
      console.log("Processed member data:", memberData);
    });

    console.log("Final members data for ID:", id, ":", membersData);
    setGroupMember(membersData);
  }, [member, id]);

  return groupMember;
}

export function useGroupAddressHasSharesIn(address: string) {
  interface GroupData {
    creator: string;
    date: string;
    name: string;
    id: string;
    usage_limit_reached: boolean;
    groupAddress: string;
  }

  interface ContractGroupData {
    creator: { toString: (radix: number) => string };
    date: { toString: () => string };
    name: string;
    id: { toString: () => string };
    usage_limit_reached: boolean;
    group_address: { toString: (radix: number) => string };
  }

  const [transaction, setTransaction] = useState<GroupData[] | undefined>(
    undefined
  );

  /// list of group an address has shares in
  const { readData: groupList } = useContractFetch(
    PAYMESH_ABI,
    "group_address_has_shares_in",
    address ? [address] : ["0x0"] // ✅ Only call contract if address exists
  );

  useEffect(() => {
    if (!groupList || !address) return; //
    const groupData: GroupData[] = [];
    groupList.forEach((data: ContractGroupData) => {
      groupData.push({
        creator: `0x0${data.creator.toString(16)}`,
        date: data.date ? epocTime(data.date.toString()) : "",
        name: data.name,
        id: data.id.toString(),
        usage_limit_reached: data.usage_limit_reached,
        groupAddress: `0x0${data["group_address"].toString(16)}`,
      });
    });
    setTransaction(groupData);
  }, [groupList, address]); // ✅ Add address to dependencies

  return { transaction };
}

export interface GroupData {
  creator: string;
  date: string;
  name: string;
  id: string;
  usage_limit_reached: boolean;
  groupAddress: string;
}

export function useAddressCreatedGroups() {
  const { address } = useAccount();

  interface ContractGroupData {
    creator: { toString: (radix: number) => string };
    date: { toString: () => string };
    name: string;
    id: { toString: () => string };
    usage_limit_reached: boolean;
    group_address: { toString: (radix: number) => string };
  }

  const [transaction, setTransaction] = useState<GroupData[] | undefined>(
    undefined
  );

  /// list of group an address has shares in
  const { readData: groupList } = useContractFetch(
    PAYMESH_ABI,
    "get_groups_created_by_address",
    address ? [address] : ["0x0"] // ✅ Only call contract if address exists
  );

  useEffect(() => {
    if (!groupList || !address) return; //
    const groupData: GroupData[] = [];
    groupList.forEach((data: ContractGroupData) => {
      groupData.push({
        creator: `0x0${data.creator.toString(16)}`,
        date: data.date ? epocTime(data.date.toString()) : "",
        name: data.name,
        id: data.id.toString(),
        usage_limit_reached: data.usage_limit_reached,
        groupAddress: `0x0${data["group_address"].toString(16)}`,
      });
    });
    setTransaction(groupData);
  }, [groupList, address]); // ✅ Add address to dependencies

  return { transaction };
}

export function useGetGroupsUsage(id: number | undefined) {
  const [transaction, setTransaction] = useState<undefined | string>(undefined);
  const { readData: usage } = useContractFetch(
    PAYMESH_ABI,
    "get_group_usage_paid_history",
    // @ts-expect-error parmas can be undefined
    [id]
  );
  const { readData: usageCount } = useContractFetch(
    PAYMESH_ABI,
    "get_group_usage_count",
    // @ts-expect-error  parmas can be undefined
    [id]
  );

  useEffect(() => {
    if (!usage && !usageCount) return;
    const m = +usageCount.toString();
    const count = +usage[0].toString();
    console.log("count", count);
    const cal = count - m;
    const equate = cal ? `${count}/${cal}` : `${count}/${count}`;
    setTransaction(equate);
  }, [usage, usageCount]);

  return transaction;
}
