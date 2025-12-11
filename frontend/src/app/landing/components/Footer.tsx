"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-12 px-4 md:px-12 border-t border-[#FFFFFF0D] bg-[#0B0C15]">
      {/* Partners/Support */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-wrap items-center justify-center md:justify-between gap-8 opacity-70">
        <div className="flex items-center gap-8 grayscale hover:grayscale-0 transition-all">
          {/* Starknet Placeholder */}
          <span className="text-white font-bold text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full"></div> STARKNET
          </span>
          {/* Avengers Placeholder */}
          <span className="text-white font-bold text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full"></div> AVNU
          </span>
          {/* Typic Placeholder */}
          <span className="text-white font-bold text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full"></div> TYPHOON
          </span>
        </div>

        <div className="text-right">
          <span className="text-white font-black text-xl uppercase tracking-wider block">
            BUILT WITH THE BEST SUPPORT
          </span>
        </div>
      </div>

      {/* Coin Logos Row */}
      <div className="flex justify-center gap-6 mb-16 overflow-hidden">
        {/* Placeholder circles for the coin logos in footer (BTC, ETH, Starknet, USDC, USDT) */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center"
          >
            <div className="w-1/2 h-1/2 bg-white/20 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-700 rounded-md flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-wider">
            PAYMESH
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="bg-[#FFFFFF0D] px-4 py-2 rounded-full text-xs text-[#8398AD] font-bold hover:text-white transition-colors flex items-center gap-2"
          >
            DOCUMENTATION <ExternalLink size={12} />
          </Link>
          <Link
            href="#"
            className="bg-[#FFFFFF0D] px-4 py-2 rounded-full text-xs text-[#8398AD] font-bold hover:text-white transition-colors flex items-center gap-2"
          >
            X (TWITTER) <ExternalLink size={12} />
          </Link>
          <Link
            href="#"
            className="bg-[#FFFFFF0D] px-4 py-2 rounded-full text-xs text-[#8398AD] font-bold hover:text-white transition-colors flex items-center gap-2"
          >
            TELEGRAM <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
