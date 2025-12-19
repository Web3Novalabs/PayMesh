"use client";
import React from "react";
import AnalyticsChart from "./components/AnalyticsChart";
import WalletGuard from "@/components/WalletGuard";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { GroupService } from "@/services/groupService";
import { GroupTransactionData } from "@/types/group";

import Loading from "@/components/Loading";

export default function Page() {
  const { address } = useAccount();

  const { data: allGroups = [], isLoading } = useQuery<GroupTransactionData[]>({
    queryKey: ["allGroups"],
    queryFn: () => GroupService.getAllGroups(),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return <Loading />;
  }

  const chartData = [
    { name: "Jan", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Feb", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Mar", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Apr", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "May", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Jun", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Jul", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Aug", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Sep", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Oct", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Nov", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
    { name: "Dec", USDT: 0, USDC: 0, STRK: 0, ETH: 0, wBTC: 0 },
  ];

  allGroups.forEach((item) => {
    const history = item.history;
    if (!history) return;

    history.forEach((tx) => {
      const date = new Date(tx.paid_at);
      const month = date.getMonth();

      const memberTx = tx.members.find(
        (m) => m.member_address.toLowerCase() === address?.toLowerCase()
      );

      if (!memberTx) return;

      const amount = parseFloat(memberTx.member_amount);
      const tokenAddress = tx.token_address;

      if (
        tokenAddress ===
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
      ) {
        chartData[month].STRK += amount / 1e18;
      } else if (
        tokenAddress ===
        "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8"
      ) {
        chartData[month].USDC += amount / 1e6;
      } else if (
        tokenAddress ===
        "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8"
      ) {
        chartData[month].USDT += amount / 1e6;
      } else if (
        tokenAddress ===
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
      ) {
        chartData[month].ETH += amount / 1e18;
      }
    });
  });

  return (
    <WalletGuard>
      <section className="w-full min-h-screen py-8 max-w-sit-screen px-5 mx-auto">
        <div className="container mx-auto px-4">
          <AnalyticsChart data={chartData} />
        </div>
      </section>
    </WalletGuard>
  );
}
