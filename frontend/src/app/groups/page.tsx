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
import { useState } from "react";
import GroupCard from "./components/group-card";

export default function Page() {
  const [selectedValue, setSelectedValue] = useState("ALL");

  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <section className="w-full grid gap-10">
      <div className="flex justify-between items-center w-full">
        <div className="flex justify-between items-center gap-4">
          <div
            className={`border border-moon-blue rounded-full p-3 transition-transform duration-200 `}
          >
            <Select onValueChange={handleSelectChange} value={selectedValue}>
              <SelectTrigger className="rounded-full h-full outline-none w-full border-none pl-7 text-text-white">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-inherit text-text-white border border-moon-blue">
                <SelectItem value="ALL">ALL</SelectItem>
                <SelectItem value="Available">AUDIT</SelectItem>
                <SelectItem value="Completed">IN PROGRESS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border border-moon-blue rounded-full p-3 flex">
            <Search className="text-text-white" />
            <Input
              type="text"
              placeholder="Search group by name.."
              className="w-full h-full rounded-full text-text-white border-none"
            />
          </div>
        </div>
        <button className="bg-purple-bg flex items-center gap-2 py-2 px-6 rounded-full text-text-white">
          <Plus /> Create new group
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
      </div>
    </section>
  );
}
