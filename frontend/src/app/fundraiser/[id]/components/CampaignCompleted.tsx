import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface CampaignCompletedProps {
  amountRaised: string | number;
  targetAmount: string | number;
  total_donors: string | number;
  created_at: string | number;
}

const CampaignCompleted: React.FC<CampaignCompletedProps> = ({
  amountRaised,
  targetAmount,
  total_donors,
  created_at,
}) => {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000036] bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1F2937] border border-[#10B981] rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#10B981] mb-2">
          Campaign Completed! 🎉
        </h2>
        <p className="text-[#DFDFE0] mb-4">
          This funding campaign has reached its target goal and is now closed.
        </p>
        <div className="bg-[#064E3B] border border-[#10B981] rounded-sm p-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#6EE7B7]">Final Amount Raised:</span>
            <span className="text-[#10B981] font-bold">
              {/* {(Number.parseFloat(pool.balance.toString()) / 1e18).toFixed(
                    2
                  )}{" "} */}
              {amountRaised} USDC
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-[#6EE7B7]">Target Goal:</span>
            <span className="text-[#DFDFE0]">{targetAmount} USDC</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-[#51be58]">Donors:</span>
            <span className="text-[#DFDFE0]">{total_donors || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-[#6EE7B7] font-medium">Date Created:</span>
            <span className="text-[#DFDFE0]">{created_at}</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/fundraiser")}
          className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium cursor-pointer"
        >
          Back to All Campaigns
        </button>
      </div>
    </div>
  );
};

export default CampaignCompleted;
