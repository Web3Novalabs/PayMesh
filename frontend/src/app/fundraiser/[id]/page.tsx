"use client";

import { ArrowLeft, Check, Copy, Share2 } from "lucide-react";
import handshakeIcon from "../../../../public/Handshake.svg";
import calendarIcon from "../../../../public/CalendarDots.svg";
import qrCode from "../../../../public/qr-code.svg";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FundraiseDetailsProps, USDC_TOKEN_ADDRESS } from "@/types/usdcDataApi";
import {
  copyToClipboard,
  formatAmountUsdc,
  truncateAddress,
} from "@/lib/utils";
import { epocTimeReadable, myProvider } from "@/utils/contract";
import { toast } from "react-hot-toast";
import { useAccount } from "@starknet-react/core";
import { CallData } from "starknet";
import { CROWDFUNDINGADDRESS } from "@/hooks/blockchainWriteFunction";
import CampaignCompleted from "./components/CampaignCompleted";
import LoadingState from "@/components/Loading-state";
import ContributeModal from "./components/ContributeModal";
import { MyCleanQrCode } from "@/components/qr-code";

const FundraiseDetails = () => {
  const router = useRouter();
  const params = useParams();
  const fundRaiseAddr = params.id;
  const { address, account } = useAccount();

  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchFundraiseDetails, setFetchFundraiseDetails] =
    useState<FundraiseDetailsProps | null>(null);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  // NEW STATES FOR CLEAN LOADING
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crowdfunding/${fundRaiseAddr}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch fundraise details");
      }

      const data = await response.json();
      setFetchFundraiseDetails(data);
    } catch (error) {
      console.error("Error fetching fundraise details:", error);
    } finally {
      // Mark initial load complete only ONCE
      if (!hasFetchedOnce) {
        setIsInitialLoading(false);
        setHasFetchedOnce(true);
      }
    }
  }, [fundRaiseAddr, hasFetchedOnce]);

  useEffect(() => {
    fetchDetails();

    // Poll every 5 seconds WITHOUT showing loading again
    const interval = setInterval(() => {
      fetchDetails();
    }, 5000);

    return () => clearInterval(interval);
  }, [fundRaiseAddr, fetchDetails]);

  // HANDLE INITIAL LOADING ONCE ONLY
  if (isInitialLoading) {
    return (
      <LoadingState
        title="Loading fundraise details"
        description="Please wait while we fetch the fundraise details"
      />
    );
  }

  // HANDLE NOT FOUND
  if (hasFetchedOnce && !fetchFundraiseDetails) {
    return (
      <div className="text-center text-white my-20">
        <p className="text-lg font-semibold">Fundraise not found</p>
        <button
          onClick={() => router.push("/fundraiser")}
          className="mt-4 px-4 py-2 bg-[#4950B1] rounded-full text-white"
        >
          Go back
        </button>
      </div>
    );
  }

  const usdcTokenBalance = fetchFundraiseDetails?.token_history?.find((token) =>
    token.token_address
      ? token.token_address.toLowerCase() === USDC_TOKEN_ADDRESS.toLowerCase()
      : false
  );

  const targetAmount = fetchFundraiseDetails?.crowd_funding?.target_amount
    ? formatAmountUsdc(fetchFundraiseDetails.crowd_funding.target_amount)
    : "0.00";

  const amountRaised = usdcTokenBalance?.balance
    ? formatAmountUsdc(usdcTokenBalance.balance)
    : "0.00";

  const handleCopyToClipboard = async (text: string) => {
    await copyToClipboard(text, () => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const DATE_CREATED_AT = epocTimeReadable(
    fetchFundraiseDetails?.crowd_funding?.created_at || "Unknown Date"
  );

  const handlePayment = async () => {
    try {
      setIsSubmitting(true);

      if (account) {
        const swiftpayCall = {
          contractAddress: CROWDFUNDINGADDRESS,
          entrypoint: "paymesh",
          calldata: CallData.compile({
            pool_address: fundRaiseAddr || "",
          }),
        };

        const multicallData = [swiftpayCall];
        const result = await account.execute(multicallData);

        const status = await myProvider.waitForTransaction(
          result?.transaction_hash as string
        );

        console.log(status);
        toast.success("Payment successful");
      }
    } catch {
      toast.error("Failed to process payment. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 my-16 max-w-sit-screen px-5 mx-auto">
      {fetchFundraiseDetails?.crowd_funding?.is_complete && (
        <CampaignCompleted
          amountRaised={amountRaised}
          targetAmount={targetAmount}
          total_donors={fetchFundraiseDetails?.donation_count?.total_donors}
          created_at={DATE_CREATED_AT}
        />
      )}

      <button
        onClick={() => router.push("/fundraiser")}
        className="flex items-center cursor-pointer bg-[#FFFFFF0D] border border-[#FFFFFF1A] gap-2 text-[#DFDADA] hover:text-[#DFDFE0] py-3 px-4 rounded-4xl hover:bg-[#232542] mb-12"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Fundraisers
      </button>

      <div className="bg-[#FFFFFF05] border border-[#232542] rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#232542] py-4 px-6">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <h2 className="text-[#E2E2E2] font-semibold text-base leading-tight truncate max-w-[200px] sm:max-w-md">
              {fetchFundraiseDetails?.crowd_funding?.name}
            </h2>
            <button className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors shrink-0">
              <span className="text-[#030407] text-sm">Share</span>
              <Share2 className="w-4 h-4 text-[#030407]" />
            </button>
          </div>

          <div className="flex items-center justify-between md:justify-end space-x-2 bg-[#0C121D] py-2 px-5 rounded-full w-full md:w-auto max-w-full">
            <div className="flex items-center gap-2 overflow-hidden">
              <h3 className="text-[#8398AD] text-base border-r border-[#8398AD] pr-2 shrink-0">
                Funding address
              </h3>

              <span className="text-[#E2E2E2] text-sm truncate">
                {typeof window !== "undefined" && window.innerWidth < 880
                  ? truncateAddress(
                      (fundRaiseAddr as string) ??
                        fetchFundraiseDetails?.crowd_funding?.pool_address
                    )
                  : fetchFundraiseDetails?.crowd_funding?.pool_address}
              </span>
            </div>

            <button
              onClick={() =>
                handleCopyToClipboard(
                  fetchFundraiseDetails?.crowd_funding?.pool_address || ""
                )
              }
              className="text-[#8398AD] hover:text-white transition-colors shrink-0 pl-2"
            >
              {copySuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center justify-between sm:justify-start space-x-2 border border-[#232542] w-full sm:w-fit rounded-full py-2.5 px-4">
              <h3 className="text-[#8398AD] border-r border-[#8398AD] pr-2">
                Amount Raised
              </h3>
              <span className="text-[#E2E2E2] text-sm">
                {amountRaised} USDC
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start space-x-2 border border-[#232542] w-full sm:w-fit rounded-full py-2.5 px-4">
              <h3 className="text-[#8398AD] border-r border-[#8398AD] pr-2">
                Target Amount
              </h3>
              <span className="text-[#E2E2E2] text-sm">
                {targetAmount} USDC
              </span>
            </div>

            <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
              <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D]">
                <Image
                  src={handshakeIcon}
                  alt="usersIcon"
                  width={20}
                  height={20}
                />
              </span>

              <div className="text-[#8398AD] text-sm flex flex-col justify-center">
                <span className="font-semibold">Donors:</span>
                <span className="text-[#DFDFE0] font-semibold">
                  {fetchFundraiseDetails?.donation_count?.total_donors}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
              <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D]">
                <Image
                  src={calendarIcon}
                  alt="calendarIcon"
                  width={20}
                  height={20}
                />
              </span>

              <div className="text-[#8398AD] text-sm flex flex-col justify-center">
                <span className="font-semibold">Date Created:</span>
                <span className="text-[#DFDFE0] font-semibold">
                  {DATE_CREATED_AT}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            {amountRaised > targetAmount && (
              <button
                onClick={() => handlePayment()}
                className="bg-[#FFFFFF0D] text-white px-4 py-2.5 border border-[#FFFFFF1A] rounded-full text-center hover:bg-[#FFFFFF1A] transition-colors"
              >
                {isSubmitting ? "Resolving..." : "Resolve Pool"}
              </button>
            )}

            <button
              onClick={() => setIsContributeModalOpen(true)}
              className="bg-[#4950B1] text-white px-4 py-2.5 border border-[#FFFFFF1A] rounded-full text-center hover:bg-[#3d4295] transition-colors"
            >
              Donate now
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-24 gap-4">
        <div className="lg:col-span-19 py-6 bg-[#FFFFFF05] border border-[#232542] rounded-lg flex flex-col h-full">
          <h2 className="text-[#E2E2E2] font-semibold border-b px-6 border-[#232542] pb-4 text-base">
            Description
          </h2>

          <div className="text-[#8398AD] text-sm leading-relaxed px-6 space-y-4 flex-1">
            {fetchFundraiseDetails?.crowd_funding?.description}
          </div>
        </div>

        <div className="lg:col-span-5 py-6 bg-[#FFFFFF05] border border-[#232542] rounded-lg flex flex-col h-full">
          <h2 className="text-[#E2E2E2] px-6 pb-4 border-b border-[#232542] text-center font-semibold text-base">
            Scan to fund address
          </h2>

          <div className="flex items-center justify-center flex-1 w-full ">
            <MyCleanQrCode value={fundRaiseAddr as string} />
          </div>
        </div>
      </div>

      {isContributeModalOpen && (
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          pool_address={fundRaiseAddr as string}
        />
      )}
    </div>
  );
};

export default FundraiseDetails;
