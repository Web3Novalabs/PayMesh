"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AdminMetricsService,
  VolumeSource,
  FlowDirection,
} from "@/services/adminMetricsService";
import { formatCompactNumber } from "@/utils/chartHelpers";
import { USDC_ADDRESSES, compareAddresses } from "@/utils/contract";

const USDT_ADDRESS =
  "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8";

export default function StatsSection() {
  const [totalDisbursed, setTotalDisbursed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await AdminMetricsService.getVolume({
          sources: VolumeSource.Both,
          direction: FlowDirection.Both,
        });

        let total = 0;

        response.forEach((item) => {
          // Logic: Crowdfunding Inflow + Group Outflow
          const isTargetSource =
            item.source === "crowdfunding_in" ||
            item.source === "payment_group_out";

          if (!isTargetSource) return;

          // Logic: Only USDC (both) + USDT
          const isUSDC = USDC_ADDRESSES.some((addr) =>
            compareAddresses(addr, item.token_address)
          );
          const isUSDT = compareAddresses(USDT_ADDRESS, item.token_address);

          if (isUSDC || isUSDT) {
            // Both have 6 decimals
            total += parseFloat(item.token_amount) / 1e6;
          }
        });

        setTotalDisbursed(total);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const displayValue = loading
    ? "Loading..."
    : error
    ? "$0"
    : formatCompactNumber(totalDisbursed);

  return (
    <section className="font-anton w-full py-20 text-center bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#1E2032] via-[#0B0C15] to-[#0B0C15]">
      <motion.div
        className="max-w-4xl mx-auto px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-[100px] text-white mb-4">
          {displayValue}
        </h2>
        <p className="text-[#FFFFFF] text-lg md:text-[24px] uppercase">
          TOTAL DISBURSEMENT OF FUNDS ON PAYMESH
        </p>
      </motion.div>
    </section>
  );
}
