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
import {
  AdminMetricsService,
  VolumeSource,
  ANALYSIS_CONFIG,
} from "@/services/adminMetricsService";
import {
  groupByMonth,
  getActiveTokens,
  getTokenColor,
  TOKEN_CONFIG,
} from "@/utils/chartHelpers";
import { PayoutRecord, MonthlyData } from "@/types/adminMetrics";

export default function GroupsMonthlyChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AdminMetricsService.getVolume({
          sources: VolumeSource.PaymentGroup,
          direction: ANALYSIS_CONFIG.groupsDirection,
        });

        // Map to PayoutRecord-compatible format for helpers
        const payouts = response.map((item) => ({
          payout_at: item.time,
          amount: item.token_amount,
          token_address: item.token_address,
          source: "group",
        }));

        const monthlyData = groupByMonth(payouts as PayoutRecord[]);
        setData(monthlyData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch group volume:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="border border-[#1E2032] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#DFDFE0] mb-4">
          Groups Monthly Payout Flow
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-[#8398AD]">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="border border-[#1E2032] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#DFDFE0] mb-4">
          Groups Monthly Payout Flow
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
    <div className="border border-[#1E2032] rounded-xl p-6">
      <h3 className="text-xl font-semibold text-[#DFDFE0] mb-4">
        Groups Monthly Payout Flow
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
