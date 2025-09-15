"use client";

import React, { useState } from "react";
import Image from "next/image";
import logo from "../../../public/paymeshLogo.svg";
import XLogo from "../../../public/XLogo.svg";
import githubLogo from "../../../public/GithubLogo.svg";
import paymesh_landing_bg from "../../../public/bg_Landing.png";
import Link from "next/link";
import NavBarLandingPage from "../components/NavBarLandingPage";
import { Input } from "@/components/ui/input";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen">
      <div
        className="bg-cover bg-center bg-no-repeat w-full h-full absolute top-0 left-0 -z-10"
        style={{
          backgroundImage: `url(${paymesh_landing_bg.src})`,
        }}
      />

      <div className="flex justify-center items-center pt-5 z-30">
        <Image src={logo} alt="logo" className="" />
      </div>

      <div className="flex items-center justify-center flex-col mx-auto mt-12 sm:mt-16 text-center px-4 sm:px-6 md:px-0">
        <h1 className="bg-gradient-to-r from-[#DFDFE0] to-[#282B31] bg-clip-text py-6 text-transparent font-semibold text-[24px] sm:text-[25px] md:text-[34px]">
          Be the first to hear from us!
        </h1>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="https://x.com/paymesh_" target="_blank"
            className="border-gradient-links !p-2.5 rounded-sm"
          >
            <Image src={XLogo} alt="waitlist" className="cursor-pointer" />
          </Link>
          <div className="border-gradient-links !p-2.5 rounded-sm">
            <Image src={githubLogo} alt="waitlist" className="cursor-pointer" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-20 sm:mt-32 md:mt-44">
          <Image
            src={logo}
            alt="waitlist"
            className="w-32 sm:w-40 md:w-72 h-auto"
          />
        </div>

        <div className="flex items-center justify-center bg-[#FFFFFF0D] gap-2 sm:gap-3 md:gap-4 mt-16 sm:mt-20 md:mt-32 rounded-sm p-2 w-[90%] sm:w-[70%] md:w-[50%] lg:w-[35%] md:mb-28 mb-12">
          <Input
            type="email"
            placeholder="Enter your email"
            width={200}
            className="border-none outline-none bg-transparent text-[#8398AD] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-none hover:outline-none hover:ring-0 hover:border-none hover:bg-transparent text-sm sm:text-base"
          />
          <button className="border-gradient !py-1 !px-3 sm:!py-1.5 sm:!px-4 md:!py-2.5 md:!px-7 cursor-pointer text-xs sm:text-sm md:text-base hover:outline-none hover:ring-0 hover:border-none hover:bg-transparent">
            Subscribe
          </button>
        </div>
      </div>

      <NavBarLandingPage />
    </div>
  );
};

export default LandingPage;
