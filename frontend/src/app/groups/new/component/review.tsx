"use client";
import { formatAddress } from "@/utils/helpers";
import { useState } from "react";

export default function Review() {
  const [agreeTerms, setAgreeTerms] = useState(false);
  return (
    <div className="text-white md:p-8 pt-0 md:pt-0 flex flex-col overflow-x-hidden gap-6">
      <h1 className="text-xl md:text-2xl font-medium">Review</h1>
      <div className="overflow-scroll h-[350px]  w-full scrollbar-hide flex flex-col gap-2">
        <table
          className="w-full text-base bg-card-bg"
          role="table"
          aria-label="group members"
        >
          <thead className="border-b border-moon-blue text-gray-text  ">
            <tr>
              <th className="px-4 py-3 text-left" scope="col" aria-label="date">
                S/N
              </th>
              <th
                className="px-4 py-3 text-center "
                scope="col"
                aria-label="project name"
              >
                Group Address
              </th>
              <th
                className="px-4 py-3 text-right"
                scope="col"
                aria-label="Wallet address transfer to"
              >
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              className="border-b border-moon-blue  text-sm border-dark-border-gray last:border-b-0 transition-colors py-4"
              role="row"
            >
              <td
                className="bg-inherit px-4 py-5"
                role="gridcell"
                aria-label=""
              >
                1
              </td>
              <td
                className="z-10 px-4 py-5 font-medium text-center"
                role="gridcell"
                aria-label={``}
              >
                <span className="md:hidden">
                  {formatAddress("0x4A7d5cB67eA4F6e4B7cC3B3aE3f8fD9bB2cF9a1B")}
                </span>
                <span className="hidden md:block">
                  0x4A7d5cB67eA4F6e4B7cC3B3aE3f8fD9bB2cF9a1B
                </span>
              </td>
              <td
                className="px-4 py-5 text-xs md:text-sm text-end"
                role="gridcell"
                aria-label=""
              >
                Equal split
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => {
              setAgreeTerms((prev) => !prev);
            }}
            className={` rounded-full  border-moon-blue p-1.5 border`}
          >
            <div
              className={`${
                agreeTerms ? "bg-[#4950B1]" : "bg-none"
              } w-3.5 h-3.5 rounded-full`}
            />
          </button>
          <span className="text-base">
            By checking I accept the creation fee and confirm members and
            percentages are correct.
          </span>
        </div>
      </div>
    </div>
  );
}
