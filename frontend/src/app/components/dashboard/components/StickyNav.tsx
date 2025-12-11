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
  const [activeLink, setActiveLink] = useState("/dashboard/create-new-group");
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = React.useRef(0);

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down & passed threshold -> Hide
        setIsVisible(false);
      } else {
        // Scrolling up -> Show
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`flex fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto bg-[#0A1223]/85 backdrop-blur-xl backdrop-saturate-150 border border-[#ffffff1a] rounded-full transition-all duration-300 ease-in-out items-center justify-center gap-2 sm:gap-3 md:gap-5 z-50 shadow-lg ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0"
      }`}
    >
      <ul className="flex items-center space-x-4 gap-2 sm:gap-3 md:gap-5 p-2 sm:p-3">
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
                } cursor-pointer text-white !py-1 !px-2 sm:!px-3 md:!px-4 transition-all text-xs sm:text-sm md:text-base rounded-full ${
                  item.link === activeLink
                    ? "bg-[#232542] border border-[#ffffff1a] !py-1.5 sm:!py-2 md:!py-2.5 !px-4 md:!px-6 shadow-md"
                    : "hover:bg-[#ffffff10]"
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
