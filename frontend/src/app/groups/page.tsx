"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import GroupCard from "./components/group-card";
import Link from "next/link";
import { GroupData, useAddressCreatedGroups, useGroupAddressHasSharesIn } from "@/hooks/useContractInteraction";
import { useAccount } from "@starknet-react/core";
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";

export default function Page() {
  const [selectedValue, setSelectedValue] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { transaction } = useGroupAddressHasSharesIn(address || "");
  const [myGroup, setMyGroup] = useState<GroupData[]>([]);
  const { transaction: createdGroup } = useAddressCreatedGroups();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Show loading while data is being fetched
    if (!transaction && !createdGroup) {
      setIsLoading(true);
      return;
    }

    const combinedData = [...(transaction || []), ...(createdGroup || [])];

    // Remove duplicates based on id, keeping the first occurrence
    // console.log("man-",combinedData)
    const uniqueData = combinedData.filter(
      (item, index, array) =>
        array.findIndex((obj) => obj.id === item.id) === index
    );

    setMyGroup(uniqueData);
    setIsLoading(false);
  }, [transaction, createdGroup]);
  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
  };

  let filteredGroups = myGroup?.filter((group) => {
    if (filter === "all") return true;
    if (filter === "creator") return group.creator === address;
    if (filter === "member") return group.creator !== address;
    return true;
  });

  if (searchQuery.trim()) {
    filteredGroups = filteredGroups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Calculate pagination
  const totalPages = Math.ceil((filteredGroups?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#434672] border-t-[#755A5A] rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#E2E2E2] mb-2">
            Loading Groups
          </h2>
          <p className="text-[#8398AD]">Fetching your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full grid gap-10">
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-between items-center gap-4">
          <div
            className={`border border-moon-blue rounded-full p-3 transition-transform duration-200 `}
          >
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full bg-[#FFFFFF0D] border py-4 sm:py-6 px-3 sm:px-4 rounded-sm border-[#FFFFFF0D] text-[#8398AD] !text-sm sm:!text-base">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D] w-full">
                <SelectGroup>
                  <SelectLabel className="text-[#E2E2E2]">
                    Filter Groups
                  </SelectLabel>
                  <SelectItem
                    value="all"
                    className="text-[#8398AD] hover:bg-[#374151]"
                  >
                    ALL
                  </SelectItem>
                  <SelectItem
                    value="creator"
                    className="text-[#8398AD] hover:bg-[#374151]"
                  >
                    CREATOR
                  </SelectItem>
                  <SelectItem
                    value="member"
                    className="text-[#8398AD] hover:bg-[#374151]"
                  >
                    MEMBER
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="border border-moon-blue rounded-full p-3 flex">
            <Search className="text-text-white" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search group by name.."
              className="w-full h-full rounded-full text-text-white border-none"
            />
          </div>
        </div>
        <Link
          href="/groups/new"
          className="bg-purple-bg flex items-center gap-2 py-2 px-6 rounded-full text-text-white"
        >
          <Plus /> Create new group
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...(filteredGroups || [])]
          // .reverse()
          .sort((a, b) => {
            return Number.parseInt(b.id) - Number.parseInt(a.id);
          })
          .slice(startIndex, endIndex)
          ?.map((group) => (
            <GroupCard key={group.id} group={group} address={address || ""} />
          ))}
      </div>
    </section>
  );
}
