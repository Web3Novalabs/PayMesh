"use client";
import { route } from "@/utils/route";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/navLogo.svg";
import { usePathname } from "next/navigation";
import WalletConnect from "@/app/components/WalletConnect";

export default function Nav() {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <section className="w-full fixed top-0 left-0 right-0 z-50 h-fit text-text-white">
      <nav className="flex justify-between max-w-sit-screen items-center uppercase font-anton text-xl py-4 mx-auto">
        <Link
          href="/"
          className="flex items-center gap-3 border border-[#232542] rounded-full py-1 px-3 cursor-pointer"
        >
          <Image src={logo} alt="paymesh logo" />
          <h1 className="text-[28px] font-normal">Paymesh</h1>
        </Link>
        <ul className="flex justify-between items-center gap-1 border border-moon-blue p-1 rounded-full text-xl">
          {route.map((links, key) => {
            return (
              <Link
                className={`${
                  pathname.includes(links.url) ? "bg-purple-bg" : ""
                } cursor-pointer font-extrabold text-sm font-dmsans px-6 py-2 rounded-full`}
                href={links.url}
                key={key}
              >
                {links.label}
              </Link>
            );
          })}
        </ul>
        <WalletConnect />
      </nav>
    </section>
  );
}
