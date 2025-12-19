"use client";

import Loading from "@/components/Loading";
import { useAccount, useBalance } from "@starknet-react/core";
import { useState } from "react";
import {
  USDC_ADDRESS_1,
  USDC_ADDRESS_2,
  strkTokenAddress,
} from "@/utils/contract";

type Currency = "ETH" | "USD" | "STRK" | "USDC";

export default function UserBalance() {
  const { address } = useAccount();
  const { data: ethBalance, isLoading: isLoadingEth } = useBalance({ address });

  const { data: usdc1Balance, isLoading: isLoadingUsdc1 } = useBalance({
    token: USDC_ADDRESS_1,
    address,
  });

  const { data: usdc2Balance, isLoading: isLoadingUsdc2 } = useBalance({
    token: USDC_ADDRESS_2,
    address,
  });

  const { data: strkBalance, isLoading: isLoadingStrk } = useBalance({
    token: strkTokenAddress,
    address,
  });

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USDC");

  const formatBalance = (amount: bigint | undefined, decimals: number = 18) => {
    if (!amount) return "0.0000";
    const divisor = BigInt(10 ** decimals);
    const whole = amount / divisor;
    const fraction = amount % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0");
    return `${whole}.${fractionStr.slice(0, 4)}`;
  };

  if (!address) {
    return null;
  }

  const isLoading =
    isLoadingEth || isLoadingUsdc1 || isLoadingUsdc2 || isLoadingStrk;

  const usdcCombined =
    (usdc1Balance?.value || BigInt(0)) + (usdc2Balance?.value || BigInt(0));

  return (
    <div className="bg-[#FFFFFF05] mt-10 rounded-2xl shadow-sm border border-[#232542] p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#9BB4EE] uppercase tracking-wider">
          Wallet Balance
        </h3>
        <div className="flex bg-[#0c111c] p-1 rounded-lg border border-[#232542]">
          {(["USDC", "STRK", "ETH"] as Currency[]).map((currency) => (
            <button
              key={currency}
              onClick={() => setSelectedCurrency(currency)}
              className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                selectedCurrency === currency
                  ? "bg-[#4950B1] text-white shadow-lg"
                  : "text-[#8398AD] hover:text-[#DFDFE0] hover:bg-[#FFFFFF0A]"
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold bg-gradient-to-r from-[#DFDFE0] to-[#8398AD] bg-clip-text text-transparent">
            {selectedCurrency === "USDC"
              ? formatBalance(usdcCombined, 6)
              : selectedCurrency === "STRK"
              ? formatBalance(strkBalance?.value)
              : formatBalance(ethBalance?.value)}
          </span>
          <span className="text-sm font-medium text-[#8398AD]">
            {selectedCurrency}
          </span>
        </div>

        {selectedCurrency === "USDC" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#FFFFFF05] border border-[#232542] rounded-xl p-3">
              <p className="text-[10px] text-[#8398AD] mb-1">USDC (Legacy)</p>
              <p className="text-sm font-semibold text-[#DFDFE0]">
                {formatBalance(usdc1Balance?.value, 6)}
              </p>
            </div>
            <div className="bg-[#FFFFFF05] border border-[#232542] rounded-xl p-3">
              <p className="text-[10px] text-[#8398AD] mb-1">USDC (New)</p>
              <p className="text-sm font-semibold text-[#DFDFE0]">
                {formatBalance(usdc2Balance?.value, 6)}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-[10px] font-medium text-[#8398AD] pt-2 border-t border-[#232542]">
          <span>STRK: {formatBalance(strkBalance?.value)}</span>
          <span className="w-1 h-1 bg-[#232542] rounded-full"></span>
          <span>ETH: {formatBalance(ethBalance?.value)}</span>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-[10px] text-[#4950B1]">
          <Loading fullScreen={false} size={15} color="#4950B1" />
          <span>Syncing with blockchain...</span>
        </div>
      )}
    </div>
  );
}
