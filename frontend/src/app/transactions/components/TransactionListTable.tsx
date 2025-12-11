"use client";

import React from "react";
import Image from "next/image";

interface TransactionBreakdown {
  token: string;
  amount: string;
  iconColor: string;
  icon: string;
}

interface TransactionItem {
  id: number | string;
  groupName: string;
  groupAddress: string;
  totalAmount: string;
  members: number;
  time: string;
  date: string;
  breakdown: TransactionBreakdown[];
}

interface TransactionListTableProps {
  transactions: TransactionItem[];
}

const TransactionListTable = ({ transactions }: TransactionListTableProps) => {
  if (transactions.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-[#8398AD] border border-[#232542] rounded-[8px] bg-[#FFFFFF05]">
        No transactions found
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-[8px] border font-dmsans border-[#232542]">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-7 gap-4 p-5 font-medium text-[#8398AD]  uppercase tracking-wider border-b border-[#232542] text-sm">
          <div className="col-span-1">Group Name</div>
          <div className="col-span-1">Group Address</div>
          <div className="col-span-1">Total Amount</div>
          <div className="col-span-1">Amount Breakdown</div>
          <div className="col-span-1 text-center">Members</div>
          <div className="col-span-1 text-right">Time</div>
          <div className="col-span-1 text-right">Date</div>
        </div>

        <div className="flex flex-col">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={`grid grid-cols-7 gap-4 text-base items-center hover:bg-[#FFFFFF05] transition-colors border-b border-[#232542] last:border-0 p-5`}
            >
              <div className="col-span-1 font-medium text-white">
                {tx.groupName}
              </div>
              <div className="col-span-1 text-gray-300 font-mono text-xs">
                {tx.groupAddress}
              </div>
              <div className="col-span-1 text-white font-semibold">
                {tx.totalAmount}
              </div>

              {/* Breakdown with Tooltip */}
              <div className="col-span-1 relative group flex">
                {tx.breakdown.slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="relative w-7 h-7 rounded-full border-2 border-[#13141C] overflow-hidden shadow-sm -ml-1 first:ml-0 ring-2 ring-[#0F111A] flex"
                    title={item.token}
                  >
                    <Image
                      src={item.icon}
                      alt={item.token}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover rounded-full"
                      unoptimized
                    />
                  </div>
                ))}
                {tx.breakdown.length > 4 && (
                  <div className="w-7 h-7 rounded-full border-2 border-[#13141C] bg-[#2A2D3D] flex items-center justify-center text-[9px] text-gray-300 font-medium shadow-sm -ml-1 ring-2 ring-[#0F111A]">
                    +{tx.breakdown.length - 4}
                  </div>
                )}

                {/* Tooltip Content */}
                <div className="absolute left-0 bottom-full mb-2 w-48 rounded-lg bg-[#1F2133]/80 backdrop-blur-[590px] p-3 shadow-xl border border-[#232542] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-1 group-hover:translate-y-0">
                  <div className="text-xs font-semibold text-white mb-2 pb-2 border-b border-[#232542]">
                    {tx.groupName}
                  </div>
                  <div className="space-y-1.5">
                    {tx.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          {/* <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.iconColor }}
                          /> */}
                          <Image
                            src={item.icon}
                            alt={item.token}
                            width={16}
                            height={16}
                            className="rounded-full"
                          />

                          <span className="text-gray-300">{item.token}</span>
                        </div>
                        <span className="text-white font-mono">
                          {item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-1 text-center text-gray-300">
                {tx.members}
              </div>
              <div className="col-span-1 text-right text-gray-400">
                {tx.time}
              </div>
              <div className="col-span-1 text-right text-gray-400">
                {tx.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionListTable;
