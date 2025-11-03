"use client";
import { route } from "@/utils/route";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/navLogo.svg";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <nav className="flex text-white justify-between items-center uppercase font-anton text-xl ">
      <Link
        href="/"
        className="flex items-center gap-3 border border-[#232542] rounded-full py-1 px-3 cursor-pointer"
      >
        <Image src={logo} alt="paymesh logo" />
        <h1 className="text-[28px] font-normal">Paymesh</h1>
      </Link>
      <ul className="flex justify-between items-center gap-1 border border-[#232542] p-1 rounded-full text-xl">
        {route.map((links, key) => {
          return (
            <Link
              className={`${
                pathname.includes(links.url) ? "bg-[#575EB7]" : ""
              } cursor-pointer font-extrabold text-sm font-dmsans px-6 py-2 rounded-full`}
              href={links.url}
              key={key}
            >
              {links.label}
            </Link>
          );
        })}
      </ul>
      <button className="bg-[#4950B1] rounded-full px-6 py-2 cursor-pointer">
        CONNECT WALLET
      </button>
    </nav>
  );
}
