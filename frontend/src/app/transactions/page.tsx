"use client";
import React, { useState } from "react";
import TransactionListTable from "./components/TransactionListTable";
import PaginationControls from "@/components/ui/PaginationControls";
import { GroupService } from "@/services/groupService";
import { GroupFullDetailResponse } from "@/types/group";
import { GroupDetails } from "@/types/groups";
import { truncateAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";

import { isUsdc } from "@/utils/contract";

const itemsPerPage = 10;

export default function Page() {
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch all groups for pagination
  const { data: allGroups = [], isLoading: isLoadingAll } = useQuery<
    GroupFullDetailResponse[]
  >({
    queryKey: ["allGroups"],
    queryFn: () => GroupService.getAllGroups(),
    refetchInterval: 10000,
  });

  // Calculate pagination
  const totalItems = allGroups.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get slice for current page
  const currentGroupSlice = allGroups.slice(startIndex, endIndex);

  // 2. Fetch full details (with history) ONLY for the groups on the current page
  const { data: detailedGroups = [], isLoading: isLoadingDetails } = useQuery<
    GroupDetails[]
  >({
    queryKey: [
      "groupDetails",
      currentGroupSlice.map((g) => g.group_data.group_address),
    ],
    queryFn: async () => {
      if (currentGroupSlice.length === 0) return [];
      const promises = currentGroupSlice.map((g) =>
        GroupService.getGroupDetailsByAddress(g.group_data.group_address)
      );
      return Promise.all(promises);
    },
    enabled: currentGroupSlice.length > 0,
    refetchInterval: 10000,
  });

  // 3. Process the DETAILED data to calculate totals using history and isUsdc
  const processedData = detailedGroups.map((groupDetails) => {
    // groupDetails is the full response from getGroupDetailsByAddress
    // It should have 'group_data' (info) and 'history' (transactions)

    // Fallback if data structure is slightly different (direct return vs nested)
    const info = groupDetails;
    const history = groupDetails.history || [];

    let usdcTotal = 0;
    let usdtTotal = 0;
    let strkTotal = 0;
    let ethTotal = 0;

    // Aggregate from history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    history.forEach((tx: any) => {
      // tx has total_amount_paid and token_address
      // We can use the total_amount_paid for the group or sum up members?
      // "total_amount_paid" is usually the sum of all members for that tx.
      // Let's verify structure. GroupPaymentHistoryResponse has total_amount_paid.

      const amount = parseFloat(tx.total_amount_paid);
      const addr = tx.token_address;

      if (isUsdc(addr)) {
        usdcTotal += amount / 1e6;
      } else if (
        addr ===
        "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8"
      ) {
        // USDT mainnet address - typically 6 decimals
        usdtTotal += amount / 1e6;
      } else if (
        addr ===
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
      ) {
        // STRK
        strkTotal += amount / 1e18;
      } else if (
        addr ===
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
      ) {
        // ETH
        ethTotal += amount / 1e18;
      }
    });

    const breakdownList = [
      {
        token: "USDC",
        amount: usdcTotal.toFixed(2),
        icon: "/usdcImg.png",
        iconColor: "#2775CA",
      },
      {
        token: "USDT",
        amount: usdtTotal.toFixed(2),
        icon: "/usdtImg.png",
        iconColor: "#26A17B",
      },
      {
        token: "STRK",
        amount: strkTotal.toFixed(5),
        icon: "/strkImg.png",
        iconColor: "#FF6B00",
      },
      {
        token: "ETH",
        amount: ethTotal.toFixed(5),
        icon: "/ethImg.png",
        iconColor: "#627EEA",
      },
    ].filter((b) => parseFloat(b.amount) > 0);

    const totalUSD = usdcTotal + usdtTotal; // Assuming stablecoins ≈ USD

    // Fix created_at date parsing
    const createdDate = new Date(info.created_at || Date.now());

    return {
      id: info.group_address,
      groupName:
        info.group_name && info.group_name.startsWith("0x")
          ? decodeGroupName(info.group_name)
          : info.group_name || "Unnamed Group",
      groupAddress: truncateAddress(info.group_address || ""),
      totalAmount: `$${totalUSD.toFixed(2)}`,
      members: info.members ? info.members.length : 0,
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

  return (
    <section className="w-full space-y-6 flex flex-col min-h-[75vh] max-w-sit-screen px-5 mx-auto">
      {isLoadingAll ||
      isLoadingDetails ||
      (processedData.length === 0 && allGroups.length > 0) ? (
        <Loading className="py-20" />
      ) : (
        <>
          <TransactionListTable transactions={processedData} />
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}
