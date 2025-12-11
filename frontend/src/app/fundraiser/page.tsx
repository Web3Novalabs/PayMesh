"use client";

import React, { useState } from "react";
import CrowdFundDashboard from "./components/CrowdFundDashboard";
import CreateCrowdFundForm from "./components/CreateCrowdFundForm";
import WalletConnect from "@/app/components/WalletConnect";
import { useAccount } from "@starknet-react/core";

type currentView = "dashboard" | "create";

const CrowdFundPage = () => {
  const [currentView, setCurrentView] = useState<currentView>("dashboard");

  const handleCreateNew = () => {
    // Prevent creating if wallet is not connected
    if (!isWalletConnected) {
      return;
    }
    setCurrentView("create");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  const handleFormSubmit = () => {
    // Handle form submission logic here
    // After successful submission, you might want to:
    // 1. Add the new funding to the list
    // 2. Show a success message
    // 3. Return to dashboard
    setCurrentView("dashboard");
  };

  const { address } = useAccount();
  const isWalletConnected = !!address;

  return (
    <div className="min-h-screen max-w-sit-screen px-5 mx-auto">
      <div className=" pb-6">
        {currentView === "dashboard" ? (
          <CrowdFundDashboard
            onCreateNew={handleCreateNew}
            isWalletConnected={isWalletConnected}
          />
        ) : (
          <CreateCrowdFundForm
            onBack={handleBackToDashboard}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default CrowdFundPage;
