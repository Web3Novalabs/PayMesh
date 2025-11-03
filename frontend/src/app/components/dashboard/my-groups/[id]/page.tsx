"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  X,
  Copy,
  Check,
  ArrowLeft,
  LucideUsers,
  Search,
  ListPlus,
} from "lucide-react";
import { Sofia_Sans } from "next/font/google";
import { Group } from "@/types/group";
import { GroupService } from "@/services/groupService";
import { copyToClipboard } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { useBalance, useAccount } from "@starknet-react/core";
import {
  useContractFetch,
  useGetGroupsUsage,
  useGroupAddressHasSharesIn,
  useGroupMember,
  useAddressCreatedGroups,
} from "@/hooks/useContractInteraction";
import WalletConnect from "@/app/components/WalletConnect";
import { PAYMESH_ABI } from "@/abi/swiftswap_abi";
import {
  myProvider,
  normalizeAddress,
  ONE_STK,
  PAYMESH_ADDRESS,
  strkTokenAddress,
} from "@/utils/contract";
import { cairo, CallData, PaymasterDetails } from "starknet";
import { useGetBalance } from "@/utils/contract";
import toast from "react-hot-toast";

const GroupDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  //   const [groupData, setGroupData] = useState<Group | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const groupMember = useGroupMember(params.id as string);
  const { address, account } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTopUp, setIsTopUp] = useState(false);

  const [usage, setUsage] = useState<undefined | string>(undefined);
  const { readData: groupUsage } = useContractFetch(
    PAYMESH_ABI,
    "get_group_usage_paid",
    // @ts-expect-error parmas can be undefined
    [+params.id]
  );
  const { readData: usageCount } = useContractFetch(
    PAYMESH_ABI,
    "get_group_usage_count",
    // @ts-expect-error  parmas can be undefined
    [+params.id]
  );

  useEffect(() => {
    if (!groupUsage && !usageCount) return;
    const m = +usageCount?.toString();
    const count = +groupUsage?.toString();
    setUsage(`${m}`);
  }, [usage, usageCount]);
  const { transaction } = useGroupAddressHasSharesIn(address || "");
  const { transaction: createdGroups } = useAddressCreatedGroups();

  // Get the current group data based on the URL ID from both sources
  const currentGroup =
    transaction?.find((group) => group.id === params.id) ||
    createdGroups?.find((group) => group.id === params.id);

  const { data: usdcBalance } = useBalance({
    token:
      "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8" as `0x${string}`,
    address: currentGroup?.groupAddress
      ? (currentGroup?.groupAddress as `0x${string}`)
      : ("0x0" as `0x${string}`),
  });
  const { data: usdtBalance } = useBalance({
    token:
      "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8" as `0x${string}`,
    address: currentGroup?.groupAddress
      ? (currentGroup?.groupAddress as `0x${string}`)
      : ("0x0" as `0x${string}`),
  });
  const { data: ethBalance } = useBalance({
    token:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7" as `0x${string}`,
    address: currentGroup?.groupAddress
      ? (currentGroup?.groupAddress as `0x${string}`)
      : ("0x0" as `0x${string}`),
  });
  // Force refresh when params.id changes
  useEffect(() => {
    if (params.id && transaction) {
      // console.log("Group ID changed, refreshing data for:", params.id);
    }
  }, [params.id, transaction]);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!params.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call when backend is ready
        // const data = await GroupService.getGroupDetails(Number(params.id));
        // setGroupData(data);

        // For now, using mock data
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching group data:", error);
        setError("Failed to load group details");
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [params.id]);

  const handleCopyToClipboard = async (text: string) => {
    await copyToClipboard(text, () => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const balance = useGetBalance(currentGroup?.groupAddress || "0x0");
  const userBalance = useGetBalance(address || "0x0");

  const handleBackToGroups = () => {
    router.push("/dashboard/my-groups");
  };

  const handleSplit = async () => {
    if (!balance?.formatted) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (
        account != undefined &&
        balance?.formatted &&
        currentGroup?.groupAddress
      ) {
        const swiftpayCall = {
          contractAddress: PAYMESH_ADDRESS,
          entrypoint: "paymesh",
          calldata: CallData.compile({
            group_address: currentGroup?.groupAddress,
          }),
        };

        const approveCall = {
          contractAddress: strkTokenAddress,
          entrypoint: "approve",
          calldata: [
            PAYMESH_ADDRESS, // spender
            cairo.uint256(ONE_STK),
          ],
        };

        const multicallData = [approveCall, swiftpayCall];
        // const result = await account.execute(multicallData);

        const feeDetails: PaymasterDetails = {
          feeMode: {
            mode: "sponsored",
          },
        };

        const feeEstimation = await account?.estimatePaymasterTransactionFee(
          [...multicallData],
          feeDetails
        );

        const result = await account?.executePaymasterTransaction(
          [...multicallData],
          feeDetails,
          feeEstimation?.suggested_max_fee_in_gas_token
        );

        const status = await myProvider.waitForTransaction(
          result?.transaction_hash as string
        );

        console.log(result);

        // setResultHash(result.transaction_hash);
        console.log(status);
        toast.success("split succesfull");
      }
    } catch (error) {
      toast.error("Failed to split funds, top up subscription. and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleToUp = async () => {
    if (!balance?.formatted && !params.id) {
      return;
    }
    if (userBalance?.formatted && +userBalance.formatted < 1) {
      console.log(userBalance);
      toast.error(`Insufficient balance, Top Up!`);
      return;
    }
    try {
      setIsTopUp(true);

      if (
        account != undefined &&
        balance?.formatted &&
        currentGroup?.groupAddress
      ) {
        const swiftpayCall = {
          contractAddress: PAYMESH_ADDRESS,
          entrypoint: "top_subscription",
          calldata: CallData.compile({
            // @ts-expect-error parrams is valid
            group_id: cairo.uint256(+params?.id),
            new_planned_usage_count: cairo.uint256(1),
          }),
        };

        const approveCall = {
          contractAddress: strkTokenAddress,
          entrypoint: "approve",
          calldata: [PAYMESH_ADDRESS, cairo.uint256(ONE_STK)],
        };

        const multicallData = [approveCall, swiftpayCall];
        // const result = await account.execute(multicallData);

        const feeDetails: PaymasterDetails = {
          feeMode: {
            mode: "sponsored",
          },
        };

        const feeEstimation = await account?.estimatePaymasterTransactionFee(
          [...multicallData],
          feeDetails
        );

        await account?.executePaymasterTransaction(
          [...multicallData],
          feeDetails,
          feeEstimation?.suggested_max_fee_in_gas_token
        );
        toast.success("Top Up Successful!");
      }
    } catch (error) {
      console.error("Error paying group:", error);
      toast.error("Failed to top up subscription. Please try again.");
    } finally {
      setIsTopUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#434672] border-t-[#755A5A] rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#E2E2E2] mb-2">
            Loading Group Details
          </h2>
          <p className="text-[#8398AD]">Fetching your group information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-white" />
          </div>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard/my-groups")}
            className="bg-[#434672] hover:bg-[#5a5f8a] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  const isWalletConnected = !!address;

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
    <div className="min-h-screen text-white mb-24 mt-9 md:mt-0">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My groups</h1>
        <p className="text-gray-300 text-lg">
          Filter between all, cleared and pending
        </p>
      </div> */}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBackToGroups}
          className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="">Back to Groups</span>
        </button>

        <div className="flex items-center gap-2"></div>
      </div>

      {/* Members Table */}
      <div className="bg-[#ffffff0d] rounded-sm overflow-hidden scrollbar-hide">
        <div className="">
          <div className="flex items-center justify-between p-4 border-b border-[#20232bac]">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="sm:border-r pr-3 text-xl capitalize border-[#ffffff2b]">
                {currentGroup?.name || "Loading..."}
              </h1>
              <h3 className="text-[#379A83]">
                Remaining Subscription Usage: {usage}
              </h3>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-4 justify-between p-4 border-b border-[#20232bb6]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="border-r pr-2 border-[#FFFFFF0D] text-[#8398AD] flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Members
                </h1>
                <h3 className="text-[#E2E2E2]">{groupMember?.length}</h3>
              </div>

              <div className="flex items-center gap-2">
                <h1 className="border-r pr-2 border-[#FFFFFF0D] text-[#8398AD] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Created
                </h1>
                <h3 className="text-[#E2E2E2]">
                  {currentGroup?.date || "Loading..."}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToUp}
                className="border-gradient-flow cursor-pointer text-white px-4 py-2 rounded-sm transition-colors"
              >
                {isTopUp ? "loading..." : "Top Up"}
              </button>
              {/*  @ts-expect-error array need to be empty */}
              {balance?.formatted != 0 && (
                <>
                  <button
                    onClick={handleSplit}
                    className={`${
                      isSubmitting ? "cursor-not-allowed" : ""
                    } cursor-pointer border-gradient-flow text-white px-4 py-2 rounded-sm transition-colors`}
                  >
                    {isSubmitting ? "spliting...." : "Split Funds"}
                  </button>
                </>
              )}
              <div className="border-gradient-flow space-x-2.5 text-white px-4 py-2 rounded-sm transition-colors">
                <span className="text-[#8398AD]">Balance:</span>
                <span className="text-[#E2E2E2]">
                  {balance?.formatted
                    ? Number.parseFloat(balance.formatted).toFixed(2)
                    : "0.00"}{" "}
                  {balance?.symbol}
                </span>
                {usdcBalance && +usdcBalance?.formatted > 0 && (
                  <span className="text-[#E2E2E2]">
                    {usdcBalance?.formatted
                      ? Number.parseFloat(usdcBalance.formatted).toFixed(2)
                      : "0.00"}{" "}
                    {usdcBalance?.symbol}
                  </span>
                )}
                {usdtBalance && +usdtBalance?.formatted > 0 && (
                  <span className="text-[#E2E2E2]">
                    {usdtBalance?.formatted
                      ? Number.parseFloat(usdtBalance.formatted).toFixed(2)
                      : "0.00"}{" "}
                    {usdtBalance?.symbol}
                  </span>
                )}
                {ethBalance && +ethBalance?.formatted > 0 && (
                  <span className="text-[#E2E2E2]">
                    {ethBalance?.formatted
                      ? Number.parseFloat(ethBalance.formatted).toFixed(2)
                      : "0.00"}{" "}
                    {ethBalance?.symbol}
                  </span>
                )}
              </div>
            </div>
          </div>

          {currentGroup?.groupAddress && (
            <div className="text-[#8398AD] flex items-center gap-1 p-4 flex-wrap">
              <h3 className="sm:border-r border-[#FFFFFF0D] pr-2 mr-2">
                Group address
              </h3>
              <div className="flex items-center space-x-1 gap-2">
                <span className="text-[#E2E2E2] break-all text-sm">
                  0x{normalizeAddress(currentGroup?.groupAddress)}
                </span>
                <button
                  onClick={() =>
                    handleCopyToClipboard(
                      "0x" + normalizeAddress(currentGroup?.groupAddress)
                    )
                  }
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copySuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="p-4">
            <h1>Members</h1>
          </div>

          <div className="max-h-96 scrollbar-hide overflow-y-auto">
            <table className="w-full">
              <thead className="bg-[#FFFFFF0D] sticky top-0">
                <tr>
                  <th className="text-left p-4 text-gray-300 text-sm font-medium">
                    S/N
                  </th>
                  <th className="text-left p-4 text-gray-300 text-sm font-medium">
                    Beneficiary Address
                  </th>
                  <th className="text-left p-4 text-gray-300 text-sm font-medium">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupMember?.map((member, index) => (
                  <tr
                    key={member.addr}
                    className="border-b border-[#FFFFFF0D] hover:bg-[#3a3d45] transition-colors"
                  >
                    <td className="p-4 text-white text-sm">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-mono">
                          {member.addr}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-white text-sm">
                      {member.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsPage;
