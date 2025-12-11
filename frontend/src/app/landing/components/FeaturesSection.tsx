"use client";

import React from "react";
import { Users, Coins, Wallet, ArrowRight, CheckCircle2 } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="w-full py-12 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0E0F19] border border-[#232542] rounded-2xl p-8 flex flex-col h-full hover:border-[#5B63D6] transition-colors group">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white uppercase mb-2">
              GROUPS SPLIT
            </h3>
            <p className="text-[#8398AD] text-sm leading-relaxed">
              Create a group, add member wallet addresses, and let Paymesh do
              the rest. Every group gets a unique wallet address where funds can
              be sent and automatically distributed according to pre-set
              percentages. No spreadsheets, no manual tracking—just transparent,
              automated payments that flow exactly as intended.
            </p>
          </div>

          <div className="mt-auto space-y-4">
            {/* Step 1 */}
            <div className="bg-[#0FC468] rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <span className="text-white font-bold text-sm uppercase relative z-10">
                CREATE OR JOIN A GROUP
              </span>
              <Users className="text-white/20 w-12 h-12 absolute -right-2 -bottom-2 z-0" />
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative z-10">
                <Users size={16} className="text-white" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0073E6] rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <span className="text-white font-bold text-sm uppercase relative z-10">
                GET PAID THROUGH PAYMESH ASSIGNED GROUP ADDRESS
              </span>
              <Coins className="text-white/20 w-12 h-12 absolute -right-2 -bottom-2 z-0" />
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative z-10">
                <span className="text-white font-bold">$</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#482D88] rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <span className="text-white font-bold text-sm uppercase relative z-10">
                TOKEN GETS SPLIT BY SET PERCENTAGE ON PAYMESH
              </span>
              <CheckCircle2 className="text-white/20 w-12 h-12 absolute -right-2 -bottom-2 z-0" />
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative z-10">
                <CheckCircle2 size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Fundraising Card */}
        <div className="bg-[#0E0F19] border border-[#232542] rounded-2xl p-8 flex flex-col h-full hover:border-[#5B63D6] transition-colors group">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white uppercase mb-2">
              FUNDRAISING
            </h3>
            <p className="text-[#8398AD] text-sm leading-relaxed">
              Start a fundraiser, set your target, and let Paymesh handle the
              flow. Each campaign gets a unique wallet address to receive
              contributions on-chain. Once your goal is reached, funds are
              automatically sent to the designated beneficiary wallets—secure,
              transparent, and fully automated from start to finish.
            </p>
          </div>

          <div className="mt-auto space-y-4">
            {/* Step 1 */}
            <div className="bg-[#FFFFFF] rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <span className="text-[#0E0F19] font-bold text-sm uppercase relative z-10">
                START A FUNDRAISER, SET YOUR TARGET
              </span>
              <div className="w-8 h-8 bg-[#0073E6] rounded-full flex items-center justify-center relative z-10">
                <span className="text-white font-bold">$</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#782AEB] rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <span className="text-white font-bold text-sm uppercase relative z-10">
                GET A UNIQUE WALLET ADDRESS TO RECEIVE CONTRIBUTIONS
              </span>
              <Wallet className="text-white/20 w-12 h-12 absolute -right-2 -bottom-2 z-0" />
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative z-10">
                <Wallet size={16} className="text-white" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#E4C8B8] rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <span className="text-[#4D3B31] font-bold text-sm uppercase relative z-10">
                REACH GOAL - RECEIVE FUNDS TO BENEFICIARY WALLETS
              </span>
              <ArrowRight className="text-[#4D3B31]/20 w-12 h-12 absolute -right-2 -bottom-2 z-0" />
              <div className="w-8 h-8 bg-[#4D3B31]/20 rounded-full flex items-center justify-center relative z-10">
                <ArrowRight size={16} className="text-[#4D3B31]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
