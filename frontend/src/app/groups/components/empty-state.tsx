import React from "react";

interface EmptyStateProps {
  filter: string;
}

export default function EmptyState({ filter }: EmptyStateProps) {
  const getMessage = () => {
    switch (filter) {
      case "creator":
        return "You are not a creator of a group yet";
      case "member":
        return "You are not a member of a group yet";
      default:
        return "You haven't created or joined any groups. Start by creating your first group!";
    }
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#1F2937] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-[#8398AD]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#E2E2E2] mb-2">No Groups Yet</h2>
        <p className="text-[#8398AD] mb-6">{getMessage()}</p>
      </div>
    </div>
  );
}
