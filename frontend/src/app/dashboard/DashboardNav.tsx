import WalletConnect from "../components/WalletConnect";
import logo from "../../../public/paymeshLogo.svg";
import Image from "next/image";
import Link from "next/link";

const DashboardNav = () => {
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Image src={logo} alt="logo" className="cursor-pointer" />
        </Link>
        <div className="flex items-center justify-center gap-4">
          <WalletConnect />
        </div>
      </div>
    </div>
  );
};

export default DashboardNav;
