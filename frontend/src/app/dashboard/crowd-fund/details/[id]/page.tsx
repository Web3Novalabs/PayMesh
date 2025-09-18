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
import { useGetPool } from "@/hooks/useContractInteraction";
import { useAccount } from "@starknet-react/core";
import WalletConnect from "@/app/components/WalletConnect";
import { donate } from "@/hooks/blockchainWriteFunction";
import { toast } from "react-hot-toast";
import QRcodeCrowdfund from "@/app/dashboard/components/QRcodeCrowdfund";
import { poolAddrQr } from "@/hooks/blockchainWriteFunction";
import QRCode from "react-qr-code";

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess: boolean;
}

const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  isSuccess: isSuccessProp,
}) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [, setIsSuccessT] = useState(isSuccessProp || false);
  const { id } = useParams();
  const pool = useGetPool(Array.isArray(id) ? id[0] : id ?? "");
  const { account } = useAccount();
  console.log(pool);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      donate(
        typeof pool?.pool_address === "string" ? pool.pool_address : "",
        numAmount,
        account,
        setIsLoading,
        setIsSuccessT,
        () => {
          // onSuccess callback
          toast.success("Contribution successful!");
          setAmount("");
          setIsAnonymous(false);
          onClose();
        },
        (errorMessage) => {
          // onError callback
          toast.error(`Donation failed: ${errorMessage}`);
        }
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
            disabled={isLoading}
            className={`transition-colors duration-200 ${
              isLoading
                ? "text-[#8398AD] cursor-not-allowed opacity-50"
                : "text-[#8398AD] hover:text-[#DFDFE0] cursor-pointer"
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="bg-[#10273E] border border-[#0073E6] rounded-sm p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0073E6]"></div>
                <p className="text-[#0073E6] text-sm font-medium">
                  Processing your donation on the blockchain...
                </p>
              </div>
              <p className="text-[#8398AD] text-xs mt-2">
                Please wait while the transaction is being confirmed. Do not
                close this window.
              </p>
            </div>
          )}

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
              disabled={isLoading}
              className={`flex-1 bg-gradient-to-r from-[#434672] to-[#755a5a] text-white py-3 px-4 rounded-sm transition-opacity duration-200 font-medium ${
                isLoading
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:opacity-90"
              }`}
            >
              {isLoading ? "Processing Transaction..." : "Contribute Now"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`flex-1 border border-[#FFFFFF0D] text-[#DFDFE0] py-3 px-4 rounded-sm transition-colors duration-200 ${
                isLoading
                  ? "bg-[#282e38] cursor-not-allowed opacity-50"
                  : "bg-[#FFFFFF0D] cursor-pointer hover:bg-[#282e38]"
              }`}
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

  const crowdFundingAddr: string = pool?.pool_address
    ? (pool.pool_address as bigint).toString()
    : "";

  console.log(
    "this is for you xxXXXXXXXxxxxxxXXXXXX",
    crowdFundingAddr,
    pool?.pool_address
  );

  // const targetReached = pool
  //   ? Number.parseFloat(pool.balance.toString()) / 1e18 >=
  //     Number.parseFloat(pool.target.toString())
  //   : false;

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isSuccess] = useState(false);
  // const [funding, setFunding] = useState<any>(null);

  const fundingId = params.id ? parseInt(params.id as string) : null;

  useEffect(() => {
    if (fundingId) {
      // In real app, fetch from API using fundingId
      // const foundFunding = sampleFundingData.find((f) => f.id === fundingId);
      // setFunding(foundFunding || null);
    }
  }, [fundingId]);

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
    <div className="min-h-screen mb-10">
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
                <div className="w-full bg-[#282e38] rounded-full h-2.5">
                  <div
                    className={`bg-blue-600 h-2.5 rounded-full transition-all duration-300`}
                    style={{
                      width: `${Math.min(
                        (Number.parseFloat(pool.balance.toString()) /
                          1e18 /
                          Number.parseFloat(pool.target.toString())) *
                          100,
                        100
                      )}%`,
                    }}
                  >
                    {" "}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-[#8398AD]">
                  <span>
                    Raised:{" "}
                    {(
                      Number.parseFloat(pool.balance.toString()) / 1e18
                    ).toFixed(2)}{" "}
                    STRK
                  </span>
                  <span>
                    Target:{" "}
                    {Number.parseFloat(pool.target.toString()).toFixed(2)} STRK
                  </span>
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
              {/* {funding.description} */} No description
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
                  <p className="text-[#DFDFE0] font-medium">
                    {(
                      Number.parseFloat(pool.balance.toString()) / 1e18
                    ).toFixed(2)}{" "}
                    STRK
                  </p>
                  <p className="text-[#8398AD] text-sm">Amount Raised</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">
                    {Number.parseFloat(pool.target.toString()).toFixed(2)} STRK
                  </p>
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

          <div className="mb-4 sm:mb-6 text-center bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6 flex flex-col items-center justify-center">
            <div className="inline-block w-full p-2 sm:p-3 bg-[#fffffffe] border-2 border-[#434672d8] rounded-lg">
              <QRCode
                value={crowdFundingAddr}
                size={160}
                level="H"
                className="w-40 h-40 sm:w-full sm:h-48 lg:w-full lg:h-50"
              />
            </div>
            <p className="text-xs sm:text-sm text-[#e2e2e2] mt-2">
              Scan this QR code to get the fund address
            </p>
          </div>
        </div>
      </div>

      {/* Contribute Modal */}
      {isContributeModalOpen && (
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          isSuccess={isSuccess}
        />
      )}
    </div>
  );
};

export default FundingDetailsPage;
