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

  // if (!isWalletConnected) {
  //   return (
  //     <div className="min-h-[50vh] text-white p-6 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center mx-auto mb-4">
  //           <svg
  //             className="w-8 h-8 text-white"
  //             fill="none"
  //             stroke="currentColor"
  //             viewBox="0 0 24 24"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth={2}
  //               d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  //             />
  //           </svg>
  //         </div>
  //         <h2 className="text-2xl font-bold text-white mb-2">
  //           Wallet Not Connected
  //         </h2>
  //         <p className="text-gray-300 mb-4">
  //           Please connect your wallet to view your groups
  //         </p>
  //         <WalletConnect />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen">
      {/* <ComingSoon
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        title="Feature Coming Soon"
        description="This feature is in development..."
      /> */}

      <div className=" pb-6">
        {/* Dynamic Content */}
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
