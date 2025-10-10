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
import { ArrowLeft } from "lucide-react";
import { create_pool } from "@/hooks/blockchainWriteFunction";
import { useAccount } from "@starknet-react/core";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";
import QRcodeCrowdfund from "../../components/QRcodeCrowdfund";
import { Textarea } from "@/components/ui/textarea";

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
  const { account } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [poolAddress, setPoolAddress] = useState("");

  // Debug logging
  React.useEffect(() => {
    console.log("CreateCrowdFundForm - isSuccess:", isSuccess);
  }, [isSuccess]);

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
      await navigator.clipboard.writeText(formData.walletAddress);
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
    console.log("Form submitted - handleSubmit called");
    // onSubmit(formData);
    if (!account) {
      return toast.error("Connect Wallet to continue");
    }

    // Reset success state before creating new pool
    console.log("Setting isSuccess to false before creating pool");
    setIsSuccess(false);
    setPoolAddress(""); // Reset pool address
    console.log("Calling create_pool function", formData);
    create_pool(
      formData,
      account,
      setIsSubmitting,
      setIsSuccess,
      setPoolAddress
    );
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
                  <SelectItem value="strk">STRK</SelectItem>
                  <SelectItem value="eth">ETH</SelectItem>
                  <SelectItem value="usdc">USDC</SelectItem>
                  <SelectItem value="btc">BTC</SelectItem>
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

        {/* Submit Button */}
        <div className="pt-3 pb-10 md:pb-20">
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full sm:w-auto px-5 py-4 bg-gradient-to-r from-[#434672] to-[#755a5a] text-white font-semibold rounded-sm hover:opacity-90 transition-opacity duration-200 cursor-pointer flex items-center justify-center gap-2"
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

      {isSuccess && (
        <>
          {console.log(
            "Rendering QRcodeCrowdfund - isSuccess is true, poolAddress:",
            poolAddress
          )}
          <QRcodeCrowdfund
            fundAddress={poolAddress || formData.walletAddress}
            groupBalance="0"
            isLoadingBalance={false}
            copySuccess={copySuccess}
            copyToClipboard={copyToClipboard}
            resetForm={resetFormAndClose}
          />
        </>
      )}
    </div>
  );
};

export default CreateCrowdFundForm;
