"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import GroupCard from "./components/group-card";
import Link from "next/link";
import {
  GroupData,
  useAddressCreatedGroups,
  useGroupAddressHasSharesIn,
} from "@/hooks/useContractInteraction";
import { useAccount } from "@starknet-react/core";

import LoadingState from "@/components/Loading-state";
import EmptyState from "./components/empty-state";
import PaginationControls from "@/components/ui/PaginationControls";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { transaction } = useGroupAddressHasSharesIn(address || "");
  const [myGroup, setMyGroup] = useState<GroupData[]>([]);
  const { transaction: createdGroup } = useAddressCreatedGroups();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (!transaction && !createdGroup) {
      setIsLoading(true);
      return;
    }

    const combinedData = [...(transaction || []), ...(createdGroup || [])];

    const uniqueData = combinedData.filter(
      (item, index, array) =>
        array.findIndex((obj) => obj.id === item.id) === index
    );

    setMyGroup(uniqueData);
    setIsLoading(false);
  }, [transaction, createdGroup]);

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
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((filteredGroups?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  if (isLoading) {
    return (
      <LoadingState
        title="Loading Groups"
        description="Fetching your groups..."
      />
    );
  }

  return (
    <section className="w-full flex flex-col gap-10 min-h-[75vh]">
      <div className="flex justify-between flex-wrap items-center w-full  gap-4">
        <div className="flex justify-between items-center gap-4 w-full sm:w-fit">
          <div
            className={`border border-moon-blue rounded-full p-3 transition-transform duration-200`}
          >
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="border-none text-white w-[140px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D]">
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
          <div className="border border-moon-blue rounded-full p-3 flex w-full sm:w-fit">
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
          className="w-full sm:w-fit bg-purple-bg flex items-center justify-center gap-2 py-2 min-h-[48px] md:py-2 px-6 rounded-full text-text-white"
        >
          <Plus /> Create new group
        </Link>
      </div>

      {!isLoading && filteredGroups.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...(filteredGroups || [])]
              .sort((a, b) => {
                return Number.parseInt(b.id) - Number.parseInt(a.id);
              })
              .slice(startIndex, endIndex)
              ?.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  address={address || ""}
                />
              ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredGroups.length}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
}
