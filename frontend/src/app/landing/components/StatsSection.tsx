"use client";

import React from "react";
import { motion } from "framer-motion";

export default function StatsSection() {
  return (
    <section className="font-anton w-full py-20 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E2032] via-[#0B0C15] to-[#0B0C15]">
      <motion.div
        className="max-w-4xl mx-auto px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-5xl md:text-[100px] text-white mb-4">$4,000</h2>
        <p className="text-[#FFFFFF] text-lg md:text-[24px] uppercase">
          TOTAL DISBURSEMENT OF FUNDS ON PAYMESH
        </p>
      </motion.div>
    </section>
  );
}
