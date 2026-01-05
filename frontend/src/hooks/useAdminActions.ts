"use client";

import { useAccount } from "@starknet-react/core";
import { CallData, cairo } from "starknet";
import toast from "react-hot-toast";
import { CROWDFUNDINGADDRESS } from "./blockchainWriteFunction";
import { PAYMESH_ADDRESS, myProvider } from "@/utils/contract";

const toUint256 = (num: string) => cairo.uint256(Number(num));

export function useFundraisingActions() {
  const { account } = useAccount();

  const upgrade = async (classHash: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = classHash.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: CROWDFUNDINGADDRESS,
        entrypoint: "upgrade",
        calldata: CallData.compile([trimmed]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Upgrade Successful");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing upgrade:", error);
      toast.error("Upgrade Failed");
      throw error;
    }
  };

  const setPlatformPercentage = async (percentage: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = percentage.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: CROWDFUNDINGADDRESS,
        entrypoint: "set_platform_percentage",
        calldata: CallData.compile([toUint256(trimmed)]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Platform Percentage Set Successfully");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing set_platform_percentage:", error);
      toast.error("Failed to Set Platform Percentage");
      throw error;
    }
  };

  const setSupportedToken = async (tokenAddress: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = tokenAddress.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: CROWDFUNDINGADDRESS,
        entrypoint: "set_supported_token",
        calldata: CallData.compile([trimmed]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Supported Token Added");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing set_supported_token:", error);
      toast.error("Failed to Add Supported Token");
      throw error;
    }
  };

  const upgradeChild = async (childClassHash: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = childClassHash.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: CROWDFUNDINGADDRESS,
        entrypoint: "upgrade_child",
        calldata: CallData.compile([trimmed]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Child Upgrade Successful");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing upgrade_child:", error);
      toast.error("Child Upgrade Failed");
      throw error;
    }
  };

  const setDonationToken = async (tokenAddress: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = tokenAddress.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: CROWDFUNDINGADDRESS,
        entrypoint: "set_donation_token",
        calldata: CallData.compile([trimmed]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Donation Token Set Successfully");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing set_donation_token:", error);
      toast.error("Failed to Set Donation Token");
      throw error;
    }
  };

  const setPlatformFeeToken = async (_value: string) => {
    throw new Error("set_platform_fee_token not supported by contract ABI");
  };

  return {
    upgrade,
    setPlatformPercentage,
    setSupportedToken,
    upgradeChild,
    setDonationToken,
    setPlatformFeeToken,
  };
}

export function useGroupAdminActions() {
  const { account } = useAccount();

  const setGroupUsageFee = async (fee: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = fee.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: PAYMESH_ADDRESS,
        entrypoint: "set_group_usage_fee",
        calldata: CallData.compile([toUint256(trimmed)]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Group Usage Fee Set Successfully");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing set_group_usage_fee:", error);
      toast.error("Failed to Set Group Usage Fee");
      throw error;
    }
  };

  const setGroupUpdateFee = async (fee: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = fee.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: PAYMESH_ADDRESS,
        entrypoint: "set_group_update_fee",
        calldata: CallData.compile([toUint256(trimmed)]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Group Update Fee Set Successfully");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing set_group_update_fee:", error);
      toast.error("Failed to Set Group Update Fee");
      throw error;
    }
  };

  const setGroupSupportedToken = async (tokenAddress: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = tokenAddress.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: PAYMESH_ADDRESS,
        entrypoint: "set_supported_token",
        calldata: CallData.compile([trimmed]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Group Supported Token Added");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing set_supported_token:", error);
      toast.error("Failed to Add Group Supported Token");
      throw error;
    }
  };

  const groupUpgrade = async (classHash: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = classHash.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: PAYMESH_ADDRESS,
        entrypoint: "upgrade",
        calldata: CallData.compile([trimmed]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Group Upgrade Successful");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing upgrade:", error);
      toast.error("Group Upgrade Failed");
      throw error;
    }
  };

  const groupUpgradeChild = async (childClassHash: string) => {
    if (!account) {
      toast.error("Connect wallet to run admin actions");
      throw new Error("No account connected");
    }
    const trimmed = childClassHash.trim();
    if (!trimmed) throw new Error("Value is required");

    const calls = [
      {
        contractAddress: PAYMESH_ADDRESS,
        entrypoint: "upgrade_child",
        calldata: CallData.compile([trimmed]),
      },
    ];

    try {
      const tx = await account.execute(calls);
      await myProvider.waitForTransaction(tx.transaction_hash);
      toast.success("Group Child Upgrade Successful");
      return tx.transaction_hash;
    } catch (error) {
      console.error("Error executing upgrade_child:", error);
      toast.error("Group Child Upgrade Failed");
      throw error;
    }
  };

  return {
    setGroupUsageFee,
    setGroupUpdateFee,
    setGroupSupportedToken,
    groupUpgrade,
    groupUpgradeChild,
  };
}
