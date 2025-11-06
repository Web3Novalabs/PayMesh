"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Download } from "lucide-react";

type SplitType = "equal" | "manual";

interface Member {
  id: string;
  address: string;
  percentage?: number;
}

export function MembersConfiguration() {
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [members, setMembers] = useState<Member[]>([
    { id: "1", address: "" },
    { id: "2", address: "" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMember = () => {
    const newId = (
      Math.max(...members.map((m) => Number.parseInt(m.id)), 0) + 1
    ).toString();
    setMembers([...members, { id: newId, address: "", percentage: 0 }]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const handleAddressChange = (id: string, value: string) => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, address: value } : m))
    );
  };

  const handlePercentageChange = (id: string, value: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, percentage: Number.parseFloat(value) || 0 } : m
      )
    );
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split("\n");

        // Filter out empty lines and header rows
        const addresses = lines
          .filter(
            (line) => line.trim() && !line.toLowerCase().includes("address")
          )
          .map((line, index) => ({
            id: (index + 1).toString(),
            address: line.trim(),
            percentage: 0,
          }));

        if (addresses.length > 0) {
          setMembers(addresses);
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Error parsing CSV file");
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const totalPercentage = members.reduce(
    (sum, m) => sum + (m.percentage || 0),
    0
  );

  return (
    <div className="text-white p-8">
      <h1 className="text-[18px] font-medium">Members configuration</h1>

      {/* Split Type Selection */}
      <div className="flex gap-8 mb-12">
        <div className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => setSplitType("equal")}
            className={` rounded-full  border-moon-blue p-1.5 border`}
          >
            <div
              className={`${
                splitType === "equal" ? "bg-[#4950B1]" : "bg-none"
              } w-3.5 h-3.5 rounded-full`}
            />
          </button>
          <span className="text-xl">Equal percentage split</span>
        </div>
        <div className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => setSplitType("manual")}
            className={` rounded-full  border-moon-blue p-1.5 border`}
          >
            <div
              className={`${
                splitType === "manual" ? "bg-[#4950B1]" : "bg-none"
              } w-3.5 h-3.5 rounded-full`}
            />
          </button>
          <span className="text-xl">Equal percentage split</span>
        </div>
      </div>

      {/* Wallet Address Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Wallet address</h2>

        <div className="space-y-4">
          {members.map((member, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="enter wallet address"
                  value={member.address}
                  onChange={(e) =>
                    handleAddressChange(member.id, e.target.value)
                  }
                  className="border border-moon-blue p-6 rounded-full text-text-gray placeholder:text-text-gray"
                />
              </div>

              {splitType === "manual" && (
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="%"
                    value={member.percentage || ""}
                    onChange={(e) =>
                      handlePercentageChange(member.id, e.target.value)
                    }
                    className="border border-moon-blue p-6 rounded-full text-text-gray placeholder:text-text-gray"
                  />
                </div>
              )}

              {members.length > 1 && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-3 rounded-full border border-dim-white-border bg-card-bg  transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-[#B26C6C]" />
                </button>
              )}
            </div>
          ))}
        </div>

        {splitType === "manual" && (
          <div className="mt-4 text-sm text-gray-400">
            Total: {totalPercentage}%
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 bg-[#4950B1] text-white rounded-full font-semibold transition-colors"
        >
          <Download className="w-5 h-5" />
          Import CSV
        </button>
        <button
          onClick={handleAddMember}
          className="flex items-center gap-2 px-4 py-3 border border-gray-600 hover:border-gray-500 text-white rounded-full font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add member
        </button>
      </div>
    </div>
  );
}
