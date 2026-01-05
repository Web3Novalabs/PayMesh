"use client";

import ActionCard from "./ActionCard";

type ActionConfig = {
  key: string;
  title: string;
  description: string;
  placeholder: string;
  type?: "text" | "number";
  section: "fundraising" | "group";
  icon?: React.ReactNode;
};

interface AdminActionsSectionProps {
  title: string;
  actions: ActionConfig[];
  onExecute: (actionKey: string, value: string) => void;
  actionStatuses: Record<string, string>;
  icon: React.ReactNode;
}

export default function AdminActionsSection({
  title,
  actions,
  onExecute,
  actionStatuses,
  icon,
}: AdminActionsSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <ActionCard
            key={action.key}
            action={action}
            onExecute={onExecute}
            actionStatus={actionStatuses[action.key]}
          />
        ))}
      </div>
    </section>
  );
}
