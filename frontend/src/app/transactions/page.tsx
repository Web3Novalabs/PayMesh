"use client";
import React, { useState } from "react";
import TransactionListTable from "./components/TransactionListTable";
import PaginationControls from "@/components/ui/PaginationControls";
import { GroupService } from "@/services/groupService";
import { truncateAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import LoadingState from "@/components/ui/LoadingState";

const itemsPerPage = 10;

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["allGroups"],
    queryFn: () => GroupService.getAllGroups(),
    refetchInterval: 5000, // Refetch every 5 seconds as requested
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = rawData.map((item: any) => {
    const group = item.group_data || {};

    const tokenMap = {
      usdc: { symbol: "USDC", decimals: 6, icon: "/usdcImg.png" },
      usdt: { symbol: "USDT", decimals: 6, icon: "/usdtImg.png" },
      strk: { symbol: "STRK", decimals: 18, icon: "/strkImg.png" },
      eth: { symbol: "ETH", decimals: 18, icon: "/ethImg.png" },
      // wBTC not explicitly in the log example but handling just in case if needed
    };

    const usdcAmount =
      parseInt(item.share_usdc || "0") / Math.pow(10, tokenMap.usdc.decimals);
    const usdtAmount =
      parseInt(item.share_usdt || "0") / Math.pow(10, tokenMap.usdt.decimals);
    const strkAmount =
      parseInt(item.share_strk || "0") / Math.pow(10, tokenMap.strk.decimals);
    const ethAmount =
      parseInt(item.share_eth || "0") / Math.pow(10, tokenMap.eth.decimals);

    const totalAmount = usdcAmount + usdtAmount;

    const breakdownList = [
      {
        token: "USDC",
        amount: usdcAmount.toFixed(2),
        icon: tokenMap.usdc.icon,
        iconColor: "#2775CA", // USDC blue
      },
      {
        token: "USDT",
        amount: usdtAmount.toFixed(2),
        icon: tokenMap.usdt.icon,
        iconColor: "#26A17B", // USDT green
      },
      {
        token: "STRK",
        amount: strkAmount.toFixed(5),
        icon: tokenMap.strk.icon,
        iconColor: "#FF6B00", // Starknet orange
      },
      {
        token: "ETH",
        amount: ethAmount.toFixed(5),
        icon: tokenMap.eth.icon,
        iconColor: "#627EEA", // Ethereum purple
      },
    ].filter((b) => parseFloat(b.amount) > 0);

    const createdDate = new Date(group.created_at || Date.now());

    return {
      id: group.group_address,
      groupName:
        group.group_name && group.group_name.startsWith("0x")
          ? decodeGroupName(group.group_name)
          : group.group_name || "Unnamed Group",
      groupAddress: truncateAddress(group.group_address || ""),
      totalAmount: `$${totalAmount.toFixed(2)}`,
      members: group.members ? group.members.length : 0,
      time: createdDate.toLocaleTimeString(),
      date: createdDate.toLocaleDateString(),
      breakdown: breakdownList,
    };
  });

  // Helper to decode hex names
  function decodeGroupName(hexName: string): string {
    try {
      const cleanHex = hexName.replace("0x", "");
      let result = "";
      for (let i = 0; i < cleanHex.length; i += 2) {
        const charCode = parseInt(cleanHex.substr(i, 2), 16);
        if (charCode > 0) result += String.fromCharCode(charCode);
      }
      return result || "Unnamed Group";
    } catch {
      return "Unnamed Group";
    }
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <section className="w-full space-y-6 flex flex-col min-h-[75vh]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Transactions</h1>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <TransactionListTable transactions={currentData} />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={data.length}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}
