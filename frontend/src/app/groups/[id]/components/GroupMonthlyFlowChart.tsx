"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HistoryItem } from "@/types/groups";
import { getTokenName, getDecimals } from "@/utils/pdf/formatters";

interface GroupMonthlyFlowChartProps {
  history: HistoryItem[];
}

const COLORS: Record<string, string> = {
  USDC: "#2775CA",
  USDT: "#26A17B",
  ETH: "#627EEA",
  WBTC: "#F7931A",
  STRK: "#EC796B",
  Unknown: "#888888",
};

const GroupMonthlyFlowChart = ({ history }: GroupMonthlyFlowChartProps) => {
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const grouped = history.reduce((acc, item) => {
      const date = new Date(item.paid_at);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      // Ensure specific consistent casing for address lookup if needed
      // But assuming getTokenName handles it or we handle it here
      const tokenName = getTokenName(item.token_address?.toLowerCase());
      const decimals = getDecimals(tokenName);

      // Parse amount (assuming raw string from contract) using direct math
      // instead of formatAmount which adds symbols
      const amount =
        parseFloat(item.total_amount_paid) / Math.pow(10, decimals);

      if (!acc[monthKey]) {
        acc[monthKey] = {
          name: monthKey,
          timestamp: date.getTime(), // for sorting
        };
      }

      // Aggregate
      acc[monthKey][tokenName] =
        ((acc[monthKey][tokenName] as number) || 0) + amount;

      return acc;
    }, {} as Record<string, { name: string; timestamp: number; [key: string]: string | number }>);

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [history]);

  // Extract unique tokens present in the data for creating bars
  const tokens = useMemo(() => {
    const tokenSet = new Set<string>();
    chartData.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (key !== "name" && key !== "timestamp") {
          tokenSet.add(key);
        }
      });
    });
    return Array.from(tokenSet);
  }, [chartData]);

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#FFFFFF05] border border-[#232542] rounded-lg p-6">
      <h2 className="text-[#E2E2E2] text-lg font-semibold mb-6">
        Monthly Token Flow
      </h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#8398AD"
              tick={{ fill: "#8398AD", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#ffffff10" }}
            />
            <YAxis
              stroke="#8398AD"
              tick={{ fill: "#8398AD", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#ffffff10" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1C29", // Dark styling
                borderColor: "#232542",
                color: "#E2E2E2",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#E2E2E2" }}
              cursor={{ fill: "#ffffff05" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />

            {tokens.map((token) => (
              <Bar
                key={token}
                dataKey={token}
                name={token}
                fill={COLORS[token] || COLORS.Unknown}
                stackId="a" // Stacked bar chart
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GroupMonthlyFlowChart;
