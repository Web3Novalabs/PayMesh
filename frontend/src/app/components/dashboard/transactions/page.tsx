"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationControls from "@/components/ui/PaginationControls";
import { GroupTransactionData } from "@/types/group";
import { truncateAddress } from "@/lib/utils";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GroupService } from "@/services/groupService";

const TransactionsPage = () => {
  const [filter, setFilter] = useState("strk");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: transaction = [], isLoading } = useQuery({
    queryKey: ["allGroups"],
    queryFn: async () => {
      const groups = await GroupService.getAllGroups();
      return groups;
    },
  });

  // Helper function to format token amounts
  const formatTokenAmount = (amount: string, decimals: number = 18): string => {
    if (!amount || amount === "0") return "0.00";
    const numAmount = parseFloat(amount);
    if (numAmount === 0) return "0.00";

    // Convert from wei to token units
    const formattedAmount = numAmount / Math.pow(10, decimals);
    return formattedAmount.toFixed(2);
  };

  // Helper function to get token amount based on filter
  const getTokenAmount = (transaction: GroupTransactionData): string => {
    // Map filter to token address
    // Basic mapping for display logic - in a real app this might be more dynamic
    // using share_usdc, share_usdt, share_strk etc directly from GroupTransactionData

    // Based on the data structure GroupService.getAllGroups returns:
    // it has share_usdc, share_usdt, share_strk, share_eth

    let totalAmount = "0";
    let decimals = 18;

    if (filter === "usdc") {
      totalAmount = transaction.share_usdc || "0";
      decimals = 6;
    } else if (filter === "usdt") {
      totalAmount = transaction.share_usdt || "0";
      decimals = 6;
    } else if (filter === "strk") {
      totalAmount = transaction.share_strk || "0";
      decimals = 18;
    } else if (filter === "eth") {
      totalAmount = transaction.share_eth || "0";
      decimals = 18;
    }

    return formatTokenAmount(totalAmount, decimals);
  };

  // Helper function to decode group name from hex
  const decodeGroupName = (hexName: string): string => {
    try {
      if (!hexName.startsWith("0x")) return hexName;
      // Remove 0x prefix and convert hex to string
      const cleanHex = hexName.replace("0x", "");
      let result = "";
      for (let i = 0; i < cleanHex.length; i += 2) {
        const hex = cleanHex.substr(i, 2);
        const charCode = parseInt(hex, 16);
        if (charCode > 0) {
          result += String.fromCharCode(charCode);
        }
      }
      return result || "Unnamed Group";
    } catch {
      return "Unnamed Group";
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string): { date: string; time: string } => {
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      return { date: dateStr, time: timeStr };
    } catch {
      return { date: "Invalid Date", time: "" };
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil((transaction?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Show loading component while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#434672] border-t-[#755A5A] rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#E2E2E2] mb-2">
            Loading Transactions
          </h2>
          <p className="text-[#8398AD]">Fetching your transaction history...</p>
        </div>
      </div>
    );
  }

  if (!transaction || transaction.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-[#2A2D35] rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-[#E2E2E2] mb-2 text-center">
          No transactions found
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className=" pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#DFDFE0] mb-4">
            Transaction History
          </h1>

          {/* Filter Section */}
          <div className="flex flex-col items-start gap-4">
            <p className="text-[#8398AD] text-base">
              Filter between tokens recieved
            </p>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="sm:w-[278px] w-full bg-transparent py-4 sm:py-6 px-3 sm:px-4 rounded-sm text-[#8398AD] border border-[#FFFFFF0D]">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D] w-full text-[#8398AD]">
                <SelectItem value="strk">STRK</SelectItem>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="eth">ETH</SelectItem>
                <SelectItem value="usdt">USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction Table */}
        <div className=" rounded-sm shadow-sm overflow-hidden scrollbar-hide">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full mb-10">
              <thead className="bg-[#FFFFFF0D] border-b border-[#FFFFFF0D]">
                <tr>
                  <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    S/N
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Group Name
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Group Address
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Amount ({filter.toUpperCase()})
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Date/Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#FFFFFF0D] divide-y divide-[#FFFFFF0D]">
                {transaction &&
                  [...transaction]
                    .slice(startIndex, endIndex)
                    .map((transactionItem, index) => {
                      const tokenAmount = getTokenAmount(transactionItem);
                      const groupName = decodeGroupName(
                        transactionItem.group_name
                      );
                      const { date, time } = formatDate(
                        transactionItem.created_at
                      );

                      return (
                        <tr
                          key={transactionItem?.group_address}
                          className="hover:bg-[#282e38]"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#E2E2E2]">
                            {startIndex + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E2E2E2]">
                            <div
                              className="truncate max-w-[150px]"
                              title={groupName}
                            >
                              {groupName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E2E2E2] font-mono">
                            <div
                              className="truncate max-w-[200px]"
                              title={transactionItem.group_address}
                            >
                              {truncateAddress(transactionItem.group_address)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#E2E2E2]">
                            {tokenAmount !== "0"
                              ? `${tokenAmount} ${filter.toUpperCase()}`
                              : "0"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E2E2E2]">
                            {transactionItem.members.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col">
                              <span className="text-[#E2E2E2] font-medium">
                                {date}
                              </span>
                              {time && (
                                <span className="text-[#8398AD] text-xs">
                                  {time}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={transaction?.length || 0}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default TransactionsPage;
