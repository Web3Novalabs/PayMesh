"use client";

import React from "react";

export default function StatsSection() {
  return (
    <section className="w-full py-20 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E2032] via-[#0B0C15] to-[#0B0C15]">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
          $4,000
        </h2>
        <p className="text-[#8398AD] text-sm md:text-base font-bold uppercase tracking-widest">
          TOTAL DISBURSEMENT OF FUNDS ON PAYMESH
        </p>
      </div>
    </section>
  );
}
