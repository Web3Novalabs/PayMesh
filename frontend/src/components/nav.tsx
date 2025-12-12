"use client";

import { route } from "@/utils/route";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/navLogo.svg";
import { usePathname } from "next/navigation";
import WalletConnect from "@/app/components/WalletConnect";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAccount } from "@starknet-react/core";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  // Close menu when wallet connects/disconnects or changes account
  useEffect(() => {
    setIsOpen(false);
  }, [isConnected, address]);

  return (
    <section
      className={`w-full fixed top-0 left-0 right-0 z-50 h-fit text-text-white px-5 transition-all duration-300 ${
        scrolled ? "bg-[#0f111aea] shadow-md py-4" : "bg-transparent py-4"
      }`}
    >
      {pathname !== "/" && (
        <nav className="flex justify-between w-full max-w-sit-screen items-stretch uppercase font-anton text-xl mx-auto relative flex-nowrap">
          <Link
            href="/"
            className="flex items-center gap-3 border border-[#232542] rounded-full py-1 px-3 cursor-pointer z-50 relative"
            onClick={() => setIsOpen(false)}
          >
            <Image className="" src={logo} alt="paymesh logo" />
            <h1 className="text-base md:text-[28px] font-normal">Paymesh</h1>
          </Link>

          {/* Desktop Menu */}
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

          <div className="flex items-center gap-4 z-50 relative">
            <div className="hidden sm:block">
              <WalletConnect />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="xl:hidden p-2 text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          <div
            className={`fixed inset-0 bg-[#0F111A] z-40 transition-transform duration-300 ease-in-out xl:hidden flex flex-col items-center justify-center gap-8 ${
              isOpen ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <ul className="flex flex-col items-center gap-6">
              {route.map((links, key) => (
                <Link
                  key={key}
                  className={`${
                    pathname.includes(links.url)
                      ? "text-[#4950B1]"
                      : "text-white"
                  } cursor-pointer font-extrabold text-2xl font-dmsans hover:text-[#4950B1] transition-colors`}
                  href={links.url}
                  onClick={() => setIsOpen(false)}
                >
                  {links.label}
                </Link>
              ))}
            </ul>

            <div className="sm:hidden">
              <WalletConnect />
            </div>
          </div>
        </nav>
      )}

      {pathname === "/" && (
        <nav className="flex sm:justify-between justify-center max-w-sit-screen items-stretch uppercase font-anton text-xl mx-auto gap-4 w-full">
          <div className="flex justify-between items-center gap-6 border border-[#232542] rounded-full py-1 px-3 cursor-pointer w-full">
            <Link
              href="/"
              className="flex items-center gap-3 cursor-pointer z-50 relative"
            >
              <Image className="" src={logo} alt="paymesh logo" />
              <h1 className="text-base md:text-[28px] font-normal">Paymesh</h1>
            </Link>

            <Link
              href="/overview"
              className={`
              bg-purple-bg
            cursor-pointer  font-extrabold text-xs sm:text-sm font-dmsans px-3 sm:px-6 py-2 grid place-content-center rounded-full`}
            >
              LAUNCH APP
            </Link>
          </div>
        </nav>
      )}
    </section>
  );
}
