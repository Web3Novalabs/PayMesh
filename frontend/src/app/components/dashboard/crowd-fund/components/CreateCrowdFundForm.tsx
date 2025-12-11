"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import { create_pool } from "@/hooks/blockchainWriteFunction";
import toast from "react-hot-toast";
import Loading from "../../../Loading";
import QRcodeCrowdfund from "../../components/QRcodeCrowdfund";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllPools } from "@/hooks/useContractInteraction";
import { useGetBalance } from "@/utils/contract";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccount } from "@starknet-react/core";

export interface FormData {
  name: string;
  description: string;
  tokenType: string;
  targetAmount: string;
  walletAddress: string;
}

interface CreateCrowdFundFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

const CreateCrowdFundForm: React.FC<CreateCrowdFundFormProps> = ({
  onBack,
  onSubmit,
}) => {
  const { account, address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [poolAddress, setPoolAddress] = useState("");
  const [poolId, setPoolId] = useState<string>("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isFeeDetailOpen, setIsFeeDetailOpen] = useState(false);
  const { createdPool: allPools, refetchPools } = useGetAllPools();
  const balance = useGetBalance(address || "");

  // Get the last pool ID when pool is created
  useEffect(() => {
    if (poolAddress && allPools && allPools.length > 0) {
      const lastPool = allPools[allPools.length - 1];
      const newPoolId = lastPool?.id?.toString();
      setPoolId(newPoolId);
    }
  }, [poolAddress, allPools]);

  // Keep refetching until we get the new pool
  useEffect(() => {
    if (!isSuccess) return;

    const interval = setInterval(() => {
      refetchPools();
    }, 2000); // Refetch every 2 seconds

    return () => clearInterval(interval);
  }, [isSuccess, refetchPools]);

  const [copySuccess, setCopySuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    tokenType: "",
    targetAmount: "",
    walletAddress: "",
  });

  const feeHighlights = [
    {
      label: "Campaign launch",
      description: "Deploying a new PayMesh crowdfunding pool on Starknet.",
      amount: "4 STRK",
    },
    {
      label: "Fundraise completion",
      description: "Operational fee when you release a successful campaign.",
      amount: "2% of total raised",
    },
    {
      label: "Emergency withdraw",
      description:
        "Premature exit before the target is hit comes with added risk mitigation.",
      amount: "4% recovery fee",
    },
  ];

  // Copy address to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(poolAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Form submitted - handleSubmit called");
    // onSubmit(formData);
    if (!account) {
      return toast.error("Connect Wallet to continue");
    }

    if (balance?.formatted && Number(balance.formatted) < 2) {
      toast.error(`Insufficient balance, Top Up!`);
      return;
    }

    if (!isTermsAccepted) {
      toast.error("Please review and accept the PayMesh fee terms to continue");
      return;
    }

    // Reset success state before creating new pool
    // console.log("Setting isSuccess to false before creating pool");
    setIsSuccess(false);
    setPoolAddress(""); // Reset pool address
    // console.log("Calling create_pool function", formData);
    create_pool(
      formData,
      account,
      setIsSubmitting,
      setIsSuccess,
      setPoolAddress
    ).then(() => {
      // Manually trigger a refetch after pool creation
      console.log("Pool created, triggering refetch...");
      refetchPools();
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      tokenType: "",
      targetAmount: "",
      walletAddress: "",
    });
    setIsSubmitting(false);
    setPoolAddress("");
    onSubmit();
    setCopySuccess(false);
    setIsTermsAccepted(false);
    setIsFeeDetailOpen(false);
  };

  const closeModal = () => {
    setIsSuccess(false);
  };

  const resetFormAndClose = () => {
    resetForm();
    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center cursor-pointer gap-2 text-[#8398AD] hover:text-[#DFDFE0] transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Crowd Funding Details Section */}
        <div className="space-y-4 border-b border-[#FFFFFF0D] pb-10">
          <h2 className="text-lg font-semibold text-[#E2E2E2]">
            Crowd Funding Details
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#E2E2E2]">
              Name
            </label>
            <Input
              type="text"
              placeholder="Enter name for your crowd funding"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full py-4 sm:py-6 px-3 sm:px-4 bg-[#FFFFFF0D] rounded-sm text-[#8398AD] border border-[#FFFFFF0D] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#E2E2E2]">
              Description
            </label>
            <Textarea
              placeholder="Enter description for your crowd funding"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full py-4 sm:py-6 px-3 sm:px-4 bg-[#FFFFFF0D] rounded-sm text-[#8398AD] border border-[#FFFFFF0D] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
            />
          </div>
        </div>

        {/* Set Amount Target/Threshold Section */}
        <div className="space-y-4 border-b border-[#FFFFFF0D] pb-10">
          <h2 className="text-lg font-semibold text-[#E2E2E2]">
            Set Amount Target/Threshold
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Token Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#E2E2E2]">
                Token Type
              </label>
              <Select
                value={formData.tokenType}
                onValueChange={(value) => handleInputChange("tokenType", value)}
              >
                <SelectTrigger className="w-full py-4 sm:py-6 px-3 sm:px-4 bg-[#FFFFFF0D] rounded-sm text-[#8398AD] border border-[#FFFFFF0D]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D] text-[#8398AD]">
                  {/* <SelectItem value="strk">STRK</SelectItem> */}
                  <SelectItem value="usdc">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#E2E2E2]">
                Target in Amount
              </label>
              <Input
                type="number"
                placeholder="$0"
                value={formData.targetAmount}
                onChange={(e) =>
                  handleInputChange("targetAmount", e.target.value)
                }
                className="w-full py-4 sm:py-6 px-3 sm:px-4 bg-[#FFFFFF0D] rounded-sm text-[#8398AD] border border-[#FFFFFF0D] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
              />
            </div>
          </div>
        </div>

        {/* Receiver Address Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#E2E2E2]">
            Receiver Address When Target is Met
          </h2>

          <div className="space-y-2 mt-2">
            <label className="block text-sm font-medium text-[#E2E2E2]">
              Wallet address
            </label>
            <Input
              type="text"
              placeholder="enter wallet address"
              value={formData.walletAddress}
              onChange={(e) =>
                handleInputChange("walletAddress", e.target.value)
              }
              className="w-full py-4 sm:py-6 px-3 sm:px-4 bg-[#FFFFFF0D] rounded-sm text-[#8398AD] border border-[#FFFFFF0D] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D] font-mono"
            />
          </div>
        </div>

        {/* Fee Terms Section */}
        <div className="space-y-6 border-t border-[#FFFFFF0D] pt-10">
          <div className="rounded-sm border border-[#1F2D40] bg-[radial-gradient(circle_at_top,_rgba(23,40,69,0.45),_rgba(8,13,23,0.92))] p-4 sm:p-6 shadow-[0_28px_60px_rgba(8,13,23,0.45)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#5C7A9F] font-semibold">
                  Fee Transparency
                </p>
                <h3 className="mt-1 text-lg sm:text-xl text-[#E2E2E2] font-semibold">
                  Understand the cost of launching your raise
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#9BB0C6] leading-relaxed">
                  PayMesh automates custody, payouts, and compliance. These
                  fixed fees keep your backers protected and your operations
                  audit-ready.
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <div className="flex items-center gap-2 rounded-full border border-[#27405C] bg-[#142033] px-4 py-2">
                  <ShieldCheck className="h-4 w-4 text-[#6EE7B7]" />
                  <span className="text-xs sm:text-sm text-[#B7C4D4]">
                    Fixed & auditable
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeeDetailOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-xs sm:text-sm text-[#7EA6D6] transition-colors hover:text-[#E2E2E2]"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {isFeeDetailOpen ? "Hide fine print" : "Why these fees?"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {feeHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-sm border border-[#203049] bg-[#141E2D] p-3 sm:p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#5C7A9F] font-semibold">
                        {item.label}
                      </span>
                      <p className="mt-2 text-xs sm:text-sm text-[#9BB0C6] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-sm sm:text-base text-[#E2E2E2] font-semibold whitespace-nowrap">
                      {item.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {isFeeDetailOpen && (
              <div className="space-y-3 border-t border-[#1D2B40] pt-4 text-xs sm:text-sm text-[#93ABC7] leading-relaxed">
                <p>
                  Launching a campaign spins up a Starknet contract dedicated to
                  your raise. A flat 4 STRK creation fee covers deployment,
                  monitoring, and audit-ready reporting.
                </p>
                <p>
                  Each contribution top-up processes via the same
                  infrastructure, so a 4 STRK service fee applies per
                  transaction. When you release funds after hitting your target,
                  PayMesh withholds 2% to maintain infrastructure, risk
                  oversight, and payout automation.
                </p>
                <p>
                  Emergency withdrawals disrupt liquidity and protection
                  guarantees. The 6% recovery fee combines the platform&apos;s
                  standard 4% charge with a 2% volatility buffer.
                </p>
              </div>
            )}

            <p className="text-[11px] sm:text-xs text-[#7489A5]">
              By proceeding, you authorize PayMesh to apply these fees to this
              campaign, associated top-ups, and any emergency withdrawals linked
              to it.
            </p>
          </div>

          <div className="bg-[#FFFFFF0D] p-3 sm:p-4 rounded-sm border border-[#FFFFFF0D]">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-[#434672] to-[#755a5a] cursor-pointer rounded-full flex items-center justify-center">
                <Checkbox
                  checked={isTermsAccepted}
                  onCheckedChange={(checked) =>
                    setIsTermsAccepted(checked as boolean)
                  }
                  className="!rounded-full h-4 w-4 sm:h-5 sm:w-5 cursor-pointer"
                />
              </span>
              <span className="text-[#E2E2E2] text-sm sm:text-base">
                I have reviewed the PayMesh crowdfunding fees above and approve
                the associated deductions.
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 pb-10 md:pb-20">
          <button
            disabled={isSubmitting || !isTermsAccepted}
            type="submit"
            className={`w-full sm:w-auto px-5 py-4 bg-gradient-to-r from-[#434672] to-[#755a5a] text-white font-semibold rounded-sm flex items-center justify-center gap-2 transition-opacity duration-200 ${
              isSubmitting || !isTermsAccepted
                ? "opacity-60 cursor-not-allowed"
                : "hover:opacity-90 cursor-pointer"
            }`}
          >
            <span className="text-2xl font-bold">+</span>
            {isSubmitting ? "creating pool....." : "Create Crowd Funding"}
          </button>
        </div>
      </form>

      {isSubmitting && (
        <Loading
          title="Creating Your Crowd Funding"
          description="Please wait while we process your transaction on the blockchain..."
          progressSteps={[
            "Validating crowd funding data",
            "Approving transaction",
            "Deploying crowd funding contract",
          ]}
          estimatedTime="10-20 seconds"
        />
      )}

      {isSuccess && poolId && (
        <>
          {console.log(
            "Rendering QRcodeCrowdfund - isSuccess is true, poolAddress:",
            poolAddress,
            "poolId:",
            poolId
          )}
          <QRcodeCrowdfund
            fundAddress={poolAddress}
            groupBalance="0"
            isLoadingBalance={false}
            copySuccess={copySuccess}
            copyToClipboard={copyToClipboard}
            resetForm={resetFormAndClose}
            campaignTitle={formData.name}
            campaignDescription={formData.description}
            campaignId={poolId}
          />
        </>
      )}

      {isSuccess && !poolId && (
        <div className="fixed inset-0 bg-[#000000a3] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#ffffff1e] border-gradient-modal rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 border-4 border-[#434672] border-t-[#755A5A] rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-xl font-bold text-[#ffffff] mb-2">
              Pool Created Successfully!
            </h2>
            <p className="text-[#8398AD] text-sm">
              Waiting for pool to be indexed...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCrowdFundForm;
