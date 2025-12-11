"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useGetAllPools } from "@/hooks/useContractInteraction";
import { pool } from "@/types/usdcDataApi";
import { compareAddresses } from "@/utils/contract";

export default function ActiveCrowdFundingCard() {
  const { createdPool: contractPools } = useGetAllPools();
  const [apiPoolData, setApiPoolData] = useState<pool[] | null>(null);

  const getPoolsData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crowdfunding/pools`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pools");
      }

      const data = await response.json();
      setApiPoolData(data);
    } catch (error) {
      console.error("Error fetching pools:", error);
    }
  }, []);

  useEffect(() => {
    getPoolsData();
  }, [getPoolsData]);

  const activePools = contractPools
    ?.filter((p) => !p.is_completed)
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="bg-[#FFFFFF0D] border border-[#232542] rounded-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#E2E2E2] text-lg font-medium">
          Active Crowd Funding
        </h2>
        <Link
          href="/fundraiser"
          className="text-[#E2E2E2] text-sm bg-[#FFFFFF0D] px-4 py-1.5 rounded-full hover:bg-[#FFFFFF1A] transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 mb-4 text-[#8398AD] text-sm">
          <div>Name</div>
          <div className="text-right">Progress</div>
        </div>

        <div className="flex flex-col gap-4">
          {activePools && activePools.length > 0 ? (
            activePools.map((pool) => {
              const apiDetails = apiPoolData?.find((data) => {
                return compareAddresses(
                  data.crowd_funding.pool_address,
                  pool.pool_address.toString(16)
                );
              });

              const displayName = apiDetails?.crowd_funding.name || pool.name;

              const balance = pool.balance;
              const target = pool.target;

              const isComplete =
                apiDetails?.crowd_funding.is_complete || pool.is_completed;

              const progress = isComplete
                ? 100
                : target > 0
                ? Math.min(
                    (Number.parseFloat(balance.toString()) /
                      1e18 /
                      Number.parseFloat(target.toString())) *
                      100,
                    100
                  )
                : 0;
              const displayProgress = Math.round(progress);

              return (
                <Link
                  href={`/fundraiser/${pool.pool_address}`}
                  key={pool.id}
                  className="grid grid-cols-2 items-center py-2 hover:bg-[#FFFFFF05] rounded-lg transition-colors cursor-pointer -mx-2 px-2"
                >
                  <div className="text-[#E2E2E2] truncate pr-4">
                    {displayName}
                  </div>

                  <div className="flex items-center justify-end">
                    <div className="text-sm bg-[#FFFFFF05] gap-2 w-full max-w-[140px] border border-[#1E2129] rounded-full py-1 px-2 flex items-center justify-between">
                      <div className="bg-[#D9D9D9] h-1.5 rounded-full w-full mx-2">
                        <span
                          className="bg-[#4950B1] h-full block rounded-full"
                          style={{
                            width: `${displayProgress}%`,
                          }}
                        />
                      </div>

                      <span className="text-[#8398AD] text-xs whitespace-nowrap">
                        {displayProgress}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-[#8398AD] text-center py-4 text-sm">
              No active campaigns
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
