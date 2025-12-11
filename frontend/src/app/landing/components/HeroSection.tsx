"use client";

import React from "react";
import Link from "next/link";
import MovieIcon from "@/components/icons/movie";

export default function HeroSection() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center text-center my-20">
      <div className="max-w-3xl mx-auto space-y-1">
        <h1 className="text-3xl sm:text-4xl font-anton lg:text-[90px] font-black text-white tracking-tight uppercase">
          REVOLUTIONIZING HOW <br />
          <span className="text-white">MONEY IS SHARED</span>
        </h1>

        <p className="text-[#9EB3C9] text-sm md:text-base font-extrabold tracking-wide uppercase">
          GET PAID AND WATCH THE MAGIC OF PAYMESH
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          <Link
            href="/overview"
            className="bg-[#5B63D6] hover:bg-[#4a51b3] text-white px-8 py-3 rounded-full text-sm font-bold transition-transform hover:scale-105"
          >
            LAUNCH APP
          </Link>

          <button className="flex items-center gap-2 border border-[#2A2D45] hover:bg-[#FFFFFF05] text-[#E2E2E2] px-8 py-3 rounded-full text-sm font-bold transition-all">
            <span>DEMO</span>
            <MovieIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
