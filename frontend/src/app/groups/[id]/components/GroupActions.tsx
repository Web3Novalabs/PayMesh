import { FileDown } from "lucide-react";

// ... imports
interface GroupActionsProps {
  onTopUp: () => void;
  onSplit: () => void;
  onDownloadHistory: () => void;
  isTopUpLoading: boolean;
  isSplitLoading: boolean;
  hasBalance: boolean;
  hasHistory: boolean;
}

const GroupActions = ({
  onTopUp,
  onSplit,
  onDownloadHistory,
  isTopUpLoading,
  isSplitLoading,
  hasBalance,
  hasHistory,
}: GroupActionsProps) => {
  return (
    <>
      <div className="px-6 py-4 flex flex-col sm:flex-row md:flex-col xl:flex-row gap-6 md:items-center justify-between">
        <button
          onClick={onTopUp}
          disabled={isTopUpLoading}
          className={`bg-[#FFFFFF0D] text-[#FFFFFF] px-4 py-2.5 border border-[#FFFFFF1A] rounded-full cursor-pointer ${
            isTopUpLoading ? "opacity-50 cursor-not-allowed" : "w-full"
          }`}
        >
          {isTopUpLoading ? "Processing..." : "Top Up"}
        </button>

        {hasBalance && (
          <button
            onClick={onSplit}
            disabled={isSplitLoading}
            className={`bg-[#4950B1] text-[#FFFFFF] px-4 py-2.5 border border-[#FFFFFF1A] rounded-full cursor-pointer ${
              isSplitLoading ? "opacity-50 cursor-not-allowed" : "w-full"
            }`}
          >
            {isSplitLoading ? "Splitting..." : "Split Payment"}
          </button>
        )}

        {hasHistory && (
          <button
            onClick={onDownloadHistory}
            className="bg-[#232542] hover:bg-[#2A2D48] text-[#FFFFFF] px-4 py-2.5 border border-[#FFFFFF1A] rounded-full cursor-pointer w-full flex items-center justify-center gap-2 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>History</span>
          </button>
        )}
      </div>
    </>
  );
};

export default GroupActions;
