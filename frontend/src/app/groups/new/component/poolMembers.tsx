"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Download, Trash } from "lucide-react";
import {
  CreateGroupFormData,
  GroupMemberShare,
  SplitType,
} from "@/types/group";
import {
  distributeEvenly,
  handleAddMember,
  handleAddressChange,
  handleCSVImport,
  handlePercentageChange,
  handleRemoveMember,
  manualDistribute,
} from "@/utils/helpers";

type SetMembers = React.Dispatch<React.SetStateAction<CreateGroupFormData>>;
export function MembersConfiguration({
  members,
  setMembers,
}: {
  members: GroupMemberShare[];
  setMembers: SetMembers;
}) {
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPercentage = members.reduce((sum, m) => {
    console.log(sum);
    return sum + (m.percentage || 0);
  }, 0);

  return (
    <div className="text-white md:p-8 pt-0  grid gap-6">
      <h1 className="text-xl md:text-2xl font-medium">Members configuration</h1>
      <div className="flex gap-8 mb-12 flex-wrap">
        <div className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => {
              setSplitType("equal");
              distributeEvenly(members, setMembers);
            }}
            className={` rounded-full  border-moon-blue p-1.5 border`}
          >
            <div
              className={`${
                splitType === "equal" ? "bg-[#4950B1]" : "bg-none"
              } w-3.5 h-3.5 rounded-full`}
            />
          </button>
          <span className="text-base md:text-xl">Equal percentage split</span>
        </div>
        <div className="flex items-center gap-3 cursor-pointer flex-wrap">
          <button
            onClick={() => {
              setSplitType("manual");
              manualDistribute(members, setMembers);
            }}
            className={` rounded-full  border-moon-blue p-1.5 border`}
          >
            <div
              className={`${
                splitType === "manual" ? "bg-[#4950B1]" : "bg-none"
              } w-3.5 h-3.5 rounded-full`}
            />
          </button>
          <span className="text-base md:text-xl">Manual percentage split</span>
          <span className="text-text-gray text-base">
            (Total percentage must equal)
          </span>
        </div>
      </div>

      <div className="mb-8 max-h-[300px] overflow-y-scroll scrollbar-hide">
        <h2 className="text-xl md:text-2xl font-semibold mb-6">
          Wallet address
        </h2>

        <div className="space-y-4">
          {members.map((member, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="enter wallet address"
                  value={member?.addr}
                  onChange={(e) =>
                    handleAddressChange(
                      member?.id,
                      e.target.value,
                      setMembers,
                      members
                    )
                  }
                  className="border border-moon-blue px-6 bg-card-bg py-7 rounded-full text-text-gray placeholder:text-text-gray"
                />
                {/* Validation Status Indicator */}
                {member.isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#8398AD] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {!member.isValidating && member.networkResult !== undefined && (
                  <div
                    className={`absolute right-3 transform ${
                      !member.isValidating && member.networkResult === null
                        ? "-translate-y-1/4 top-1/4"
                        : "-translate-y-1/2 top-1/2 "
                    }`}
                  >
                    {member.networkResult && member.networkResult !== null ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✕</span>
                      </div>
                    )}
                  </div>
                )}
                {!member.isValidating && member.networkResult === null && (
                  <div className="p-2 rounded-sm">
                    <p className="text-xs sm:text-sm text-amber-400">
                      ⚠️ This address doesn’t seem to exist on Mainnet. Please
                      confirm before proceeding.
                    </p>
                  </div>
                )}
              </div>

              <div className="w-24">
                <Input
                  type="number"
                  placeholder="%"
                  value={member.percentage || ""}
                  onChange={(e) =>
                    handlePercentageChange(
                      member.id,
                      e.target.value,
                      setMembers,
                      members
                    )
                  }
                  className="border bg-card-bg border-moon-blue px-6 py-7 rounded-full text-text-gray placeholder:text-text-gray"
                />
              </div>

              {members.length > 2 && index !== 0 && (
                <button
                  onClick={() =>
                    handleRemoveMember(member?.id ?? "", setMembers, members)
                  }
                  className="p-4 rounded-full h-full  border border-dim-white-border bg-card-bg  transition-colors"
                >
                  <Trash className="w-full h-full text-[#B26C6C]" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`
          justify-between
         flex items-center gap-4 flex-wrap`}
      >
        <div className="mt-4 text-sm bg-[#FFFFFF05] gap-3 lg:w-[254px] w-full border border-[#1E2129] rounded-full py-2 px-3 flex items-center min-h-14 lg:min-h-fit lg:h-full">
          {totalPercentage}%
          <div className="bg-[#D9D9D9] h-1.5 rounded-full w-full">
            <span
              className="bg-[#4950B1] h-full block rounded-full"
              style={{
                width: `${totalPercentage <= 100 ? totalPercentage : 100}%`,
              }}
            />
          </div>
          100%
        </div>

        <div className="flex gap-4 justify-end flex-wrap w-full lg:w-fit">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              handleCSVImport(e, setMembers, fileInputRef);
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center lg:w-fit w-full justify-center gap-2 px-4 py-3 bg-[#4950B1] text-white rounded-full font-normal transition-colors"
          >
            <Download className="w-5 h-5" />
            Import CSV
          </button>
          <button
            onClick={() => {
              handleAddMember(members, setMembers);
            }}
            className="flex items-center lg:w-fit w-full justify-center gap-2 px-4 py-3 border border-gray-600 hover:border-gray-500 text-white rounded-full font-normal transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add member
          </button>
        </div>
      </div>
    </div>
  );
}
