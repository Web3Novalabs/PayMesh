import Groups from "@/components/icons/group";
import { CalendarDays } from "lucide-react";

export default function GroupCard() {
  return (
    <div className="border bg-card-bg border-moon-blue text-text-white rounded-[8px] py-5 grid gap-5">
      <div className="flex justify-between items-center px-4">
        <h1 className="font-medium text-xl capitalize">TheBuidl Hackathon</h1>
        <span className={`bg-blue-btn py-1.5 px-3 rounded-full text-blue-text`}>
          Creator
        </span>
      </div>
      <div className="flex justify-between items-center py-5 border-y border-moon-blue px-4">
        <div className="flex items-center gap-3">
          <div className="p-3 py-3 border-dim-white-border border rounded-full text-center grid place-content-center">
            <Groups />
          </div>
          <div className="flex flex-col">
            <span className="text-text-gray text-base">Members</span>
            <span>4</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 py-3 border-dim-white-border border rounded-full text-center grid place-content-center">
            <CalendarDays />
          </div>
          <div className="flex flex-col">
            <span className="text-text-gray text-base">Date Created</span>
            <span>Feb 27th, 2025</span>
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
