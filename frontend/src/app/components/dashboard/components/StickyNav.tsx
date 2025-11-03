"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
const NavItems = [
  {
    name: "Create new group",
    link: "/dashboard/create-new-group",
  },

  {
    name: "My groups",
    link: "/dashboard/my-groups",
  },
  {
    name: "Crowd Funding",
    link: "/dashboard/crowd-fund",
  },
  {
    name: "Transactions",
    link: "/dashboard/transactions",
  },
];

const StickyNav = () => {
  const [active, setActive] = useState("Create new group");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("/dashboard/create-new-group");

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`flex fixed bottom-0 left-0 w-full bg-[#0A1223] transition-all duration-500 ease-in-out items-center justify-center gap-2 sm:gap-3 md:gap-5 mt-20 ${
        isScrolled ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <ul className="flex items-center transition-all duration-500 ease-in-out space-x-4 gap-2 sm:gap-3 md:gap-5 p-2 sm:p-3">
        {NavItems.map((item, i) => {
          return (
            <Link
              href={item.link}
              key={i}
              onClick={() => handleLinkClick(item.link)}
            >
              <li
                className={` ${
                  item.name == "Crowd Funding" ? "hidden sm:block" : ""
                } cursor-pointer text-white !py-1 !px-2 sm:!px-3 md:!px-4 transition-all text-xs sm:text-sm md:text-base ${
                  item.link === activeLink
                    ? "border-gradient-create-sticky !py-1.5 sm:!py-2 md:!py-2.5 !px-4 md:!px-6"
                    : "border-gradient-create-sticky-active"
                }`}
              >
                {item.name}
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};

export default StickyNav;
