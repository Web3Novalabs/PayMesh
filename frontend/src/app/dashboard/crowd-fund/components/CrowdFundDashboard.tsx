"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Search, Users, Calendar } from "lucide-react";
import group1icon from "../../../../../public/PlusCircle.svg";
import group4icon from "../../../../../public/Handshake.svg";
import { useGetAllPools } from "@/hooks/useContractInteraction";
import { generateShortIdFromPoolId } from "@/utils/shareUtils";
import Link from "next/link";
import { pool, UsdcBalanceProps } from "@/types/usdcDataApi";
import { compareAddresses } from "@/utils/contract";

interface CrowdFundDashboardProps {
  onCreateNew: () => void;
  isWalletConnected: boolean;
}

const CrowdFundDashboard: React.FC<CrowdFundDashboardProps> = ({
  onCreateNew,
  isWalletConnected,
}) => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [poolData, setPoolData] = useState<pool[] | null>(null);
  const itemsPerPage = 11;

  const { createdPool: pools } = useGetAllPools();
  // console.log(pools);

  // const handleViewDetails = (id: number) => {
  //   router.push(`/dashboard/crowd-fund/details/${generateShortId()}/${id}`);
  // };

  const filteredFundings = pools?.filter((funding) => {
    const matchesSearch = funding.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || true;
    return matchesSearch && matchesFilter;
  });

  // Reverse array to show newest campaigns first
  const reversedFundings = [...(filteredFundings || [])].reverse();

  // Calculate pagination
  const totalPages = Math.ceil((reversedFundings?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFundings = reversedFundings?.slice(startIndex, endIndex);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const getPoolsData = useCallback(async () => {
    try {
      // console.log(pools);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crowdfunding/pools`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch USDC balance");
      }

      const data = await response.json();
      setPoolData(data);
    } catch (error) {
      console.error("Error fetching USDC balance:---", error);
    }
  }, [pools]);

  useEffect(() => {
    getPoolsData();
  }, [pools, getPoolsData]);

  return (
    <div className="space-y-6">
      {/* Filtering and Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 ">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px] py-6 bg-transparent border border-[#FFFFFF0D] rounded-sm text-[#8398AD]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D] text-[#8398AD]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-[#8398AD] w-4 h-4" />
          <Input
            type="text"
            placeholder="Search funding by name.."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-[425px] pl-8 py-6 bg-transparent border border-[#FFFFFF0D] rounded-sm text-[#8398AD] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
          />
        </div>
      </div>

      {/* Active Funding Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex w-full space-x-4 col-span-1 items-center p-4 bg-[#FFFFFF0D] rounded-sm border border-[#FFFFFF0D]">
          <Image src={group4icon} alt="group4icon" width={24} height={24} />
          <span className="text-[#8398AD] text-sm">
            Active Funding{" "}
            <span className="text-[#DFDFE0] font-semibold">
              {filteredFundings?.length}
            </span>
          </span>
        </div>
      </div>

      {/* Funding Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Funding Card */}
        <div
          onClick={isWalletConnected ? onCreateNew : undefined}
          className={`bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6 transition-colors duration-200 flex flex-col items-center justify-center min-h-[200px] ${
            isWalletConnected
              ? "cursor-pointer hover:bg-[#282e38]"
              : "cursor-not-allowed opacity-50"
          }`}
        >
          <div className="w-16 h-16 flex items-center justify-center mb-0">
            <Image src={group1icon} alt="group1icon" />
          </div>
          <p className="text-[#DFDFE0] font-medium text-center">
            {isWalletConnected
              ? "Create crowd funding"
              : "Connect wallet to create"}
          </p>
          {!isWalletConnected && (
            <p className="text-[#8398AD] text-xs mt-2 text-center">
              Please connect your wallet first
            </p>
          )}
        </div>

        {/* Existing Funding Cards */}
        {paginatedFundings?.map((funding) => {
          const findPool = poolData?.find((data) =>
            //@ts-expect-error parmas can be undefined
            compareAddresses(data?.pool_address, funding?.pool_address)
          );
          return (
            <div
              key={funding.id}
              className="bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6 hover:bg-[#282e3883] transition-colors duration-200"
            >
              {/* Header with Title and Progress */}
              <div className="flex justify-between items-start mb-4 border-b border-[#FFFFFF0D] pb-4">
                <h3 className="text-[#DFDFE0] font-semibold text-lg">
                  {findPool?.name || funding.name}
                </h3>
                <span className="bg-[#10273E] text-[#0073E6] text-xs px-2 py-1 rounded-sm">
                  {/* {funding.progress}% Complete */}
                </span>
              </div>

              {/* Funding Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8398AD]" />
                  <span className="text-[#8398AD] text-sm">
                    Donors {funding?.donors || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8398AD]" />
                  <span className="text-[#8398AD] text-sm">
                    Date Created {funding?.create_at || ""}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-[#282e38] rounded-full h-2">
                  <div
                    className="bg-[#0073E6] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (Number.parseFloat(funding.balance.toString()) /
                          1e18 /
                          Number.parseFloat(funding.target.toString())) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#8398AD] mt-1">
                  {/* <span>{funding.currentAmount}</span>
              <span>{funding.targetAmount}</span> */}
                </div>
              </div>

              {/* View Details Button */}
              <Link
                href={`/dashboard/crowd-fund/details/${generateShortIdFromPoolId(
                  funding.id.toString()
                )}/${funding.id}`}
                className="w-full bg-[#FFFFFF0D] cursor-pointer border border-[#FFFFFF0D] text-[#DFDFE0] py-2 px-4 rounded-sm hover:bg-[#282e38] transition-colors duration-200 text-sm"
              >
                View Details
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {reversedFundings && reversedFundings.length > 0 && (
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-16">
          <div className="text-sm text-[#E2E2E2]">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, reversedFundings?.length || 0)} of{" "}
            {reversedFundings?.length || 0} results
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
      )}
    </div>
  );
};

export default CrowdFundDashboard;
