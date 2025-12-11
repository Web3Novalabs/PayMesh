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
import { Search } from "lucide-react";
import plusIcon from "../../../../public/Plus.svg";
import handshakeIcon from "../../../../public/Handshake.svg";
import calendarIcon from "../../../../public/CalendarDots.svg";
import { useGetAllPools } from "@/hooks/useContractInteraction";
import Link from "next/link";
import { pool } from "@/types/usdcDataApi";
import { compareAddresses, epocTimeReadable } from "@/utils/contract";
import LoadingState from "@/components/Loading-state";
import EmptyState from "./empty-state";

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
  const itemsPerPage = 6;

  const { createdPool: pools, isLoading: isLoadingPools } = useGetAllPools();
  // console.log(pools);

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
  }, []);

  useEffect(() => {
    if (!pools) return;
    getPoolsData();
  }, [pools, getPoolsData]);

  if (isLoadingPools && !pools) {
    return (
      <LoadingState
        title="Loading Pools"
        description="Fetching your active fundraisers..."
      />
    );
  }

  if (!isLoadingPools && (paginatedFundings?.length ?? 0) === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8 mb-10">
      {/* Filtering and Search Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between ">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex justify-between sm:justify-start items-center gap-2 sm:gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="sm:w-[120px] py-6 bg-transparent border border-[#232542] rounded-4xl text-[#8398AD] px-4.5">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-[#232542] border border-[#232542] text-[#8398AD]">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-[#8398AD] w-4 h-4" />
              <Input
                type="text"
                placeholder="Search funding by name.."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full sm:w-[300px] pl-8 py-6 bg-transparent border border-[#232542] rounded-4xl text-[#8398AD] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#232542]"
              />
            </div>
          </div>

          {/* Active Funding Indicator */}
          <div className="flex space-x-2.5 sm:hidden md:flex w-full sm:w-fit items-center p-3 rounded-4xl border border-[#232542]">
            <Image
              src={handshakeIcon}
              alt="handshakeIcon"
              width={20}
              height={20}
            />
            <span className="text-[#8398AD] text-sm">
              Active Funding:{" "}
              <span className="text-[#DFDFE0] font-semibold">
                {filteredFundings?.length}
              </span>
            </span>
          </div>
        </div>

        <div
          onClick={isWalletConnected ? onCreateNew : undefined}
          className={`flex items-center justify-center w-full sm:w-fit gap-2 py-3 px-5 bg-[#4950B1] rounded-4xl ${
            isWalletConnected
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-50"
          }`}
        >
          <Image src={plusIcon} alt="plusIcon" />
          <p className="text-[#DFDFE0] font-medium text-center text-sm inline-block text-nowrap ">
            {isWalletConnected ? "Create fundraiser" : "Connect wallet"}
          </p>
        </div>
      </div>

      {/* Funding Grid Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-6">
        {/* Existing Funding Cards */}
        {paginatedFundings?.map((funding) => {
          const findPool = poolData?.find((data) => {
            return compareAddresses(
              data.crowd_funding.pool_address,
              //@ts-expect-error params can be undefined
              funding.pool_address
            );
          });

          const formattedCreateAt = epocTimeReadable(funding.create_at);

          return (
            <div
              key={funding.id}
              className="bg-[#FFFFFF05] border border-[#232542] rounded-md hover:bg-[#282e3883] transition-colors duration-200 flex flex-col w-full h-full"
            >
              {/* Header with Title */}
              <div className="flex justify-between items-center border-b border-[#232542] px-6 py-4 h-[72px]">
                <h3 className="text-[#DFDFE0] font-semibold text-lg leading-tight line-clamp-2">
                  {findPool?.crowd_funding.name || funding.name}
                </h3>
              </div>

              <div className="flex-1 flex flex-col py-4">
                {/* Progress Bar */}
                <div className="mb-4 mx-6 gap-2 flex items-center justify-between bg-[#FFFFFF05] border border-[#FFFFFF0D] rounded-full p-2">
                  <div className="w-full bg-[#282e38] rounded-full h-2">
                    <div
                      className="bg-[#4950B1] h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          findPool?.crowd_funding.is_complete
                            ? 100
                            : Math.min(
                                (Number.parseFloat(funding.balance.toString()) /
                                  1e18 /
                                  Number.parseFloat(
                                    funding.target.toString()
                                  )) *
                                  100,
                                100
                              )
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center text-sm text-[#B3B3B3] space-x-2 whitespace-nowrap ml-2">
                    <h2 className="flex items-center gap-2 font-extrabold">
                      {findPool?.crowd_funding.is_complete
                        ? 100
                        : Math.min(
                            (Number.parseFloat(funding.balance.toString()) /
                              1e18 /
                              Number.parseFloat(funding.target.toString())) *
                              100,
                            100
                          ).toFixed(2)}
                      %
                    </h2>
                    <span>Completed</span>
                  </div>
                </div>

                {/* Funding Details */}
                <div className="w-full border-y border-[#232542] py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Donors */}
                  <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
                    <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D] flex-shrink-0">
                      <Image
                        src={handshakeIcon}
                        alt="usersIcon"
                        width={20}
                        height={20}
                      />
                    </span>

                    <div className="text-[#8398AD] text-sm flex flex-col justify-center">
                      <span className="text-[#8398AD] font-semibold">
                        Donors:
                      </span>
                      <span className="text-[#DFDFE0] font-semibold">
                        {findPool?.donation_count.total_donors ||
                          funding?.donors}
                      </span>
                    </div>
                  </div>

                  {/* Date Created */}
                  <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
                    <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D] flex-shrink-0">
                      <Image
                        src={calendarIcon}
                        alt="calendarIcon"
                        width={20}
                        height={20}
                      />
                    </span>

                    <div className="text-[#8398AD] text-sm flex flex-col justify-center">
                      <span className="text-[#8398AD] font-semibold">
                        Date Created:
                      </span>
                      <span className="text-[#DFDFE0] font-semibold">
                        {formattedCreateAt || ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donate Button - Always at bottom */}
              <div className="px-6 pb-4 pt-2">
                <Link
                  href={`/fundraiser/${
                    funding.pool_address ||
                    findPool?.crowd_funding?.pool_address ||
                    funding.id
                  }`}
                  className="w-full sm:w-fit bg-[#FFFFFF0D] cursor-pointer border border-[#FFFFFF0D] text-[#FFFFFF] py-2 px-5 rounded-4xl hover:bg-[#282e38] transition-colors duration-200 text-sm inline-block text-center"
                >
                  Donate
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {reversedFundings && reversedFundings.length > 0 && (
        <div className="mt-10 mx-auto items-center flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
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
