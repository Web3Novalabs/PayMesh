"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { create_pool } from "@/hooks/blockchainWriteFunction";
import { useAccount } from "@starknet-react/core";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import QRcodeCrowdfund from "../components/QRcodeCrowdfund";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllPools } from "@/hooks/useContractInteraction";
import { useGetBalance } from "@/utils/contract";
import { FormData } from "@/types/usdcDataApi";

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
      onSubmit();
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
  };

  const closeModal = () => {
    setIsSuccess(false);
  };

  const resetFormAndClose = () => {
    resetForm();
    closeModal();
  };

  return (
    <div className="space-y-6 mt-16">
      <div className="grid grid-cols-1 sm:grid-cols-24 justify-between bg-[#FFFFFF05] rounded-lg border border-[#232542]">
        <div className=" col-span-10 border-r border-[#232542] p-10">
          <button
            onClick={onBack}
            className="flex items-center cursor-pointer bg-[#FFFFFF0D] border border-[#FFFFFF1A] rounded-full py-2 px-4 gap-2 text-[#8398AD] hover:text-[#DFDFE0] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="pt-10 space-y-4">
            <h1 className="text-[28px] font-bold text-[#DFDFE0] font-anton">
              PAYMESH FUNDRAISER
            </h1>

            <p className="text-[#8398AD] text-base">
              Enter the required details to create a crowd funding
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 p-10 col-span-14">
          {/* Crowd Funding Details Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-lg font-light text-[#E2E2E2]">
                Enter a name that best describes what you are crowd funding for.
              </label>
              <Input
                type="text"
                placeholder="Enter name for your fundraiser"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full py-4 sm:py-6 px-3 sm:px-4 bg-[#FFFFFF0D] rounded-4xl text-[#8398AD] border border-[#232542] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
              />
            </div>

            <div className="space-y-4">
              <label className="e text-lg font-light text-[#E2E2E2]">
                Describes the idea behind the crowd funding.
              </label>

              <Textarea
                placeholder="Enter description for your fundraiser"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full py-4 sm:py-6 px-3 sm:px-4 mt-4 bg-[#FFFFFF0D] min-h-[12rem] max-h-[30rem] rounded-lg text-sm text-[#8398AD] border border-[#232542] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D] overflow-y-auto resize-y [field-sizing:auto]"
              />
            </div>
          </div>

          {/* Set Amount Target/Threshold Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-light text-[#E2E2E2]">
              Set Amount Target/Threshold.
            </h2>

            <div className="">
              {/* Target Amount */}
              <Input
                type="number"
                placeholder="$0"
                value={formData.targetAmount}
                onChange={(e) =>
                  handleInputChange("targetAmount", e.target.value)
                }
                className="w-full py-4 sm:py-6 px-3 sm:px-4 bg-[#FFFFFF0D] text-sm rounded-4xl text-[#8398AD] border border-[#232542] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
              />
            </div>
          </div>

          {/* Receiver Address Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-light text-[#E2E2E2]">
              Input beneficiary’s address.
            </h2>

            <div className="space-y-2 mt-2">
              <Input
                type="text"
                placeholder="Enter wallet address"
                value={formData.walletAddress}
                onChange={(e) =>
                  handleInputChange("walletAddress", e.target.value)
                }
                className="w-full py-4 sm:py-6 px-3 sm:px-4 bg-[#FFFFFF0D] text-sm rounded-4xl text-[#8398AD] border border-[#232542] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D] font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="py-6">
            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full sm:w-fit px-16 py-2.5 bg-[#4950B1] text-white font-semibold text-sm rounded-4xl hover:opacity-90 transition-opacity duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="text-2xl font-semibold">+</span>
              {isSubmitting ? "creating...." : "Create"}
            </button>
          </div>
        </form>
      </div>

      {isSubmitting && (
        <Loading
          title="Creating Your Fund Raiser"
          description="Please wait while we process your transaction on the blockchain..."
          progressSteps={[
            "Validating fundraising data",
            "Approving transaction",
            "Deploying fundraising contract",
          ]}
          estimatedTime="10-20 seconds"
        />
      )}

      {isSuccess && poolId && (
        <>
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
    </div>
  );
};

export default CreateCrowdFundForm;
