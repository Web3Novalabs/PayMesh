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
import WalletConnect from "@/app/components/WalletConnect";
import { useAccount } from "@starknet-react/core";
import { getTimeFromEpoch } from "@/utils/contract";

const TransactionsPage = () => {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions based on selected filter
  // const filteredTransactions = transaction?.filter((transaction) => {
  //   if (filter === "all") return true;
  //   if (filter === "cleared") return transaction.status === "Paid";
  //   if (filter === "pending") return transaction.status === "In progress";
  //   return true;
  // });

  const transaction = useGetAllGroups();
  console.log(transaction);
  console.log(
    "transaction?.length_______X_X__X_X_X_X_X_X_X_X_X__X_X_X_X__X_X_X",
    transaction?.length
  );

  // Calculate pagination
  const totalPages = Math.ceil((transaction?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  console.log("Pagination Debug:", {
    totalItems: transaction?.length || 0,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    itemsPerPage,
  });

  const { address } = useAccount();
  const isWalletConnected = !!address;

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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
                  <th className="px-6 py-6   text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Group Address
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Amount Recieved
                  </th>
                  <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Date/Time
                  </th>
                  {/* <th className="px-6 py-6 text-left text-xs font-medium text-[#8398AD] uppercase tracking-wider">
                    Status
                  </th>*/}
                </tr>
              </thead>
              <tbody className="bg-[#FFFFFF0D] divide-y divide-[#FFFFFF0D]">
                {transaction &&
                  [...transaction]
                    .reverse()
                    .slice(startIndex, endIndex)
                    .map((transaction, index) => (
                      <tr key={transaction.id} className="hover:bg-[#282e38]">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#E2E2E2]">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E2E2E2] font-mono">
                          <div
                            className="truncate"
                            title={transaction.groupAddress}
                          >
                            {transaction.groupAddress}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#E2E2E2]">
                          {transaction.amount && transaction.amount > 0
                            ? `${transaction.amount.toFixed(2)} STRK`
                            : "0 STRK"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className="text-[#E2E2E2] font-medium">
                              {transaction.date}
                            </span>
                            {transaction.rawTime && (
                              <span className="text-[#8398AD] text-xs">
                                {transaction.rawTime}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
