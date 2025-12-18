"use client";

import { useState, useEffect } from "react";
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
import { AdminMetricsService } from "@/services/adminMetricsService";
import {
  groupByMonth,
  getActiveTokens,
  getTokenColor,
  TOKEN_CONFIG,
} from "@/utils/chartHelpers";
import { MonthlyData } from "@/types/adminMetrics";

export default function CrowdfundingMonthlyChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response =
          await AdminMetricsService.getCrowdfundingPayoutTimeline();
        const monthlyData = groupByMonth(response.payouts);
        setData(monthlyData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch crowdfunding payout timeline:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#0B0C15] border border-[#1E2032] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#DFDFE0] mb-4">
          Crowdfunding Monthly Payout Flow
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-[#8398AD]">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="bg-[#0B0C15] border border-[#1E2032] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#DFDFE0] mb-4">
          Crowdfunding Monthly Payout Flow
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-[#8398AD]">
            {error ? "Failed to load chart data" : "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const activeTokens = getActiveTokens(data);

  return (
    <div className="bg-[#0B0C15] border border-[#1E2032] rounded-xl p-6">
      <h3 className="text-xl font-semibold text-[#DFDFE0] mb-4">
        Crowdfunding Monthly Payout Flow
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2032" />
          <XAxis dataKey="month" stroke="#8398AD" />
          <YAxis stroke="#8398AD" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E2032",
              border: "1px solid #4950B1",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#DFDFE0" }}
          />
          <Legend />
          {activeTokens.map((token) => {
            const tokenAddr = Object.keys(TOKEN_CONFIG).find(
              (addr) => TOKEN_CONFIG[addr].symbol === token
            );
            return (
              <Bar
                key={token}
                dataKey={token}
                fill={getTokenColor(tokenAddr || "")}
                name={token}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
