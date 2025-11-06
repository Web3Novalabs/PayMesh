"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";
import { useState } from "react";
import bravoos from "../../../public/braavos_icon.jpeg (1).svg";
import argent from "../../../public/Argent (1).svg";
import Image from "next/image";
import Dot from "@/components/icons/dot-icon";
import {
  formatAddress,
  getNetworkColor,
  getNetworkName,
  gradientStops,
} from "@/utils/helpers";

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
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
              mainnet.id.toString(),
              sepolia.id.toString(),
              String(chain?.id)
            )}`}
          >
            {getNetworkName(
              mainnet.id.toString(),
              sepolia.id.toString(),
              String(chain?.id)
            )}
          </span>
        </div>
        <button
          onClick={() => setShowDisconnectModal(true)}
          className="relative px-8 py-3 text-white font-mono text-lg rounded-full overflow-hidden flex items-center"
          style={{
            background: "#000000",
            backgroundImage: `linear-gradient(#000000, #000000), linear-gradient(135deg, ${gradientStops})`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            border: "2px solid transparent",
          }}
        >
          {formatAddress(address ?? "")}

          <Dot />
        </button>

        {/* Disconnect Confirmation Modal */}
        {showDisconnectModal && (
          <div
            onClick={() => setShowDisconnectModal(false)}
            className="fixed inset-0 bg-[#0E121A]/75 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
          >
            <div className="bg-[#0E121A] border-gradient-modal rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto relative mx-2">
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
        className="bg-[#4950B1] uppercase rounded-full px-6 py-2 cursor-pointer"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>

      {showConnectModal && (
        <div
          onClick={() => setShowConnectModal(false)}
          className="fixed inset-0 bg-[#0E121A]/75  flex items-center justify-center z-50 p-2 sm:p-4"
        >
          <div className="bg-[#0E121A] rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto relative mx-2 p-3 py-6 grid gap-5 border border-[#232542]">
            <h1 className="font-anton text-2xl">Connect wallet</h1>
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
                    className={`w-full flex items-center justify-between p-[2px] ${
                      connector.id === "braavos"
                        ? "bg-gradient-to-r from-[#04224C] to-[#09479E]"
                        : "from-[#CBA395] to-[#C96A48]"
                    }  text-[#E2E2E2] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div
                      className={`flex justify-between items-center gap-3 ${
                        connector.id === "braavos"
                          ? "from-[#0B4FB0] to-[#05214A]"
                          : "from-[#FF875B] to-[#995137]"
                      } bg-gradient-to-tr w-full rounded-lg p-6`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
                        {connector.id === "braavos" ? (
                          <Image
                            className="h-[90px]"
                            src={bravoos}
                            alt="bravoos wallet"
                          />
                        ) : // <div
                        //   className={`bg-no-repeat bg-fixed bg h-full bg-cover xl:px-20 px-10 max-w-sit-screen mx-auto py-7 antialiased font-dmsans`}
                        //   style={{
                        //     backgroundImage: `url(${bravoos})`,
                        //   }}
                        // ></div>
                        connector.id === "argentX" ? (
                          <Image width={599} src={argent} alt="argent wallet" />
                        ) : (
                          `${connector.id}`
                        )}
                      </div>
                      <span className="text-sm sm:text-base font-medium font-anton uppercase">
                        {connector.id === "braavos"
                          ? "BRaavos wallet"
                          : connector.id === "argentX"
                          ? "Ready Wallet (Formally Argent)"
                          : connector.id}
                      </span>
                      <button
                        className={`font-dmsans w-fit rounded-full py-3 px-6 border ${
                          connector.id === "braavos"
                            ? "border-[#08469D]"
                            : "border-[#C99B8B]"
                        } `}
                      >
                        Use
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
