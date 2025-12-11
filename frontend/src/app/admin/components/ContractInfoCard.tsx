"use client";

import { Copy, CheckCircle2, Coins } from "lucide-react";
import Image from "next/image";

interface ContractInfoCardProps {
  title: string;
  address: string;
  usdcBalance: number | null;
  strkBalance: number | null;
  onCopy: (address: string, key: string) => void;
  copiedAddress: string | null;
  copyKey: string;
}

export default function ContractInfoCard({
  title,
  address,
  usdcBalance,
  strkBalance,
  onCopy,
  copiedAddress,
  copyKey,
}: ContractInfoCardProps) {
  const formatAddress = (addr: string) => {
    if (!addr) return "Loading...";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="rounded-xl border border-[#232542] bg-[#FFFFFF05] p-5">
      <h3 className="mb-3 text-sm font-medium text-[#9BB4EE]">{title}</h3>
      <div className="flex items-center space-x-5">
        <p className="font-mono text-sm text-[#DFDFE0]">
          {formatAddress(address)}
        </p>
        <button
          onClick={() => onCopy(address, copyKey)}
          className="cursor-pointer"
        >
          {copiedAddress === copyKey ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-[#8398AD]" />
          )}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-[#0c111c]/50 p-3 border border-[#232542]">
          <div className="flex items-center gap-2">
            <Image
              src={"/usdcImg.png"}
              alt="icon"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-[#8398AD]">USDC Balance</span>
          </div>
          <span className="text-lg font-semibold text-[#DFDFE0]">
            {usdcBalance !== null
              ? `${usdcBalance.toFixed(2)} USDC`
              : copyKey === "paymesh"
              ? "0"
              : "Loading..."}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-[#0c111c]/50 p-3 border border-[#232542]">
          <div className="flex items-center gap-2">
            <Image
              src={"/strkImg.png"}
              alt="icon"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-[#8398AD]">STRK Balance</span>
          </div>
          <span className="text-lg font-semibold text-[#DFDFE0]">
            {strkBalance !== null
              ? `${strkBalance.toFixed(4)} STRK`
              : copyKey === "paymesh"
              ? "0"
              : "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}
