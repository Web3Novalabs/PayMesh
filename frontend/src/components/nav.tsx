"use client";

import { route } from "@/utils/route";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/navLogo.svg";
import { usePathname } from "next/navigation";
import WalletConnect from "@/app/components/WalletConnect";
import { useEffect, useState } from "react";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className={`w-full fixed top-0 left-0 right-0 z-50 h-fit text-text-white px-5 transition-all duration-300 ${
        scrolled ? "bg-[#0F111A]/20 backdrop-blur-lg" : ""
      }`}
    >
      <nav className="flex justify-between max-w-sit-screen items-stretch uppercase font-anton text-xl py-4 mx-auto">
        <Link
          href="/"
          className="flex items-center gap-3 border border-[#232542] rounded-full py-1 px-3 cursor-pointer"
        >
          <Image className="" src={logo} alt="paymesh logo" />
          <h1 className="text-base md:text-[28px] font-normal">Paymesh</h1>
        </Link>

        <ul className="hidden xl:flex justify-between items-center gap-1 border border-moon-blue p-1 rounded-full text-xl">
          {route.map((links, key) => (
            <Link
              key={key}
              className={`${
                pathname.includes(links.url) ? "bg-purple-bg" : ""
              } cursor-pointer font-extrabold text-sm font-dmsans px-6 py-2 rounded-full`}
              href={links.url}
            >
              {links.label}
            </Link>
          ))}
        </ul>

        <WalletConnect />
      </nav>
    </section>
  );
}
