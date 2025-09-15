"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Search, Users, Calendar, Handshake } from "lucide-react";
import group1icon from "../../../../../public/PlusCircle.svg";
import group4icon from "../../../../../public/Handshake.svg";
import { useGetAllPools } from "@/hooks/useContractInteraction";

// Sample funding data
const fundingData = [
  {
    id: 1,
    title: "Visa Application",
    progress: 79,
    donors: 12,
    dateCreated: "20th - 08 - 2025",
    targetAmount: "$5,000",
    currentAmount: "$3,950",
  },
  {
    id: 2,
    title: "School Fees",
    progress: 55,
    donors: 5,
    dateCreated: "29th - 08 - 2025",
    targetAmount: "$3,000",
    currentAmount: "$1,650",
  },
];

interface CrowdFundDashboardProps {
  onCreateNew: () => void;
  onViewDetails: (id: number) => void;
}

const CrowdFundDashboard: React.FC<CrowdFundDashboardProps> = ({
  onCreateNew,
  onViewDetails,
}) => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const pools = useGetAllPools();

  const filteredFundings = fundingData.filter((funding) => {
    const matchesSearch = funding.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || true; // Add filter logic if needed
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filtering and Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 ">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px] py-6 bg-transparent border border-[#FFFFFF0D] rounded-sm text-[#8398AD]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D] text-[#8398AD]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-[#8398AD] w-4 h-4" />
          <Input
            type="text"
            placeholder="Search funding by name.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[425px] pl-8 py-6 bg-transparent border border-[#FFFFFF0D] rounded-sm text-[#8398AD] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
          />
        </div>
      </div>

      {/* Active Funding Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex w-full space-x-4 col-span-1 items-center p-4 bg-[#FFFFFF0D] rounded-sm border border-[#FFFFFF0D]">
          <Image src={group4icon} alt="group4icon" width={24} height={24} />
          <span className="text-[#8398AD] text-sm">
            Active Funding{" "}
            <span className="text-[#DFDFE0] font-semibold">
              {filteredFundings.length}
            </span>
          </span>
        </div>
      </div>

      {/* Funding Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Funding Card */}
        <div
          onClick={onCreateNew}
          className="bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6 cursor-pointer hover:bg-[#282e38] transition-colors duration-200 flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="w-16 h-16 flex items-center justify-center mb-0">
            <Image src={group1icon} alt="group1icon" />
          </div>
          <p className="text-[#DFDFE0] font-medium text-center">
            Create crowd funding
          </p>
        </div>

        {/* Existing Funding Cards */}
        {pools?.map((funding) => (
          <div
            key={funding.id}
            className="bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6 hover:bg-[#282e38] transition-colors duration-200"
          >
            {/* Header with Title and Progress */}
            <div className="flex justify-between items-start mb-4 border-b border-[#FFFFFF0D] pb-4">
              <h3 className="text-[#DFDFE0] font-semibold text-lg">
                {funding.name}
              </h3>
              <span className="bg-[#10273E] text-[#0073E6] text-xs px-2 py-1 rounded-sm">
                {/* {funding.progress}% Complete */}
              </span>
            </div>

            {/* Funding Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8398AD]" />
                <span className="text-[#8398AD] text-sm">
                  Donors {funding.donors}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8398AD]" />
                <span className="text-[#8398AD] text-sm">
                  Date Created {funding.create_at}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-[#282e38] rounded-full h-2">
                <div
                  className="bg-[#0073E6] h-2 rounded-full transition-all duration-300"
                  // style={{ width: `${funding.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-[#8398AD] mt-1">
                {/* <span>{funding.currentAmount}</span>
                <span>{funding.targetAmount}</span> */}
              </div>
            </div>

            {/* View Details Button */}
            <button
              onClick={() => onViewDetails(funding.id)}
              className="w-full bg-[#FFFFFF0D] cursor-pointer border border-[#FFFFFF0D] text-[#DFDFE0] py-2 px-4 rounded-sm hover:bg-[#282e38] transition-colors duration-200 text-sm"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrowdFundDashboard;
