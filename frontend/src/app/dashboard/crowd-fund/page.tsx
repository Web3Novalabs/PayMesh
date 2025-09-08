"use client";

import React, { useEffect, useState } from "react";
import CrowdFundDashboard from "./components/CrowdFundDashboard";
import CreateCrowdFundForm from "./components/CreateCrowdFundForm";
import FundingDetailsModal from "./components/FundingDetailsModal";
import WalletConnect from "@/app/components/WalletConnect";
import { useAccount } from "@starknet-react/core";
import ComingSoon from "./components/ComingSoon";

// Type definitions
interface FundingData {
  id: number;
  title: string;
  progress: number;
  donors: number;
  dateCreated: string;
  targetAmount: string;
  currentAmount: string;
  description?: string;
}

interface FormData {
  name: string;
  tokenType: string;
  targetAmount: string;
  walletAddress: string;
}

const fundingData: FundingData[] = [
  {
    id: 1,
    title: "Visa Application",
    progress: 79,
    donors: 12,
    dateCreated: "20th - 08 - 2025",
    targetAmount: "$5,000",
    currentAmount: "$3,950",
  },
  {
    id: 2,
    title: "School Fees",
    progress: 55,
    donors: 5,
    dateCreated: "29th - 08 - 2025",
    targetAmount: "$3,000",
    currentAmount: "$1,650",
  },
];

type currentView = "dashboard" | "create";

const CrowdFundPage = () => {
  const [currentView, setCurrentView] = useState<currentView>("dashboard");
  const [selectedFunding, setSelectedFunding] = useState<FundingData | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  useEffect(() => {
    setIsComingSoonOpen(true);
  }, []);

  const handleCreateNew = () => {
    setCurrentView("create");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  const handleViewDetails = (id: number) => {
    const funding = fundingData.find((f) => f.id === id);
    setSelectedFunding(funding || null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: FormData) => {
    // Handle form submission logic here
    // After successful submission, you might want to:
    // 1. Add the new funding to the list
    // 2. Show a success message
    // 3. Return to dashboard
    setCurrentView("dashboard");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFunding(null);
  };

  const { address } = useAccount();
  const isWalletConnected = !!address;

  if (!isWalletConnected) {
    return (
      <div className="min-h-[50vh] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-gray-300 mb-4">
            Please connect your wallet to view your groups
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ComingSoon
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        title="Feature Coming Soon"
        description="This feature is in development..."
      />

      <div className=" hidden">
        {/* Header Section */}
        <div className="mb-8 border-b border-[#FFFFFF0D] pb-8">
          <h1 className="text-xl font-bold text-[#DFDFE0] mb-2">
            Crowd Funding
          </h1>
          <p className="text-[#8398AD] text-base">
            Create new funding or view all fundings
          </p>
        </div>

        {/* Dynamic Content */}
        {currentView === "dashboard" ? (
          <CrowdFundDashboard
            onCreateNew={handleCreateNew}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <CreateCrowdFundForm
            onBack={handleBackToDashboard}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Funding Details Modal */}
        <FundingDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          funding={selectedFunding}
        />
      </div>
    </div>
  );
};

export default CrowdFundPage;
