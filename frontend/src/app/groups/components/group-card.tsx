import Groups from "@/components/icons/group";
import { useGroupMember } from "@/hooks/useContractInteraction";
import { compareAddresses } from "@/utils/contract";
import { CalendarDays } from "lucide-react";

export default function GroupCard({
  group,
  address,
}: {
  group: { id: string; name: string; creator: string; date: string };
  address: string;
  }) {
  const groupMember = useGroupMember(group?.id);
  const role = compareAddresses(group?.creator, address);
  console.log(group)
  return (
    <div className="border bg-card-bg border-moon-blue text-text-white rounded-[8px] py-5 grid gap-5">
      <div className="flex justify-between items-center px-4">
        <h1 className="font-medium text-xl capitalize">{group?.name}</h1>
        <span
          className={`py-1.5 px-3 rounded-full ${
            role ? "bg-blue-btn text-blue-text" : "bg-[#103E3A] text-[#00E69D]"
          }`}
        >
          {role ? "Creator" : "Member"}
        </span>
      </div>
      <div className="flex justify-between items-center py-5 border-y border-moon-blue px-4">
        <div className="flex items-center gap-3">
          <div className="p-3 py-3 border-dim-white-border border rounded-full text-center grid place-content-center">
            <Groups />
          </div>
          <div className="flex flex-col">
            <span className="text-text-gray text-base">Members</span>
            <span>{groupMember?.length || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 py-3 border-dim-white-border border rounded-full text-center grid place-content-center">
            <CalendarDays />
          </div>
          <div className="flex flex-col">
            <span className="text-text-gray text-base">Date Created</span>
            <span>{group?.date}</span>
          </div>
        </div>
      </div>
      <div className="px-4">
        <button className="rounded-full border-dim-white-border py-2 px-4 border">
          View Group
        </button>
      </div>
    </div>
  );
}
