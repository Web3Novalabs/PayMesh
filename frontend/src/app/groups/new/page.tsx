"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import PoolDescription from "./component/poolDetail";
import { MembersConfiguration } from "./component/poolMembers";

export default function Page() {
  const [section, setSection] = useState(2);
  return (
    <section className="grid text-text-white grid-cols-[1fr_2fr] border border-moon-blue rounded-[8px] bg-card-bg items-start min-h-[750px]">
      <div className="p-10 grid gap-10">
        <button className="rounded-full w-fit border border-dim-white-border text-text-white py-3 px-4 capitalize bg-dim-gray">
          back
        </button>
        <div className="grid gap-3">
          <h1 className="font-anton font-normal text-[28px] uppercase">
            Create new group
          </h1>
          <p className="text-text-gray font-dmsans text-base">
            Create a funding group, share a single deposit address, and
            automatically distribute funds to members.
          </p>
        </div>
      </div>
      <div className="p-10 text-text-white border-l border-moon-blue text-[18px] grid gap-28 h-full">
        {section === 1 && <PoolDescription />}
        {section === 2 && <MembersConfiguration />}
        <div className="flex justify-end">
          <button className="rounded-full px-4 py-3 bg-purple-bg w-fit h-fit">
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
