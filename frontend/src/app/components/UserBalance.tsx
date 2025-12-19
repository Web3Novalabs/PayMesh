"use client";

import { useAccount, useBalance } from "@starknet-react/core";
import { useState } from "react";
import Loading from "./Loading";

type Currency = "ETH" | "USD" | "STRK";

export default function UserBalance() {
  const { address } = useAccount();
  const {
    data: balance,
    isLoading,
    error,
  } = useBalance({
    token: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  });
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ETH");

  // Mock exchange rates (in real app, fetch from API)
  const exchangeRates = {
    ETH: 1,
    USD: 2500, // 1 ETH = $2500
    STRK: 0.8, // 1 ETH = 0.8 STRK
  };

  const formatBalance = (amount: bigint | undefined, decimals: number = 18) => {
    if (!amount) return "0.00";
    const divisor = BigInt(10 ** decimals);
    const whole = amount / divisor;
    const fraction = amount % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 4);
    return `${whole}.${fractionStr}`;
  };

  const convertBalance = (balance: bigint | undefined, currency: Currency) => {
    if (!balance) return "0.00";
    const ethBalance = parseFloat(formatBalance(balance));

    switch (currency) {
      case "ETH":
        return ethBalance.toFixed(4);
      case "USD":
        return (ethBalance * exchangeRates.USD).toFixed(2);
      case "STRK":
        return (ethBalance * exchangeRates.STRK).toFixed(4);
      default:
        return ethBalance.toFixed(4);
    }
  };

  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case "ETH":
        return "Ξ";
      case "USD":
        return "$";
      case "STRK":
        return "STRK";
      default:
        return "";
    }
  };

  if (!address) {
    return null;
  }

  if (!balance) {
    // For testing, show a mock balance
    const mockBalance = BigInt("1000000000000000000"); // 1 ETH in wei

    return (
      <div className="bg-white mt-20 rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Wallet Balance</h3>
          <div className="flex space-x-1">
            {(["ETH", "USD", "STRK"] as Currency[]).map((currency) => (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedCurrency === currency
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {getCurrencySymbol(selectedCurrency)}
            {convertBalance(mockBalance, selectedCurrency)}
          </span>
          <span className="text-sm text-gray-500">{selectedCurrency}</span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>ETH: {convertBalance(mockBalance, "ETH")} Ξ</span>
            <span>USD: ${convertBalance(mockBalance, "USD")}</span>
            <span>STRK: {convertBalance(mockBalance, "STRK")}</span>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-500 mt-2">
            <Loading fullScreen={false} size={20} color="#3b82f6" />
            Loading real balance...
          </div>
        )}
        {error && (
          <div className="text-xs text-red-500 mt-2">
            Error: {error.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white mt-10 rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Wallet Balance</h3>
        <div className="flex space-x-1">
          {(["ETH", "USD", "STRK"] as Currency[]).map((currency) => (
            <button
              key={currency}
              onClick={() => setSelectedCurrency(currency)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedCurrency === currency
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900">
          {getCurrencySymbol(selectedCurrency)}
          {convertBalance(balance.value, selectedCurrency)}
        </span>
        <span className="text-sm text-gray-500">{selectedCurrency}</span>
      </div>

      {/* Additional balance info */}
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>ETH: {convertBalance(balance.value, "ETH")} Ξ</span>
          <span>USD: ${convertBalance(balance.value, "USD")}</span>
          <span>STRK: {convertBalance(balance.value, "STRK")}</span>
        </div>
      </div>
    </div>
  );
}
