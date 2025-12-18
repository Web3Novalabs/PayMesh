"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AdminMetricsService } from "@/services/adminMetricsService";
import {
  getAvailableWeeks,
  getWeekData,
  getActiveTokens,
  getTokenColor,
  TOKEN_CONFIG,
} from "@/utils/chartHelpers";
import { DailyData, GroupPayoutRecord } from "@/types/adminMetrics";

export default function GroupsWeeklyChart() {
  const [allPayouts, setAllPayouts] = useState<GroupPayoutRecord[]>([]);
  const [data, setData] = useState<DailyData[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<
    { weekNumber: number; year: number; label: string }[]
  >([]);
  const [selectedWeek, setSelectedWeek] = useState<{
    weekNumber: number;
    year: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AdminMetricsService.getGroupPayoutTimeline();
        setAllPayouts(response.payouts);

        const weeks = getAvailableWeeks(response.payouts);
        setAvailableWeeks(weeks);

        // Select most recent week by default
        if (weeks.length > 0) {
          const latestWeek = weeks[0];
          setSelectedWeek({
            weekNumber: latestWeek.weekNumber,
            year: latestWeek.year,
          });
          const weekData = getWeekData(
            response.payouts,
            latestWeek.weekNumber,
            latestWeek.year
          );
          setData(weekData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch group payout timeline:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWeekChange = (weekNumber: number, year: number) => {
    setSelectedWeek({ weekNumber, year });
    const weekData = getWeekData(allPayouts, weekNumber, year);
    setData(weekData);
  };

  if (loading) {
    return (
      <div className="bg-[#0B0C15] border border-[#1E2032] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#DFDFE0] mb-4">
          Groups Weekly Payout Flow (Daily Breakdown)
        </h3>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-[#8398AD]">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error || availableWeeks.length === 0) {
    return (
      <div className="bg-[#0B0C15] border border-[#1E2032] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[#DFDFE0] mb-4">
          Groups Weekly Payout Flow (Daily Breakdown)
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#DFDFE0]">
          Groups Weekly Payout Flow (Daily Breakdown)
        </h3>
        <select
          value={
            selectedWeek
              ? `${selectedWeek.year}-W${selectedWeek.weekNumber}`
              : ""
          }
          onChange={(e) => {
            const [year, week] = e.target.value.split("-W");
            handleWeekChange(parseInt(week), parseInt(year));
          }}
          className="bg-[#1E2032] text-[#DFDFE0] border border-[#4950B1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4950B1]"
        >
          {availableWeeks.map((week) => (
            <option
              key={`${week.year}-W${week.weekNumber}`}
              value={`${week.year}-W${week.weekNumber}`}
            >
              {week.label}
            </option>
          ))}
        </select>
      </div>

      {data.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-[#8398AD]">No payouts in this week</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <defs>
              {activeTokens.map((token) => {
                const tokenAddr = Object.keys(TOKEN_CONFIG).find(
                  (addr) => TOKEN_CONFIG[addr].symbol === token
                );
                const color = getTokenColor(tokenAddr || "");
                return (
                  <linearGradient
                    key={`gradient-${token}`}
                    id={`color${token}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2032" />
            <XAxis dataKey="day" stroke="#8398AD" />
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
                <Area
                  key={token}
                  type="monotone"
                  dataKey={token}
                  stackId="1"
                  stroke={getTokenColor(tokenAddr || "")}
                  fill={`url(#color${token})`}
                  name={token}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
