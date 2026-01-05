"use client";

import { useAccount } from "@starknet-react/core";
import { isAdmin } from "@/utils/admin";
import { notFound } from "next/navigation";
import { TrendingUp, BarChart3 } from "lucide-react";
import Image from "next/image";
import gearIcon from "../../../../public/Gear.svg";
import CombinedMonthlyChart from "./components/CombinedMonthlyChart";
import GroupsWeeklyChart from "./components/GroupsWeeklyChart";
import GroupsMonthlyChart from "./components/GroupsMonthlyChart";
import CrowdfundingWeeklyChart from "./components/CrowdfundingWeeklyChart";
import CrowdfundingMonthlyChart from "./components/CrowdfundingMonthlyChart";

export default function AnalyticsPage() {
  const { address } = useAccount();

  // // Protect admin route - show 404 if not admin
  // if (!isAdmin(address)) {
  //   notFound();
  // }

  return (
    <main className="min-h-screen rounded-lg sm:px-8 md:px-14 lg:px-20 pt-10 pb-2 max-w-sit-screen px-5 mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#4950B1] to-[#5961ce] p-3">
            <Image src={gearIcon} alt="Analytics" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#9BB4EE]">
              Platform Analytics
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#DFDFE0] to-[#8398AD] bg-clip-text text-transparent">
              Payout Analytics Dashboard
            </h1>
          </div>
        </div>
        <p className="max-w-3xl text-[#8398AD]">
          Visualize payout trends and transaction flows across groups and
          crowdfunding campaigns.
        </p>
      </div>

      {/* Combined Overview */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#4950B1]" />
          Platform Overview
        </h2>
        <CombinedMonthlyChart />
      </section>

      {/* Groups Analytics */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#4950B1]" />
          Groups Payout Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GroupsWeeklyChart />
          <GroupsMonthlyChart />
        </div>
      </section>

      {/* Crowdfunding Analytics */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#4950B1]" />
          Crowdfunding Payout Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CrowdfundingWeeklyChart />
          <CrowdfundingMonthlyChart />
        </div>
      </section>
    </main>
  );
}
