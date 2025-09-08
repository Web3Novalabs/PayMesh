"use client";

import React, { useState } from "react";
import Image from "next/image";
import logo from "../../../public/paymeshLogo.svg";
import bravos from "../../../public/braavos_icon.jpeg.svg";
import argent from "../../../public/Argent.svg";
import flow1 from "../../../public/Group (1).svg";
import flow2 from "../../../public/Group (2).svg";
import flow3 from "../../../public/Group 3.svg";
// import paymesh_landing_bg from "../../../public/bg_Landing.png";
import paymesh_landing_bg_svg from "../../../public/Stars.svg";
import NavBarLandingPage from "../components/NavBarLandingPage";
import Link from "next/link";

const PaymeshFlow = [
  {
    title: "Connect Wallet",
    description: "Choose between argent or braavos",
    image: flow1,
  },
  {
    title: "Create a group",
    description: "Create a new group to pool funds",
    image: flow2,
  },
  {
    title: "Share funding address",
    description: "Use address to receive tokens ",
    image: flow3,
  },
];

const LandingPage = () => {
  return (
    <div className="relative min-h-screen">
      <div
        className="bg-cover bg-center bg-no-repeat w-full h-full absolute top-0 left-0 -z-10"
        style={{
          backgroundImage: `url(${paymesh_landing_bg_svg.src})`,
        }}
      />

      <div className="flex justify-center items-center pt-5 z-30">
        <Image src={logo} alt="logo" className="" />
      </div>

      <div className="flex items-center justify-center flex-col mx-auto mt-12 sm:mt-16 md:mt-24 text-center px-4 sm:px-6 md:px-0">
        <div className="bg-[#FFFFFF0D] text-white w-fit mx-auto py-2.5 px-5 rounded-sm text-sm">
          <p>Trustworthy group funding on StarkNet</p>
        </div>

        <div className="">
          <h1 className="bg-gradient-to-r from-[#DFDFE0] to-[#282B31] bg-clip-text pt-6 pb-0 text-transparent font-semibold text-[24px] sm:text-[30px] md:text-[50px]">
            Transparent group funding on Starknet
          </h1>

          <p className="text-center text-[#8398AD] text-sm sm:text-base md:text-lg font-medium">
            Create a funding group, share a single deposit address, and
            automatically distribute{" "}
            <span className="hidden sm:inline">
              <br />
            </span>{" "}
            funds to members.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
          <Link
            href="/dashboard/create-new-group"
            className="border-gradient !px-6 md:!px-16 !rounded-sm hover:scale-102 transition-all cursor-pointer"
          >
            <p>Launch App</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-[95%] sm:w-[90%] mx-auto items-center justify-center gap-4 sm:gap-5 mt-16 sm:mt-18 md:mt-20 pb-20 md:pb-16 px-6 md:px-0">
        {PaymeshFlow.map((flow, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 border-gradient-flow p-4 sm:p-6 rounded-3xl hover:scale-105 transition-all"
          >
            <Image
              src={flow.image}
              alt={flow.title}
              width={100}
              height={100}
              className="mb-4 sm:mb-7 w-16 h-16 sm:w-20 sm:h-20 md:w-[100px] md:h-[100px]"
            />
            <h3 className="text-sm sm:text-base text-white">{flow.title}</h3>
            <p className="text-center text-[#8398AD] mt-0 text-xs sm:text-sm font-medium">
              {flow.description}
            </p>
          </div>
        ))}
      </div>

      <NavBarLandingPage />
    </div>
  );
};

export default LandingPage;
