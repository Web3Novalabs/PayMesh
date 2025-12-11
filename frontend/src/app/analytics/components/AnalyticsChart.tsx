"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  name: string;
  USDT: number;
  USDC: number;
  STRK: number;
  ETH: number;
  wBTC: number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFFFFF05] border border-[#232542] p-4 rounded-xl shadow-2xl min-w-[150px]">
        <p className="text-gray-400 text-sm mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: TooltipPayload) => (
            <div
              key={entry.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-400">{entry.name}</span>
              </div>
              <span className="text-white font-medium">
                ${entry.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  return (
    <div className="w-full h-full min-h-[500px] bg-[#FFFFFF05] border border-[#232542] rounded-2xl p-6 relative overflow-hidden">
      <div className="mb-6">
        <div className="inline-block px-4 py-2 bg-[#1A1C29] border border-[#232542] rounded-full text-sm text-[#FFFFFF]">
          All Group Earnings
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              vertical={true}
              horizontal={false}
              stroke="#232542"
              strokeDasharray="0"
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dy={10}
            />
            <YAxis hide={true} domain={[0, 1200]} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#4950B1",
                strokeWidth: 1,
              }}
            />

            <Line
              type="monotone"
              dataKey="USDT"
              stroke="#26A17B"
              strokeWidth={0} // Hidden line for tooltip trigger, or thin if visible
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="USDC"
              stroke="#2775CA"
              strokeWidth={0}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="STRK"
              stroke="#627EEA" // Using approx colors
              strokeWidth={0}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="ETH"
              stroke="#A855F7"
              strokeWidth={0}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="wBTC"
              stroke="#F59E0B"
              strokeWidth={0}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;
