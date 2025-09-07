"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllGroups } from "@/hooks/useContractInteraction";
// import WalletConnect from "@/app/components/WalletConnect";
import { useAccount } from "@starknet-react/core";
// import { getTimeFromEpoch } from "@/utils/contract";
// import { truncateAddress } from "@/lib/utils";
import { GroupTransactionData } from "@/types/group";
import { truncateAddress } from "@/lib/utils";

const TransactionsPage = () => {
  const [filter, setFilter] = useState("strk");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [transaction, setTransaction] = useState<GroupTransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getTransaction() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/all_groups`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transaction");
      }
      const data = await response.json();
      console.log("Transaction data:", data);
      setTransaction(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }

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
    switch (filter) {
      case "strk":
        return formatTokenAmount(transaction.share_strk, 18);
      case "usdc":
        return formatTokenAmount(transaction.share_usdc, 6);
      case "usdt":
        return formatTokenAmount(transaction.share_usdt, 6);
      case "eth":
        return formatTokenAmount(transaction.share_eth, 18);
      default:
        return "0";
    }
  };

  // Helper function to decode group name from hex
  const decodeGroupName = (hexName: string): string => {
    try {
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
    } catch (error) {
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
    } catch (error) {
      return { date: "Invalid Date", time: "" };
    }
  };

  useEffect(() => {
    getTransaction();
  }, []);

  // Filter transactions based on selected filter
  // const filteredTransactions = transaction?.filter((transaction) => {
  //   if (filter === "all") return true;
  //   if (filter === "cleared") return transaction.status === "Paid";
  //   if (filter === "pending") return transaction.status === "In progress";
  //   return true;
  // });

  // const transaction = useGetAllGroups();

  // Calculate pagination
  const totalPages = Math.ceil((transaction?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const { address } = useAccount();

  // const isWalletConnected = !!address;

  // if (!isWalletConnected) {
  //   return (
  //     <div className="min-h-[50vh] text-white p-6 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center mx-auto mb-4">
  //           <svg
  //             className="w-8 h-8 text-white"
  //             fill="none"
  //             stroke="currentColor"
  //             viewBox="0 0 24 24"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth={2}
  //               d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  //             />
  //           </svg>
  //         </div>
  //         <h2 className="text-2xl font-bold text-white mb-2">
  //           Wallet Not Connected
  //         </h2>
  //         <p className="text-gray-300 mb-4">
  //           Please connect your wallet to view your groups
  //         </p>
  //         <WalletConnect />
  //       </div>
  //     </div>
  //   );
  // }

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

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#DFDFE0] mb-4">
            Transaction History
          </h1>

          {/* Filter Section */}
          <div className="flex flex-col items-start gap-4">
            <p className="text-[#8398AD] text-base">
              Filter between all, cleared and pending
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
        <div className=" rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                    .reverse()
                    .slice(startIndex, endIndex)
                    .map((transactionItem, index) => {
                      const tokenAmount = getTokenAmount(transactionItem);
                      const groupName = decodeGroupName(
                        transactionItem.group_data.group_name
                      );
                      const { date, time } = formatDate(
                        transactionItem.group_data.created_at
                      );

                      return (
                        <tr
                          key={transactionItem?.group_data?.group_address}
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
                              title={transactionItem.group_data.group_address}
                            >
                              {truncateAddress(
                                transactionItem.group_data.group_address
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#E2E2E2]">
                            {tokenAmount !== "0"
                              ? `${tokenAmount} ${filter.toUpperCase()}`
                              : "0"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E2E2E2]">
                            {transactionItem.group_data.members.length}
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
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-16">
          <div className="text-sm text-[#E2E2E2]">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, transaction?.length || 0)} of{" "}
            {transaction?.length || 0} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-[#E2E2E2] bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-md hover:bg-[#282e38] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? "bg-gradient-to-r from-[#434672] to-[#755a5a] text-white"
                        : "text-[#E2E2E2] bg-[#FFFFFF0D] border border-[#FFFFFF0D] hover:bg-[#282e38]"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-[#E2E2E2] bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-md hover:bg-[#282e38] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
