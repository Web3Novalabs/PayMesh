"use client";
import {
  Search,
  Users,
  Calendar,
  Plus,
  LucideUsers,
  Loader2,
} from "lucide-react";
import React, { useMemo, useEffect, useState } from "react";
import { Sofia_Sans } from "next/font/google";
import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { GroupSummary } from "@/types/group";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMESH_ABI } from "@/abi/swiftswap_abi";
import {
  GroupData,
  useAddressCreatedGroups,
  useContractFetch,
  useGetAllGroups,
  useGroupAddressHasSharesIn,
  useGroupMember,
} from "@/hooks/useContractInteraction";
import { useTransactionReceipt } from "@starknet-react/core";
import WalletConnect from "@/app/components/WalletConnect";
import { compareAddresses } from "@/utils/contract";
// import { SWIFTSWAP_ABI } from "@/abi/swiftswap_abi";

// Separate component for individual group cards
const GroupCard = ({
  group,
  address,
}: {
  group: { id: string; name: string; creator: string; date: string };
  address: string;
}) => {
  const groupMember = useGroupMember(group.id);
  const role = compareAddresses(group.creator,address)
  console.log("man-3", role);
  return (
    <div className="bg-[#2A2D35] rounded-sm border-none text-sm p-6 hover:border-gray-800 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{group.name}</h3>
        <span
          className={`px-3 py-1 text-sm rounded-sm font-medium ${
             role
              ? "bg-[#10273E] text-[#0073E6]"
              : "bg-[#103E3A] text-[#00E69D]"
          }`}
        >
          {role ? "Creator" : "Member"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div className="space-y-3 mb-6 text-[12px]">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span>
              Members |{" "}
              <b className="text-white"> {groupMember?.length || 0} </b>{" "}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>
              Date Created | <b className="text-white"> {group.date} </b>{" "}
            </span>
          </div>
        </div>

        <Link
          href={`/dashboard/my-groups/${group.id}`}
          className="text-white border-gradient-flow rounded-sm bg-[#4C4C4C] h-fit text-sm py-2 px-2 md:px-3 hover:bg-[#5a5a5a] transition-colors cursor-pointer"
        >
          View Group
        </Link>
      </div>
    </div>
  );
};

const sofiaSans = Sofia_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gt-walsheim-trial",
});

const MyGroupsPage = () => {
  const router = useRouter();

  const { account, address } = useAccount();

  const { transaction } = useGroupAddressHasSharesIn(address || "");
  const { transaction: createdGroup } = useAddressCreatedGroups();

  // Combine and deduplicate based on id
  const [myGroup, setMyGroup] = useState<GroupData[]>([]);

  useEffect(() => {
    const combinedData = [...(transaction || []), ...(createdGroup || [])];

    // Remove duplicates based on id, keeping the first occurrence
    // console.log("man-",combinedData)
    const uniqueData = combinedData.filter(
      (item, index, array) =>
        array.findIndex((obj) => obj.id === item.id) === index
    );
  //   console.log("man-1", address)
  //   uniqueData.forEach(data => {
  //   console.log("man-",data.creator)
  // });
    setMyGroup(uniqueData);
  }, [transaction, createdGroup]);

  // console.log("created-group", createdGroup, transaction);
  // // const transaction = useGetAllGroups();

  // console.log(
  //   "groupLists xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  //   transaction
  // );
  // console.log("address xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", addressCreatedGroup);

  // Check if wallet is connected
  const isWalletConnected = !!address;

  // Show wallet connection message if not connected
  if (!isWalletConnected) {
    return (
      <div className="min-h-[50vh] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-gray-300 mb-4">
            Please connect your wallet to view your groups
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My groups</h1>
        <p className="text-gray-300 text-lg">
          Filter between all, cleared and pending
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative">
          <Select>
            <SelectTrigger className="w-full bg-[#FFFFFF0D] border py-4 sm:py-6 px-3 sm:px-4 rounded-sm border-[#FFFFFF0D] text-[#8398AD] !text-sm sm:!text-base">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D] w-full">
              <SelectGroup>
                <SelectLabel className="text-[#E2E2E2]">Tokens</SelectLabel>
                <SelectItem
                  value="strk"
                  className="text-[#8398AD] hover:bg-[#374151]"
                >
                  ALL
                </SelectItem>
                <SelectItem
                  value="eth"
                  className="text-[#8398AD] hover:bg-[#374151]"
                >
                  PENDING
                </SelectItem>
                <SelectItem
                  value="usdc"
                  className="text-[#8398AD] hover:bg-[#374151]"
                >
                  CLEARED
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search group by name.."
            className=" bg-none border rounded-sm border-gray-600 pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-col w-fit h-fit sm:flex-row gap-6 mb-8">
        <div className="bg-[#2A2D35] rounded-sm px-6 py-3 flex items-center gap-4">
          <LucideUsers className="w-6 h-6 text-white" />
          <div>
            {!transaction ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <p className="text-gray-300">Loading groups...</p>
              </div>
            ) : (
              <p className="text-gray-300">
                Total Groups -{" "}
                <b className="text-white">{transaction?.length || 0}</b>{" "}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#2A2D35] rounded-sm px-6 flex items-center gap-4">
          <Plus className="w-6 h-6 text-white" />
          <div>
            {!transaction ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <p className="text-gray-300">Loading...</p>
              </div>
            ) : (
              <p className="text-gray-300">
                Groups Created -{" "}
                <b className="text-white">
                  {myGroup?.filter((group) => group.creator === address)
                    .length || 0}
                </b>{" "}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12 gap-6 ${sofiaSans.className}`}
      >
        {myGroup?.map((group) => (
          <GroupCard key={group.id} group={group} address={address || ""} />
        ))}
      </div>
    </div>
  );
};

export default MyGroupsPage;
