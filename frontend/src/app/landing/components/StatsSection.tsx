"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminMetricsService } from "@/services/adminMetricsService";
import { formatCompactNumber } from "@/utils/chartHelpers";

export default function StatsSection() {
  const [totalDisbursed, setTotalDisbursed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await AdminMetricsService.getTransferMetrics();

        // Sum USDC and USDT combined totals (both have 6 decimals)
        const usdc = parseFloat(metrics.total_usdc_combined) / 1e6;
        const usdt = parseFloat(metrics.total_usdt_combined) / 1e6;

        setTotalDisbursed(usdc + usdt);
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
    <section className="font-anton w-full py-20 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E2032] via-[#0B0C15] to-[#0B0C15]">
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
