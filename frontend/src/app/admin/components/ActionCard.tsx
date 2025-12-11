"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

type ActionConfig = {
  key: string;
  title: string;
  description: string;
  placeholder: string;
  type?: "text" | "number";
  icon?: React.ReactNode;
};

interface ActionCardProps {
  action: ActionConfig;
  onExecute: (actionKey: string, value: string) => void;
  actionStatus?: string;
}

export default function ActionCard({
  action,
  onExecute,
  actionStatus,
}: ActionCardProps) {
  const [localValue, setLocalValue] = useState("");

  const handleExecute = () => {
    if (!localValue.trim()) {
      return;
    }
    onExecute(action.key, localValue.trim());
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#232542] bg-[#FFFFFF05] p-5 transition-all hover:border-[#4950B1]/50 hover:bg-[#FFFFFF08]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#4950B1]/20 p-2 text-[#4950B1]">
            {action.icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#DFDFE0]">
              {action.title}
            </h3>
            <span className="mt-1 inline-block rounded-full bg-[#1A2343] px-2 py-0.5 text-[10px] font-medium text-[#9BB4EE]">
              ADMIN ONLY
            </span>
          </div>
        </div>
      </div>
      <p className="mb-4 text-sm text-[#8398AD]">{action.description}</p>
      <div className="space-y-3">
        <Input
          type={action.type ?? "text"}
          value={localValue}
          placeholder={action.placeholder}
          onChange={(e) => setLocalValue(e.target.value)}
          className="w-full bg-[#0c111c] border-[#232542] rounded-lg text-[#DFDFE0] placeholder:text-[#8398AD] focus-visible:ring-0 focus-visible:border-[#4950B1]"
        />
        {actionStatus && (
          <div className="flex items-center gap-2 text-xs text-[#8398AD]">
            <AlertCircle className="w-3 h-3" />
            <span>{actionStatus}</span>
          </div>
        )}
        <button
          onClick={handleExecute}
          className="w-full rounded-lg bg-gradient-to-r from-[#4950B1] to-[#5961ce] py-2.5 font-semibold text-[#DFDFE0] transition-all hover:from-[#5961ce] hover:to-[#6b73e0] hover:shadow-lg hover:shadow-[#4950B1]/20 cursor-pointer"
        >
          Execute Transaction
        </button>
      </div>
    </div>
  );
}
