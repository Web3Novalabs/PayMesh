"use client";

import React from "react";
import { useAccount } from "@starknet-react/core";

interface WalletGuardProps {
  children: React.ReactNode;
}

const WalletGuard = ({ children }: WalletGuardProps) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
          <p className="text-[#8398AD] max-w-md mx-auto">
            Please connect your wallet to access this section and manage your
            groups and transactions.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default WalletGuard;
