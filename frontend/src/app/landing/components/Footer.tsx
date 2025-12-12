"use client";

import React from "react";
import Link from "next/link";
import coins from "../../../../public/coin/Container (1).png";
import Image from "next/image";
import { gradientStops } from "@/utils/helpers";
import logo from "../../../../public/navLogo.svg";
import Tg from "@/components/icons/tg";
import X from "@/components/icons/x";
export default function Footer() {
  return (
    <footer className="w-full py-12 px-4 md:px-12">
      <div className="mb-16 overflow-hidden">
        <Image className=" w-4/5 md:w-1/2 mx-auto" src={coins} alt="coins" />
        <div
          className="w-full h-[1px] text-white"
          style={{
            background: "#000000",
            backgroundImage: `linear-gradient(#000000, #000000), linear-gradient(135deg, ${gradientStops})`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            border: "2px solid transparent",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 border border-[#232542] rounded-full py-1 px-3 cursor-pointer z-50 relative"
        >
          <Image className="" src={logo} alt="paymesh logo" />
          <h1 className="text-base uppercase md:text-[28px] font-anton">
            Paymesh
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="bg-[#FFFFFF0D] px-4 py-2 rounded-full text-xs text-[#8398AD] font-bold hover:text-white transition-colors flex items-center gap-2"
          >
            DOCUMENTATION <Tg />
          </Link>
          <Link
            href="https://x.com/paymesh_"
            target="_blank"
            className="bg-[#FFFFFF0D] px-4 py-2 rounded-full text-xs text-[#8398AD] font-bold hover:text-white transition-colors flex items-center gap-2"
          >
            X (TWITTER) <X />
          </Link>
          <Link
            href="https://t.me/web3noval"
            target="_blank"
            className="bg-[#FFFFFF0D] px-4 py-2 rounded-full text-xs text-[#8398AD] font-bold hover:text-white transition-colors flex items-center gap-2"
          >
            TELEGRAM <Tg />
          </Link>
        </div>
      </div>
    </footer>
  );
}
