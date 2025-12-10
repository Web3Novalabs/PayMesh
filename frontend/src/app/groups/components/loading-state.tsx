import React from "react";

export default function LoadingState() {
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
