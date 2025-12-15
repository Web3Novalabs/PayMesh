"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Target,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useGetPool } from "@/hooks/useContractInteraction";
import { useAccount } from "@starknet-react/core";
import WalletConnect from "@/app/components/WalletConnect";
import { CROWDFUNDINGADDRESS, donate } from "@/hooks/blockchainWriteFunction";
import { toast } from "react-hot-toast";
import { getTwitterShareUrl } from "@/utils/shareUtils";
import QRCode from "react-qr-code";
import { CallData } from "starknet";
import { myProvider, ONE_STK, normalizeAddress } from "@/utils/contract";
import { copyToClipboard, truncateAddress } from "@/lib/utils";

const USDC_TOKEN_ADDRESS =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

interface UsdcBalanceProps {
  crowd_funding: {
    target_amount: string;
    creator_address: string;
    id: number;
    is_complete: boolean;
    name: string;
    pool_address: string;
    description: string;
  };
  token_history: Array<{
    token_address: string;
    balance: string;
  }>;
  donation_count: {
    total_donors: number;
    total_numbers_of_donations: number;
  };
}

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess: boolean;
}

const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const params = useParams();
  const { id } = params;
  const pool = useGetPool(Array.isArray(id) ? id[0] : id ?? "");
  const { account } = useAccount();
  // console.log(pool);
  // const balance = useGetBalance(account?.address || "0x0");
  // Handle success state close modal and show success toast
  useEffect(() => {
    if (isSuccess) {
      toast.success("🎉 Donation successful! Thank you for your contribution!");
      // Reset form state
      setAmount("");
      setIsAnonymous(false);
      setIsSuccess(false);
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isSuccess, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    // Validation: If anonymous is selected, amount must be more than 10
    if (isAnonymous && numAmount <= 10) {
      toast.error("Anonymous donations must be more than 10 STRK or 2 USDC");
      return;
    }

    // if (isAnonymous && balance?.formatted && +balance.formatted < 12) {
    //   toast.error("Insufficient balance, Top Up!");
    //   return;
    // }

    // Validation: Amount must be positive
    if (numAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    donate(
      typeof pool?.pool_address === "string" ? pool.pool_address : "",
      numAmount,
      account,
      setIsLoading,
      isAnonymous,
      setIsSuccess
    );
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
            disabled={isLoading || isSuccess}
            className={`transition-colors duration-200 ${
              isLoading || isSuccess
                ? "text-[#8398AD] cursor-not-allowed opacity-50"
                : "text-[#8398AD] hover:text-[#DFDFE0] cursor-pointer"
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success State */}
          {/* {isSuccess && (
            <div className="bg-[#064E3B] border border-[#10B981] rounded-sm p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-[#10B981] text-sm font-medium">
                  Donation successful! 🎉
                </p>
              </div>
              <p className="text-[#6EE7B7] text-xs mt-2">
                Your contribution has been recorded on the blockchain. Thank
                you!
              </p>
            </div>
          )} */}

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

            {/* Anonymous donation requirement notice */}
            {isAnonymous && (
              <div className="bg-[#1F2937] border border-[#F59E0B] rounded-sm p-3">
                <p className="text-[#F59E0B] text-sm">
                  ⚠️ Anonymous donations require a minimum of{" "}
                  <strong>10 STRK/2 USDC</strong>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={
                isLoading ||
                isSuccess ||
                (isAnonymous && parseFloat(amount) <= 10) ||
                parseFloat(amount) <= 0
              }
              className={`flex-1 bg-gradient-to-r from-[#434672] to-[#755a5a] text-white py-3 px-4 rounded-sm transition-opacity duration-200 font-medium ${
                isLoading ||
                isSuccess ||
                (isAnonymous && parseFloat(amount) <= 10) ||
                parseFloat(amount) <= 0
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:opacity-90"
              }`}
            >
              {isLoading
                ? "Processing Transaction..."
                : isSuccess
                ? "Donation Successful!"
                : "Contribute Now"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSuccess}
              className={`flex-1 border border-[#FFFFFF0D] text-[#DFDFE0] py-3 px-4 rounded-sm transition-colors duration-200 ${
                isLoading || isSuccess
                  ? "bg-[#282e38] cursor-not-allowed opacity-50"
                  : "bg-[#FFFFFF0D] cursor-pointer hover:bg-[#282e38]"
              }`}
            >
              {isSuccess ? "Closing..." : "Cancel"}
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
  const { shortId, id } = params;
  const [isSbumitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<UsdcBalanceProps | null>(null);
  const { address, account } = useAccount();
  const isWalletConnected = !!address;
  const pool = useGetPool(Array.isArray(id) ? id[0] : id ?? "");

  const crowdFundingAddr: string = pool?.pool_address
    ? "0x" + normalizeAddress((pool.pool_address as bigint).toString())
    : "";

  const getUsdcBalance = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crowdfunding/${crowdFundingAddr}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch USDC balance");
      }

      const data = await response.json();
      console.log("USDC BALANCE: ", data);
      setUsdcBalance(data);
    } catch (error) {
      console.error("Error fetching USDC balance:", error);
    }
  }, [crowdFundingAddr]);

  function formatAmountUsdc(amount: string | number) {
    return (Number(amount) / 1e6).toFixed(2);
  }

  const targetAmount = usdcBalance?.crowd_funding?.target_amount
    ? formatAmountUsdc(usdcBalance.crowd_funding.target_amount)
    : "0.00";

  const usdcTokenBalance = usdcBalance?.token_history?.find((token) =>
    token.token_address
      ? token.token_address.toLowerCase() === USDC_TOKEN_ADDRESS.toLowerCase()
      : false
  );

  const amountRaised = usdcTokenBalance?.balance
    ? formatAmountUsdc(usdcTokenBalance.balance)
    : "0.00";

  // REMOVE ALL THIS ONES LATER
  const SPECIAL_POOL_ADDRESS =
    "0x0491e7064752699c7b15fe2476319b3d04bec0404f98f3d57c2e1cff2239fc1f";
  const isSpecialPool =
    crowdFundingAddr &&
    crowdFundingAddr.toLowerCase() === SPECIAL_POOL_ADDRESS.toLowerCase();

  const finalTargetAmount = isSpecialPool ? "300.00" : targetAmount;

  const isFinalCompleted = isSpecialPool
    ? Number(amountRaised) >= 300
    : pool?.is_completed || usdcBalance?.crowd_funding?.is_complete;

  useEffect(() => {
    getUsdcBalance();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      getUsdcBalance();
    }, 5000);

    return () => clearInterval(interval);
  }, [id, getUsdcBalance]);

  const handleCopyToClipboard = async (text: string) => {
    await copyToClipboard(text, () => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCopyShareLink = async () => {
    const shareUrl = `paymesh.app/dashboard/crowd-fund/details/${shortId}/${id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareLinkCopied(true);
      toast.success("Campaign link copied to clipboard!");
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy share link:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleShareOnTwitter = () => {
    const shareUrl = `paymesh.app/dashboard/crowd-fund/details/${shortId}/${id}`;
    const shareText = `🌟 I just launched my campaign "${pool?.name}" on @paymesh_ 🚀 

Every contribution counts — let's build something amazing together! 💫

#PayMesh #Starknet #CryptoForGood #Crowdfunding`;

    const twitterUrl = getTwitterShareUrl(shareText, shareUrl);
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  // const targetReached = pool
  //   ? Number.parseFloat(pool.balance.toString()) / 1e18 >=
  //     Number.parseFloat(pool.target.toString())
  //   : false;

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isSuccess] = useState(false);
  // const [funding, setFunding] = useState<any>(null);

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);

      if (account) {
        const swiftpayCall = {
          contractAddress: CROWDFUNDINGADDRESS,
          entrypoint: "paymesh",
          calldata: CallData.compile({
            pool_address: crowdFundingAddr,
          }),
        };

        // const approveCall = {
        //   contractAddress: USDCTokenAddress,
        //   entrypoint: "approve",
        //   calldata: [
        //     PAYMESH_ADDRESS, // spender
        //     cairo.uint256(ONE_STK),
        //   ],
        // };

        const multicallData = [swiftpayCall];
        const result = await account.execute(multicallData);

        // const feeDetails: PaymasterDetails = {
        //   feeMode: {
        //     mode: "sponsored",
        //   },
        // };

        // const feeEstimation = await account?.estimatePaymasterTransactionFee(
        //   [...multicallData],
        //   feeDetails
        // );

        // const result = await account?.executePaymasterTransaction(
        //   [...multicallData],
        //   feeDetails,
        //   feeEstimation?.suggested_max_fee_in_gas_token
        // );

        const status = await myProvider.waitForTransaction(
          result?.transaction_hash as string
        );

        // setResultHash(result.transaction_hash);
        console.log(status);
        toast.success("payment succesfull");
      }
    } catch {
      toast.error("Failed to split funds, top up subscription. and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (!isWalletConnected) {
  //   return (
  //     <div className="min-h-[50vh] text-white p-6 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center mx-auto mb-4">
  //           <Heart className="w-8 h-8 text-white" />
  //         </div>
  //         <h2 className="text-2xl font-bold text-white mb-2">
  //           Wallet Not Connected
  //         </h2>
  //         <p className="text-gray-300 mb-4">
  //           Please connect your wallet to view funding details
  //         </p>
  //         <WalletConnect />
  //       </div>
  //     </div>
  //   );
  // }

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
    <div className="min-h-screen mb-10 relative">
      {/* Pool Completed Overlay */}
      {/* {pool?.is_completed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000036] bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1F2937] border border-[#10B981] rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#10B981] mb-2">
              Campaign Completed! 🎉
            </h2>
            <p className="text-[#DFDFE0] mb-4">
              This funding campaign has reached its target goal and is now
              closed.
            </p>
            <div className="bg-[#064E3B] border border-[#10B981] rounded-sm p-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6EE7B7]">Final Amount Raised:</span>
                <span className="text-[#10B981] font-bold">
                  {formatAmountUsdc(
                    usdcBalance?.token_history?.[0]?.balance as string
                  )}{" "}
                  USDC
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-[#6EE7B7]">Target Goal:</span>
                <span className="text-[#DFDFE0]">{targetAmount} USDC</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-[#51be58]">Donors:</span>
                <span className="text-[#DFDFE0]">
                  {usdcBalance?.donation_count?.total_donors || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-[#6EE7B7] font-medium">
                  Date Created:
                </span>
                <span className="text-[#DFDFE0]">{pool.create_at}</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/crowd-fund")}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium cursor-pointer"
            >
              Back to All Campaigns
            </button>
          </div>
        </div>
      )} */}

      {isFinalCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000036] bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1F2937] border border-[#10B981] rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#10B981] mb-2">
              Campaign Completed! 🎉
            </h2>
            <p className="text-[#DFDFE0] mb-4">
              This funding campaign has reached its target goal and is now
              closed.
            </p>
            <div className="bg-[#064E3B] border border-[#10B981] rounded-sm p-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6EE7B7]">Final Amount Raised:</span>
                <span className="text-[#10B981] font-bold">
                  {/* {(Number.parseFloat(pool.balance.toString()) / 1e18).toFixed(
                    2
                  )}{" "} */}
                  {formatAmountUsdc(
                    usdcBalance?.token_history?.[0]?.balance as string
                  )}{" "}
                  USDC
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-[#6EE7B7]">Target Goal:</span>
                <span className="text-[#DFDFE0]">{finalTargetAmount} USDC</span>
                {/* <span className="text-[#DFDFE0]">{targetAmount} USDC</span> */}
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-[#51be58]">Donors:</span>
                <span className="text-[#DFDFE0]">
                  {usdcBalance?.donation_count?.total_donors || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-[#6EE7B7] font-medium">
                  Date Created:
                </span>
                <span className="text-[#DFDFE0]">{pool.create_at}</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/crowd-fund")}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium cursor-pointer"
            >
              Back to All Campaigns
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      {/* <div
        className={`mb-8 border-b border-[#FFFFFF0D] pb-8 ${
          usdcBalance?.crowd_funding?.is_complete
            ? "blur-sm pointer-events-none"
            : ""
        }`}
      > */}
      <div
        className={`mb-8 border-b border-[#FFFFFF0D] pb-8 ${
          isFinalCompleted ? "blur-sm pointer-events-none" : ""
        }`}
      >
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

      {/* Share Section - Compact */}
      <div
        className={`mb-6 ${
          isFinalCompleted ? "blur-sm pointer-events-none" : ""
          //  pool.is_completed ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-[#8398AD] whitespace-nowrap">
            Share this campaign:
          </span>

          <button
            onClick={handleShareOnTwitter}
            className="flex items-center gap-1 sm:gap-2 bg-black hover:bg-gray-800 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium cursor-pointer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="whitespace-nowrap">Share on X</span>
          </button>

          <button
            onClick={handleCopyShareLink}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium cursor-pointer ${
              shareLinkCopied
                ? "bg-green-600 text-white"
                : "bg-[#434672] hover:bg-[#755A5A] text-white"
            }`}
          >
            <Copy className="w-4 h-4" />
            <span className="whitespace-nowrap">
              {shareLinkCopied ? "Copied!" : "Copy Link"}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 mb-5 ${
          isFinalCompleted ? "blur-sm pointer-events-none" : ""
          // pool.is_completed ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <span className="text-[#434672] font-semibold">
          FundRaising Address:
        </span>
        <span className="text-[#cad4dd]">
          {window.innerWidth < 880
            ? truncateAddress(crowdFundingAddr)
            : crowdFundingAddr}
        </span>
        <button
          onClick={() => handleCopyToClipboard(crowdFundingAddr)}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          {copySuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${
          isFinalCompleted ? "blur-sm pointer-events-none" : ""
          // usdcBalance?.crowd_funding?.is_complete
          //   ? "blur-sm pointer-events-none"
          //   : ""
        }`}
      >
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
                {/* <h2 className="text-white font-extrabold text-xl">
                  {usdcBalance?.crowd_funding.is_complete
                    ? 100
                    : Math.min(
                        (Number.parseFloat(pool.balance.toString()) /
                          1e18 /
                          Number.parseFloat(pool.target.toString())) *
                          100,
                        100
                      ).toFixed(2)}
                  %
                </h2>{" "}
                <div className="w-full bg-[#282e38] rounded-full h-2.5">
                  <div
                    className={`bg-blue-600 h-2.5 rounded-full transition-all duration-300`}
                    style={{
                      width: `${
                        !pool.is_completed
                          ? Math.min(
                              (Number.parseFloat(pool.balance.toString()) /
                                1e18 /
                                Number.parseFloat(pool.target.toString())) *
                                100,
                              100
                            )
                          : 100
                      }%`,
                    }}
                  >
                    {" "}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-[#8398AD]">
                  <span>Raised: {amountRaised} USDC</span>
                  <span>Target: {targetAmount} USDC</span>
                </div> */}
                <h2 className="text-white font-extrabold text-xl">
                  {isFinalCompleted
                    ? 100
                    : Math.min(
                        (Number(amountRaised) / Number(finalTargetAmount)) *
                          100,
                        100
                      ).toFixed(2)}
                  %
                </h2>{" "}
                <div className="w-full bg-[#282e38] rounded-full h-2.5">
                  <div
                    className={`bg-blue-600 h-2.5 rounded-full transition-all duration-300`}
                    style={{
                      width: `${
                        !isFinalCompleted
                          ? Math.min(
                              (Number(amountRaised) /
                                Number(finalTargetAmount)) *
                                100,
                              100
                            )
                          : 100
                      }%`,
                    }}
                  >
                    {" "}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-[#8398AD]">
                  <span>Raised: {amountRaised} USDC</span>
                  <span>Target: {finalTargetAmount} USDC</span>
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
              {usdcBalance?.crowd_funding?.description
                ? usdcBalance?.crowd_funding?.description
                : pool.description}
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
                  <p className="text-[#DFDFE0] font-medium">
                    {usdcBalance?.donation_count.total_donors}
                  </p>
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
                    {amountRaised} USDC
                  </p>
                  <p className="text-[#8398AD] text-sm">Amount Raised</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">
                    {finalTargetAmount} USDC
                    {/* {targetAmount} USDC */}
                  </p>
                  <p className="text-[#8398AD] text-sm">Target Amount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contribute Button */}
          {/* {!pool.is_completed && ( */}
          {!isFinalCompleted && (
            <div className="bg-[#FFFFFF0D] border border-[#FFFFFF0D] rounded-sm p-6">
              <h3 className="text-[#DFDFE0] font-medium text-lg mb-4">
                Support This Campaign
              </h3>
              <p className="text-[#8398AD] text-sm mb-4">
                Every contribution helps us get closer to our goal.
              </p>
              {pool.balance >= pool.target * ONE_STK && (
                <button
                  onClick={() => handlePayment()}
                  className="w-full bg-gradient-to-r from-[#434672] to-[#755a5a] cursor-pointer text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium mb-2"
                >
                  {isSbumitting ? "resolving....." : "resolve pool"}
                </button>
              )}

              {!isWalletConnected ? (
                <div className="bg-[#1F2937] border border-[#F59E0B] rounded-sm p-3 mb-2 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-[#F59E0B] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#F59E0B] text-sm font-medium mb-1">
                        Wallet Not Connected
                      </h4>
                      <p className="text-[#8398AD] text-xs mb-2">
                        Connect your wallet to contribute to this campaign and
                        track your donations.
                      </p>
                      <WalletConnect />
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsContributeModalOpen(true)}
                  className="w-full bg-gradient-to-r from-[#434672] to-[#755a5a] cursor-pointer text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium"
                >
                  Contribute Now
                </button>
              )}
            </div>
          )}

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
