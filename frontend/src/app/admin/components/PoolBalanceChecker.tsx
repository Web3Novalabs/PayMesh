"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Wallet } from "lucide-react";
import { useCrowdFundReadValues } from "@/hooks/useAdminData";

export default function PoolBalanceChecker() {
  const [poolQueryAddress, setPoolQueryAddress] = useState<string>("");
  const specificPoolData = useCrowdFundReadValues(poolQueryAddress);

  return (
    <section className="mb-10">
      <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
        <Search className="w-5 h-5 text-[#4950B1]" />
        Check Any Pool Balance (usdc)
      </h2>
      <div className="rounded-2xl border border-[#232542] bg-[#FFFFFF05] p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={poolQueryAddress}
              onChange={(e) => setPoolQueryAddress(e.target.value.trim())}
              placeholder="Enter pool address (0x...)"
              className="w-full bg-[#0c111c] border-[#232542] rounded-lg text-[#DFDFE0] placeholder:text-[#8398AD] focus-visible:ring-0 focus-visible:border-[#4950B1]"
            />
          </div>
          <button
            onClick={() => setPoolQueryAddress(poolQueryAddress)}
            className="px-8 py-2 rounded-lg bg-gradient-to-r from-[#4950B1] to-[#5961ce] font-semibold text-[#DFDFE0] transition-all hover:from-[#5961ce] hover:to-[#6b73e0] flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Check Balance
          </button>
        </div>

        {poolQueryAddress &&
          poolQueryAddress.startsWith("0x") &&
          poolQueryAddress.length > 10 && (
            <div className="mt-4 p-5 rounded-xl bg-[#0c111c]/50 border border-[#4950B1]/30">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8 text-[#4950B1]" />
                <div>
                  <p className="text-sm text-[#8398AD]">Current Balance</p>
                  <p className="text-2xl font-bold text-[#DFDFE0]">
                    {specificPoolData.poolBalance !== null ? (
                      `${specificPoolData.poolBalance.toFixed(2)} USDC`
                    ) : specificPoolData.poolBalance === null &&
                      poolQueryAddress ? (
                      <span className="text-red-400">0.00 USDC</span>
                    ) : (
                      <span className="text-[#8398AD]">
                        Enter valid address
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
