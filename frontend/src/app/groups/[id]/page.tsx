"use client";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { GroupService } from "@/services/groupService";
import { useBalance, useAccount } from "@starknet-react/core";
import { useGetBalance } from "@/utils/contract";
import { useGroupActions } from "@/hooks/useGroupActions";
import GroupHeader from "./components/GroupHeader";
import GroupStats from "./components/GroupStats";
import GroupActions from "./components/GroupActions";
import MembersTable from "./components/MembersTable";
import GroupMonthlyFlowChart from "./components/GroupMonthlyFlowChart";
import { copyToClipboard } from "@/lib/utils";
import Loading from "@/components/Loading";
import { generateGroupHistoryPDF } from "@/utils/pdfGenerator";

export default function GroupDetail() {
  const router = useRouter();
  const params = useParams();

  const {
    data: groupDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["groupDetails", params.id],
    queryFn: () => GroupService.getGroupDetailsByAddress(params.id as string),
    enabled: !!params.id,
    refetchInterval: 3000,
  });

  const { data: usdcBalance } = useBalance({
    token:
      "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8" as `0x${string}`,
    address: params.id
      ? (params.id as `0x${string}`)
      : ("0x0" as `0x${string}`),
  });
  const { data: usdtBalance } = useBalance({
    token:
      "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8" as `0x${string}`,
    address: params.id
      ? (params.id as `0x${string}`)
      : ("0x0" as `0x${string}`),
  });
  const { data: ethBalance } = useBalance({
    token:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7" as `0x${string}`,
    address: params.id
      ? (params.id as `0x${string}`)
      : ("0x0" as `0x${string}`),
  });

  const balance = useGetBalance((params.id as string) || "0x0");
  const { address } = useAccount();
  const userBalance = useGetBalance(address || "0x0");
  const { handleSplit, handleTopUp, isSubmitting, isTopUp } = useGroupActions();

  const members = groupDetails?.members || [];

  const handleCopyAddress = (text: string) => {
    copyToClipboard(text);
  };

  const hasAnyBalance = [usdcBalance, usdtBalance, ethBalance, balance].some(
    (b) => b?.formatted && +b.formatted > 0
  );
  const handleDownloadHistory = async () => {
    if (!groupDetails) {
      toast.error("Group details not loaded yet.");
      return;
    }
    try {
      await generateGroupHistoryPDF(groupDetails);
      toast.success("Transaction history downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download transaction history.");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !groupDetails) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Group Not Found</h2>
          <p className="text-[#8398AD] mb-4">
            We couldn&apos;t find the group details you&apos;re looking for.
          </p>
          <button
            onClick={() => router.push("/dashboard/my-groups")}
            className="bg-[#FFFFFF0D] border border-[#FFFFFF1A] text-white px-4 py-2 rounded-full hover:bg-[#232542] transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className=" my-16 max-w-sit-screen px-5 mx-auto">
      <button
        onClick={() => {
          router.back();
        }}
        className="flex items-center cursor-pointer bg-[#FFFFFF0D] border border-[#FFFFFF1A] gap-2 text-[#DFDADA] hover:text-[#DFDFE0] transition-colors duration-200 py-3 px-4 rounded-4xl hover:bg-[#232542] mb-12"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Groups
      </button>

      <div className="bg-[#FFFFFF05] border border-[#232542] rounded-lg">
        <GroupHeader
          groupName={groupDetails?.group_name || ""}
          groupAddress={params.id as string}
          isCreator={true} // TODO: Add logic to check if user is creator
          onCopyAddress={handleCopyAddress}
        />

        <div className="flex flex-col md:items-center md:flex-row gap-6">
          <div className="w-[70%]">
            <GroupStats
              balances={{
                usdc: usdcBalance,
                usdt: usdtBalance,
                eth: ethBalance,
                generic: balance,
              }}
              memberCount={members.length}
              createdAt={groupDetails?.created_at || ""}
              usageRemaining={groupDetails?.usage_remaining || "0"}
            />
          </div>

          <div className="md:w-[30%]">
            <GroupActions
              onTopUp={() =>
                handleTopUp("1", balance?.formatted, userBalance?.formatted)
              }
              onSplit={() =>
                handleSplit(params.id as string, balance?.formatted)
              }
              onDownloadHistory={handleDownloadHistory}
              isTopUpLoading={isTopUp}
              isSplitLoading={isSubmitting}
              hasBalance={hasAnyBalance}
              hasHistory={
                !!(groupDetails?.history && groupDetails.history.length > 0)
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <MembersTable members={members} />
        <GroupMonthlyFlowChart history={groupDetails?.history || []} />
      </div>
    </div>
  );
}
