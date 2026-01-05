import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: PaginationControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pb-8">
      <span className="text-[#9CA3AF] text-sm">
        Showing {Math.min(startIndex + 1, totalItems)} to{" "}
        {Math.min(endIndex, totalItems)} of {totalItems}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm text-[#E2E2E2] bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-full hover:bg-[#282e38] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`min-w-[32px] h-8 flex items-center justify-center text-sm rounded-full transition-colors ${
                currentPage === i + 1
                  ? "bg-[#FFFFFF1A] text-white font-medium"
                  : "text-[#9CA3AF] hover:text-white hover:bg-[#FFFFFF0D]"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm text-[#E2E2E2] bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-full hover:bg-[#282e38] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
