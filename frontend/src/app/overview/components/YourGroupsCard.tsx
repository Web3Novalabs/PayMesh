"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "@starknet-react/core";
import {
  useAddressCreatedGroups,
  useGroupAddressHasSharesIn,
  GroupData,
  useGroupMember,
} from "@/hooks/useContractInteraction";

const GroupRow = ({ group }: { group: GroupData }) => {
  const members = useGroupMember(group.id);
  const memberCount = members ? members.length : 0;

  return (
    <Link
      href={`/groups/${group.groupAddress}`}
      className="flex justify-between items-center py-2 hover:bg-[#FFFFFF05] rounded-lg transition-colors cursor-pointer -mx-2 px-2"
    >
      <div className="text-[#E2E2E2] truncate pr-4">{group.name}</div>
      <div className="text-[#E2E2E2]">{memberCount}</div>
    </Link>
  );
};

export default function YourGroupsCard() {
  const { address } = useAccount();
  const { transaction: joinedGroups } = useGroupAddressHasSharesIn(
    address || ""
  );
  const { transaction: createdGroups } = useAddressCreatedGroups();
  const [myGroups, setMyGroups] = useState<GroupData[]>([]);

  useEffect(() => {
    if (!joinedGroups && !createdGroups) return;

    const combinedData = [...(joinedGroups || []), ...(createdGroups || [])];
    const uniqueData = combinedData.filter(
      (item, index, array) =>
        array.findIndex((obj) => obj.id === item.id) === index
    );

    const sorted = uniqueData
      .sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id))
      .slice(0, 5);

    setMyGroups(sorted);
  }, [joinedGroups, createdGroups]);

  return (
    <div className="bg-[#FFFFFF0D] border border-[#232542] rounded-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#E2E2E2] text-lg font-medium">Your Groups</h2>
        <Link
          href="/groups"
          className="text-[#E2E2E2] text-sm bg-[#FFFFFF0D] px-4 py-1.5 rounded-full hover:bg-[#FFFFFF1A] transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 mb-4 text-[#8398AD] text-sm">
          <div>Name</div>
          <div className="text-end">Members</div>
        </div>

        <div className="flex flex-col gap-4">
          {myGroups.length > 0 ? (
            myGroups.map((group) => <GroupRow key={group.id} group={group} />)
          ) : (
            <div className="text-[#8398AD] text-center py-4 text-sm">
              {address ? "No groups found" : "Connect wallet to view groups"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
