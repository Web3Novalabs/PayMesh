"use client";

import React, { useState } from "react";
import Image from "next/image";
import group1icon from "../../../public/PlusCircle.svg";
import group2icon from "../../../public/tranx.svg";
import group3icon from "../../../public/UsersFour.svg";
import group4icon from "../../../public/Handshake.svg";
import Link from "next/link";

const MainGroupLinksData = [
  {
    name: "Create new group",
    icon: <Image src={group1icon} alt="icon" />,
    description: "Choose between argent or braavos",
    link: "/dashboard/create-new-group",
  },
  {
    name: "My groups",
    icon: <Image src={group3icon} alt="icon" />,
    description: "Create a new group to pool funds",
    link: "/dashboard/my-groups",
  },
  {
    name: "Crowd Funding",
    icon: <Image src={group4icon} alt="icon" />,
    description: "Receive funds from multiple wallets",
    link: "/dashboard/crowd-fund",
  },
  {
    name: "Transactions",
    icon: <Image src={group2icon} alt="icon" />,
    description: "Use address to receive tokens ",
    link: "/dashboard/transactions",
  },
];

const MainGroupLinks = () => {
  const [activeLink, setActiveLink] = useState("/dashboard/create-new-group");

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
  };

  return (
    <div>
      <div className="mt-7">
        <h1 className="bg-gradient-to-r from-[#DFDFE0] to-[#0f1011] bg-clip-text pt-6 pb-2 text-transparent font-semibold text-[24px] sm:text-[34px]">
          Welcome to Paymesh
        </h1>

        <p className="text-[#8398AD] text-sm sm:text-base md:text-lg font-medium">
          Create a funding group, share a single deposit address, and
          automatically distribute <br /> funds to members.
        </p>
      </div>

      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-auto justify-center gap-4 sm:gap-5 mt-16 sm:mt-18 md:mt-10 pb-20 md:pb-16 px-4 sm:px-6 lg:px-0">
        {MainGroupLinksData.map((link, index) => (
          <Link
            href={link.link}
            key={index}
            className={`flex flex-col items-center cursor-pointer text-center justify-center p-4 sm:p-6 rounded-3xl hover:scale-105 transition-all w-full min-h-[140px] sm:min-h-[160px] ${
              link.link === activeLink
                ? "border-gradient-flow"
                : "border-gradient-flow-active"
            }`}
            onClick={() => handleLinkClick(link.link)}
          >
            <div className="mb-4">{link.icon}</div>

            <div className="flex flex-col items-center justify-center space-y-2">
              <h1 className="text-white text-sm sm:text-base md:text-lg font-semibold">
                {link.name}
              </h1>
              <p className="text-[#8398AD] text-xs sm:text-sm md:text-base font-medium">
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MainGroupLinks;
