"use client";

import { ArrowLeft, Copy, Share2 } from "lucide-react";
import handshakeIcon from "../../../../public/Handshake.svg";
import calendarIcon from "../../../../public/CalendarDots.svg";
import qrCode from "../../../../public/qr-code.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Details = () => {
  const router = useRouter();

  return (
    <div className="space-y-6 my-16">
      <button
        onClick={() => router.push("/fundraiser")}
        className="flex items-center cursor-pointer bg-[#FFFFFF0D] border border-[#FFFFFF1A] gap-2 text-[#DFDADA] hover:text-[#DFDFE0] transition-colors duration-200 py-3 px-4 rounded-4xl hover:bg-[#232542] mb-12"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Fundraisers
      </button>

      <div className="bg-[#FFFFFF05] border border-[#232542] rounded-lg">
        <div className=" flex items-center justify-between flex-col px-6 sm:flex-row gap-4 border-b border-[#232542] py-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-[#E2E2E2] font-semibold text-base leading-tight">
              Fundraiser Name
            </h2>
            <div className="flex items-center gap-2 bg-[#FFFFFF] rounded-full px-3 py-1.5 cursor-pointer">
              <span className="text-[#030407] text-sm">Share</span>
              <Share2 className="w-4 h-4 text-[#030407]" />
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#0C121D] py-2 px-5 rounded-full">
            <h3 className="text-[#8398AD] text-base border-r border-[#8398AD] pr-2">
              Funding address{" "}
            </h3>

            <span className="text-[#E2E2E2] text-sm">
              0x062dcfb96e87e035135d13bf6c420c2f514c005a679b75cee45eed8d4e395aa4
            </span>

            <Copy className="w-4 h-4 text-[#8398AD] cursor-pointer" />
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          {/* Amount Raised */}
          <div className="flex items-center space-x-5 sm:space-x-12">
            <div className="flex items-center space-x-2 border-gradient-modal border border-[#232542] w-fit rounded-full py-2.5 px-4">
              <h3 className="text-[#8398AD] border-r border-[#8398AD] pr-2">
                Amount Raised
              </h3>
              <span className="text-[#E2E2E2] text-sm">20.00 USDC</span>
            </div>

            {/* Target Amount */}
            <div className="flex items-center space-x-2 border-gradient-modal border border-[#232542] w-fit rounded-full py-2.5 px-4">
              <h3 className="text-[#8398AD] border-r border-[#8398AD] pr-2">
                Target Amount
              </h3>
              <span className="text-[#E2E2E2] text-sm">570.00 USDC</span>
            </div>

            {/* Donors */}
            <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
              <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D] flex-shrink-0">
                <Image
                  src={handshakeIcon}
                  alt="usersIcon"
                  width={20}
                  height={20}
                />
              </span>

              <div className="text-[#8398AD] text-sm flex flex-col items-center justify-center">
                <span className="text-[#8398AD] font-semibold">Donors:</span>
                <span className="text-[#DFDFE0] font-semibold">7</span>
              </div>
            </div>

            {/* Date Created */}
            <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
              <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D] flex-shrink-0">
                <Image
                  src={calendarIcon}
                  alt="calendarIcon"
                  width={20}
                  height={20}
                />
              </span>

              <div className="text-[#8398AD] text-sm flex flex-col justify-center">
                <span className="text-[#8398AD] font-semibold">
                  Date Created:
                </span>
                <span className="text-[#DFDFE0] font-semibold">
                  Feb 27th, 2025
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="bg-[#FFFFFF0D] text-[#FFFFFF] px-4 py-2.5 border border-[#FFFFFF1A] rounded-full cursor-pointer">
              Resolve Pool
            </button>

            <button className="bg-[#4950B1] text-[#FFFFFF] px-4 py-2.5 border border-[#FFFFFF1A] rounded-full cursor-pointer">
              Donate now
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-24 gap-4">
        {/* Description Panel */}
        <div className="lg:col-span-19 py-6 bg-[#FFFFFF05] border border-[#232542] rounded-lg flex flex-col h-full">
          <h2 className="text-[#E2E2E2] font-semibold border-b px-6 border-[#232542] pb-4 text-base leading-tight mb-4">
            Description
          </h2>

          <div className="text-[#8398AD] text-sm leading-relaxed px-6 space-y-4 flex-1">
            <p>
              I am currently applying for a visa that will allow me to pursue
              higher education. While this opportunity is life-changing, the
              visa application process comes with significant costs, including
              application fees, travel to the embassy, documentation, medical
              checks, and other related expenses.
            </p>
            <p>
              I am reaching out for support to cover these costs and ensure I
              don&apos;t miss this chance. Every contribution, no matter the
              size, brings me one step closer to achieving this goal. Your
              support is not just financial—it&apos;s an investment in my
              future, my dreams, and the opportunities that lie ahead.
            </p>
            <p>
              Together, we can make this possible. Thank you for believing in me
              and for being part of this journey.
            </p>
          </div>
        </div>

        {/* QR Code Panel */}
        <div className="lg:col-span-5 py-6 bg-[#FFFFFF05] border border-[#232542] rounded-lg flex flex-col h-full">
          <h2 className="text-[#E2E2E2] px-6 pb-4 border-b border-[#232542] text-center font-semibold text-base leading-tight mb-4">
            Scan to fund address
          </h2>

          <div className="flex items-center justify-center flex-1">
            <Image
              src={qrCode}
              alt="qrCode"
              className="w-full max-w-[200px] h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
