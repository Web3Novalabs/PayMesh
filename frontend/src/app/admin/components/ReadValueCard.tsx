"use client";

import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface ReadValueCardProps {
  title: string;
  value: string | number | null;
  description: string;
  icon: React.ReactNode;
  onCopy?: (value: string, title: string) => void;
  copiedAddress?: string | null;
}

export default function ReadValueCard({
  title,
  value,
  description,
  icon,
  onCopy,
  copiedAddress,
}: ReadValueCardProps) {
  const formatAddress = (addr: string) => {
    if (!addr) return "Loading...";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#232542] bg-[#FFFFFF05] p-5 transition-all hover:border-[#4950B1]/50 hover:bg-[#FFFFFF08]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-lg bg-[#4950B1]/20 p-2 text-[#4950B1]">
              {icon}
            </div>
            <h3 className="text-sm font-semibold text-[#DFDFE0]">{title}</h3>
          </div>
          <p className="mb-3 text-xs text-[#8398AD]">{description}</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-[#DFDFE0]">
              {value === null
                ? "Loading..."
                : typeof value === "number"
                ? value.toLocaleString()
                : typeof value === "string" && value.length > 20
                ? formatAddress(value)
                : value}
            </p>
            {typeof value === "string" && value.length > 20 && onCopy && (
              <button
                onClick={() => onCopy(value, title)}
                className="rounded-lg p-1 text-[#8398AD] transition-colors hover:bg-[#232542] hover:text-[#DFDFE0]"
              >
                {copiedAddress === title ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
