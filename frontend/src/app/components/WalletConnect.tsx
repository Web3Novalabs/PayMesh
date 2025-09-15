"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { useState } from "react";
import bravoos from "../../../public/braavos_icon.jpeg.svg";
import argent from "../../../public/Argent.svg";
import Image from "next/image";
export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const getNetworkColor = (chainId?: string) => {
    if (!chainId) return "text-gray-500";
    if (String(chainId) === String(sepolia.id)) return "text-orange-600";
    if (String(chainId) === String(mainnet.id)) return "text-green-600";
    return "text-gray-500";
  };

  const getNetworkName = (chainId?: string) => {
    if (!chainId) return "Not Connected";
    if (String(chainId) === String(sepolia.id)) return "Sepolia Testnet";
    if (String(chainId) === String(mainnet.id)) return "Mainnet";
    return "Unknown Network";
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        {/* Network Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              chain?.id === sepolia.id
                ? "bg-orange-500"
                : chain?.id === mainnet.id
                ? "bg-green-500"
                : "bg-gray-400"
            }`}
          ></div>
          <span
            className={`text-sm font-medium ${getNetworkColor(
              String(chain?.id)
            )}`}
          >
            {getNetworkName(String(chain?.id))}
          </span>
        </div>

        {/* Address Display */}
        <div className="bg-gradient-to-r from-[#434672] to-[#755A5A] px-3 py-2 rounded-lg hidden sm:block">
          <span className="text-sm font-mono text-white">
            {formatAddress(address || "")}
          </span>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={() => setShowDisconnectModal(true)}
          className="px-4 py-2 text-white border-gradient cursor-pointer transition-colors text-sm font-medium"
        >
          Disconnect
        </button>

        {/* Disconnect Confirmation Modal */}
        {showDisconnectModal && (
          <div className="fixed inset-0 bg-[#000000a3] bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-[#ffffff1e] border-gradient-modal rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto relative mx-2">
              {/* Close Button */}
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-[#434672] hover:bg-[#755A5A] text-[#E2E2E2] rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="text-center p-4 sm:p-6">
                <div className="mb-4 sm:mb-5">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#755A5A] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-[#E2E2E2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#ffffff] mb-2">
                    Disconnect Wallet?
                  </h1>
                  <p className="text-sm sm:text-base text-[#e2e2e2]">
                    Are you sure you want to disconnect your wallet? You&apos;ll
                    need to reconnect to continue using the app.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                  <button
                    onClick={() => setShowDisconnectModal(false)}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#434672] cursor-pointer text-white w-full rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      disconnect();
                      setShowDisconnectModal(false);
                    }}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#755A5A] cursor-pointer text-white w-full rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnectModal(true)}
        disabled={isPending}
        className="md:px-4 md:py-2 px-2 py-1.5 text-white border-gradient cursor-pointer transition-colors text-xs md:text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>

      {/* Connect Wallet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-[#000000a3] bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[#ffffff1e] border-gradient-modal rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto relative mx-2">
            {/* Close Button */}
            <button
              onClick={() => setShowConnectModal(false)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-[#434672] hover:bg-[#755A5A] text-[#E2E2E2] rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center p-4 sm:p-6">
              <div className="mb-4 sm:mb-5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#434672] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-[#E2E2E2]"
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
                <h1 className="text-xl sm:text-2xl font-bold text-[#ffffff] mb-2">
                  Connect Your Wallet
                </h1>
                <p className="text-sm sm:text-base text-[#e2e2e2]">
                  Choose your preferred Starknet wallet to connect and start
                  using Paymesh
                </p>
              </div>

              {/* Wallet Options */}
              <div className="mb-4 sm:mb-6">
                <div className="space-y-3">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => {
                        connect({ connector });
                        setShowConnectModal(false);
                      }}
                      disabled={isPending}
                      className="w-full flex items-center justify-between p-3 sm:p-4 bg-[#434672] hover:bg-[#755A5A] text-[#E2E2E2] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
                          {connector.id === "braavos" ? (
                            <Image src={bravoos} alt="bravoos wallet" />
                          ) : connector.id === "argentX" ? (
                            <Image src={argent} alt="argent wallet" />
                          ) : (
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6 text-[#E2E2E2]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm sm:text-base font-medium">
                          {connector.id === "braavos"
                            ? "Braavos"
                            : connector.id === "argentX"
                            ? "Ready"
                            : connector.id}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-[#E2E2E2]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Section */}
              <div className="text-xs sm:text-sm text-[#8398AD]">
                <p>
                  By connecting your wallet, you agree to our Terms of Service
                  and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
