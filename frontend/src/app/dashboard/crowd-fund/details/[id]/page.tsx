/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Target,
  Heart,
  X,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useGetAllPools, useGetPool } from "@/hooks/useContractInteraction";
import { useAccount } from "@starknet-react/core";
import WalletConnect from "@/app/components/WalletConnect";
import { donate } from "@/hooks/blockchainWriteFunction";

// Sample funding data - in real app, this would come from API
const sampleFundingData = [
  {
    id: 1,
    title: "Visa Application",
    progress: 79,
    donors: 12,
    dateCreated: "20th - 08 - 2025",
    targetAmount: "$5,000",
    currentAmount: "$3,950",
    description:
      "This is a crowd funding campaign created to help achieve the specified goal. The campaign has been running successfully and has received support from multiple donors.",
  },
  {
    id: 2,
    title: "School Fees",
    progress: 55,
    donors: 5,
    dateCreated: "29th - 08 - 2025",
    targetAmount: "$3,000",
    currentAmount: "$1,650",
    description:
      "This is a crowd funding campaign created to help achieve the specified goal. The campaign has been running successfully and has received support from multiple donors.",
  },
];

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContribute: (amount: number, isAnonymous: boolean) => void;
}

const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  onContribute,
}) => {
  const [amount, setAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { id } = useParams();
  const pool = useGetPool(Array.isArray(id) ? id[0] : id ?? "");
  const { account, address } = useAccount();
  console.log(pool);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      // onContribute(numAmount, isAnonymous);
      // setAmount("");
      // setIsAnonymous(false);
      // onClose();
      donate(
        typeof pool?.pool_address === "string" ? pool.pool_address : "",
        numAmount,
        account
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0000009c] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2937] border-gradient-modal rounded-sm max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#FFFFFF0D]">
          <h2 className="text-xl font-semibold text-[#DFDFE0]">
            Contribute to Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-[#8398AD] hover:text-[#DFDFE0] cursor-pointer transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#E2E2E2]">
              How much do you want to donate?
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8398AD] w-4 h-4" />
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF0D] rounded-sm text-[#8398AD] border border-[#FFFFFF0D] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#E2E2E2]">
              Donation Privacy
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={!isAnonymous}
                  onChange={() => setIsAnonymous(false)}
                  className="w-4 h-4 text-[#434672] bg-[#FFFFFF0D] border-[#FFFFFF0D] focus:ring-[#434672]"
                />
                <span className="text-[#DFDFE0]">Public donation</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(true)}
                  className="w-4 h-4 text-[#434672] bg-[#FFFFFF0D] border-[#FFFFFF0D] focus:ring-[#434672]"
                />
                <span className="text-[#DFDFE0]">Anonymous donation</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#434672] to-[#755a5a] cursor-pointer text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium"
            >
              Contribute Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#FFFFFF0D] border border-[#FFFFFF0D] text-[#DFDFE0] cursor-pointer py-3 px-4 rounded-sm hover:bg-[#282e38] transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FundingDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { address } = useAccount();
  const isWalletConnected = !!address;
  const { id } = useParams();
  const pool = useGetPool(Array.isArray(id) ? id[0] : id ?? "");
  console.log(pool);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  // const [funding, setFunding] = useState<any>(null);

  const fundingId = params.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (fundingId) {
      // In real app, fetch from API using fundingId
      const foundFunding = sampleFundingData.find((f) => f.id === fundingId);
      // setFunding(foundFunding || null);
    }
  }, [fundingId]);

  const handleContribute = (amount: number, isAnonymous: boolean) => {
    console.log(
      `Contributing $${amount} ${isAnonymous ? "anonymously" : "publicly"}`
    );
    // Here you would call the blockchain function to contribute
    // For now, just show a success message
    alert(
      `Thank you for contributing $${amount}! ${
        isAnonymous
          ? "Your donation will be anonymous."
          : "Your donation will be public."
      }`
    );
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-[50vh] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-gray-300 mb-4">
            Please connect your wallet to view funding details
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-[50vh] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Funding Not Found
          </h2>
          <p className="text-gray-300 mb-4">
            The funding campaign you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/dashboard/crowd-fund")}
            className="bg-gradient-to-r from-[#434672] to-[#755a5a] text-white px-6 py-3 rounded-sm hover:opacity-90 transition-opacity duration-200"
          >
            Back to Crowd Fundings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 border-b border-[#FFFFFF0D] pb-8">
        <button
          onClick={() => router.push("/dashboard/crowd-fund")}
          className="flex items-center cursor-pointer gap-2 text-[#8398AD] hover:text-[#DFDFE0] transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Crowd Fundings
        </button>
        <h1 className="text-2xl font-bold text-[#DFDFE0] mb-2">{pool.name}</h1>
        <p className="text-[#8398AD] text-base">
          Help us reach our funding goal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Section */}
          <div className="bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#DFDFE0] font-medium text-lg">
                  Progress
                </span>
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-sm">
                  {/* {funding.progress}% Complete */}
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-[#282e38] rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    // style={{ width: `${funding.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-[#8398AD]">
                  <span>Raised: {pool.balance}</span>
                  <span>Target: {pool.target}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6">
            <h3 className="text-[#DFDFE0] font-medium text-lg mb-4">
              Description
            </h3>
            <p className="text-[#8398AD] text-sm leading-relaxed">
              {/* {funding.description} */}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6">
            <h3 className="text-[#DFDFE0] font-medium text-lg mb-4">
              Campaign Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">{pool.donors}</p>
                  <p className="text-[#8398AD] text-sm">Total Donors</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">{pool.create_at}</p>
                  <p className="text-[#8398AD] text-sm">Date Created</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">{pool.balance}</p>
                  <p className="text-[#8398AD] text-sm">Amount Raised</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">{pool.target}</p>
                  <p className="text-[#8398AD] text-sm">Target Amount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contribute Button */}
          <div className="bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6">
            <h3 className="text-[#DFDFE0] font-medium text-lg mb-4">
              Support This Campaign
            </h3>
            <p className="text-[#8398AD] text-sm mb-4">
              Every contribution helps us get closer to our goal.
            </p>
            <button
              onClick={() => setIsContributeModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#434672] to-[#755a5a] cursor-pointer text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium"
            >
              Contribute Now
            </button>
          </div>
        </div>
      </div>

      {/* Contribute Modal */}
      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onContribute={handleContribute}
      />
    </div>
  );
};

export default FundingDetailsPage;
