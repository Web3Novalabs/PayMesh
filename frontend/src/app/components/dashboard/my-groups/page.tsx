"use client";
import {
  Search,
  Users,
  Calendar,
  Plus,
  LucideUsers,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Sofia_Sans } from "next/font/google";
import { useAccount } from "@starknet-react/core";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type GroupData,
  useAddressCreatedGroups,
  useGroupAddressHasSharesIn,
  useGroupMember,
} from "@/hooks/useContractInteraction";
import WalletConnect from "@/app/components/WalletConnect";
import { compareAddresses } from "@/utils/contract";

// Separate component for individual group cards
const GroupCard = ({
  group,
  address,
}: {
  group: { id: string; name: string; creator: string; date: string };
  address: string;
}) => {
  const groupMember = useGroupMember(group.id);
  const role = compareAddresses(group.creator, address);
  return (
    <div className="bg-[#2A2D35] rounded-sm border-none text-sm p-6 hover:border-gray-800 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{group.name}</h3>
        <span
          className={`px-3 py-1 text-sm rounded-sm font-medium ${
            role ? "bg-[#10273E] text-[#0073E6]" : "bg-[#103E3A] text-[#00E69D]"
          }`}
        >
          {role ? "Creator" : "Member"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div className="space-y-3 mb-6 text-[12px]">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span>
              Members |{" "}
              <b className="text-white"> {groupMember?.length || 0} </b>{" "}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>
              Date Created | <b className="text-white"> {group.date} </b>{" "}
            </span>
          </div>
        </div>

        <Link
          href={`/dashboard/my-groups/${group.id}`}
          className="text-white border-gradient-flow rounded-sm bg-[#4C4C4C] h-fit text-sm py-2 px-2 md:px-3 hover:bg-[#5a5a5a] transition-colors cursor-pointer"
        >
          View Group
        </Link>
      </div>
    </div>
  );
};

const sofiaSans = Sofia_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gt-walsheim-trial",
});

const MyGroupsPage = () => {
  const { address } = useAccount();
  const [filter, setFilter] = useState("all");
  const { transaction } = useGroupAddressHasSharesIn(address || "");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { transaction: createdGroup } = useAddressCreatedGroups();

  // Combine and deduplicate based on id
  const [myGroup, setMyGroup] = useState<GroupData[]>([]);

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

  // Apply filtering to the combined data
  // Filter groups based on member and creator
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

  // Check if wallet is connected
  const isWalletConnected = !!address;

  // Show loading component while data is being fetched

  // Show wallet connection message if not connected
  if (!isWalletConnected) {
    return (
      <div className="min-h-[50vh] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-gray-300 mb-4">
            Please connect your wallet to view your groups
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }
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
    <div className="min-h-screen text-white p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My groups</h1>
        <p className="text-gray-300 text-lg">
          Filter between all, cleared and pending
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative">
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

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search group by name.."
            className=" bg-none border rounded-sm border-gray-600 pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-col w-fit h-fit sm:flex-row gap-6 mb-8">
        <div className="bg-[#2A2D35] rounded-sm px-6 py-3 flex items-center gap-4">
          <LucideUsers className="w-6 h-6 text-white" />
          <div>
            {!transaction ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <p className="text-gray-300">Loading groups...</p>
              </div>
            ) : (
              <p className="text-gray-300">
                Total Groups -{" "}
                <b className="text-white">{myGroup?.length || 0}</b>{" "}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#2A2D35] rounded-sm px-6 flex items-center gap-4 py-3">
          <Plus className="w-6 h-6 text-white" />
          <div>
            {!transaction ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <p className="text-gray-300">Loading...</p>
              </div>
            ) : (
              <p className="text-gray-300">
                Groups Created -{" "}
                <b className="text-white">
                  {myGroup?.filter((group) =>
                    compareAddresses(group.creator, address)
                  ).length || 0}
                </b>{" "}
              </p>
            )}
          </div>
        </div>
      </div>

      {filteredGroups?.length === 0 && searchQuery.trim() ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#2A2D35] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Group not found
          </h3>
          <p className="text-gray-300">
            No groups found matching &rdquo;{searchQuery}&rdquo;. Try a
            different search term.
          </p>
        </div>
      ) : filteredGroups?.length === 0 && !searchQuery.trim() ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#2A2D35] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No groups yet
          </h3>
          <p className="text-gray-300">
            You haven&ldquo;t joined or created any groups yet.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12 gap-6 ${sofiaSans.className}`}
        >
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
      )}

      {filteredGroups?.length > 0 && (
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-16">
          <div className="text-sm text-[#E2E2E2]">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredGroups?.length || 0)} of{" "}
            {filteredGroups?.length || 0} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-[#E2E2E2] bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-md hover:bg-[#282e38] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? "bg-gradient-to-r from-[#434672] to-[#755a5a] text-white"
                        : "text-[#E2E2E2] bg-[#FFFFFF0D] border border-[#FFFFFF0D] hover:bg-[#282e38]"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-[#E2E2E2] bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-md hover:bg-[#282e38] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGroupsPage;
