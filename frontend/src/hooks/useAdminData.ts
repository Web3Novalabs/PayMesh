import { useEffect, useState } from "react";
import { useContractFetch } from "./useContractInteraction";
import { POOL_ABI } from "@/abi/pool_abi";
import { PAYMESH_ABI } from "@/abi/swiftswap_abi";
import { STRK_ABI } from "@/abi/strk_abi";
import { CROWDFUNDINGADDRESS } from "./blockchainWriteFunction";
import {
  PAYMESH_ADDRESS,
  ONE_STK,
  ONE_USDC,
  normalizeAddress,
  strkTokenAddress,
} from "@/utils/contract";
import { useGetAllPools } from "./useContractInteraction";
import { useGetAllGroups } from "./useContractInteraction";

// USDC token address
const USDC_TOKEN_ADDRESS =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

export function useAdminStats() {
  const { createdPool: pools } = useGetAllPools();
  const groups = useGetAllGroups();

  const [stats, setStats] = useState({
    totalPools: 0,
    totalGroups: 0,
    totalEarnings: 0,
    totalDonors: 0,
    activePools: 0,
    completedPools: 0,
    totalPlatformFees: 0,
  });

  useEffect(() => {
    if (!pools) return;

    const totalPools = pools.length;
    const activePools = pools.filter((p) => !p.is_completed).length;
    const completedPools = pools.filter((p) => p.is_completed).length;
    const totalDonors = pools.reduce((sum, p) => sum + p.donors, 0);

    // Calculate total earnings (sum of all balances in USDC)
    const totalEarnings = pools.reduce((sum, p) => {
      return sum + Number.parseFloat(p.balance.toString()) / 1e18;
    }, 0);

    // Calculate platform fees (assuming platform percentage is applied)
    // This is an estimate - actual fees would need to be tracked separately
    const totalPlatformFees = totalEarnings * 0.025; // Assuming 2.5% platform fee

    setStats({
      totalPools,
      totalGroups: groups?.length || 0,
      totalEarnings,
      totalDonors,
      activePools,
      completedPools,
      totalPlatformFees,
    });
  }, [pools, groups]);

  return stats;
}

export function useCrowdFundReadValues(poolAddress: string) {
  const { readData: platformPercentage } = useContractFetch(
    POOL_ABI,
    "get_platform_percentage",
    [],
    CROWDFUNDINGADDRESS
  );

  const { readData: supportedTokens } = useContractFetch(
    POOL_ABI,
    "get_supported_token",
    [],
    CROWDFUNDINGADDRESS
  );

  const { readData: donationToken } = useContractFetch(
    POOL_ABI,
    "get_donation_token",
    [],
    CROWDFUNDINGADDRESS
  );

  console.log("platformPercentage---- ", platformPercentage);
  console.log("donationToken---- ", donationToken);
  console.log("supportedTokens---- ", supportedTokens);

  const { readData: poolCreationFee } = useContractFetch(
    POOL_ABI,
    "get_pool_creation_fee",
    [],
    CROWDFUNDINGADDRESS
  );

  const { readData: poolBalance } = useContractFetch(
    POOL_ABI,
    "get_pool_balance",
    [poolAddress],
    CROWDFUNDINGADDRESS
  );

  const { readData: owner } = useContractFetch(
    POOL_ABI,
    "owner",
    [],
    CROWDFUNDINGADDRESS
  );

  return {
    platformPercentage: platformPercentage
      ? Number(platformPercentage.toString())
      : null,
    supportedTokens: supportedTokens as string[] | null,
    donationToken: donationToken
      ? "0x" + normalizeAddress(donationToken.toString(16))
      : null,
    poolCreationFee: poolCreationFee
      ? Number(poolCreationFee.toString()) / ONE_STK
      : null,
    owner: owner ? "0x" + normalizeAddress(owner.toString(16)) : null,
    poolBalance: poolBalance ? Number(poolBalance.toString()) / ONE_USDC : null,
  };
}

export function useGroupReadValues() {
  const { readData: groupUsageFee } = useContractFetch(
    PAYMESH_ABI,
    "get_group_usage_fee",
    [],
    PAYMESH_ADDRESS
  );

  const { readData: groupUpdateFee } = useContractFetch(
    PAYMESH_ABI,
    "get_group_update_fee",
    [],
    PAYMESH_ADDRESS
  );

  const { readData: supportedTokens } = useContractFetch(
    PAYMESH_ABI,
    "get_supported_token",
    [],
    PAYMESH_ADDRESS
  );

  const { readData: owner } = useContractFetch(
    PAYMESH_ABI,
    "owner",
    [],
    PAYMESH_ADDRESS
  );

  return {
    groupUsageFee: groupUsageFee
      ? Number(groupUsageFee.toString()) / ONE_STK
      : null,
    groupUpdateFee: groupUpdateFee
      ? Number(groupUpdateFee.toString()) / ONE_STK
      : null,
    supportedTokens: supportedTokens as string[] | null,
    owner: owner ? "0x" + normalizeAddress(owner.toString(16)) : null,
  };
}

export function useContractTokenBalances(contractAddress: string) {
  const isValidAddress =
    contractAddress &&
    contractAddress.startsWith("0x") &&
    contractAddress.length > 10;

  // Fetch USDC balance - using STRK_ABI since both are ERC20 tokens with same interface
  const { readData: usdcBalance } = useContractFetch(
    STRK_ABI,
    "balance_of",
    isValidAddress ? [contractAddress] : [],
    USDC_TOKEN_ADDRESS
  );

  // Fetch STRK balance
  const { readData: strkBalance } = useContractFetch(
    STRK_ABI,
    "balance_of",
    isValidAddress ? [contractAddress] : [],
    strkTokenAddress
  );

  return {
    usdcBalance:
      usdcBalance && isValidAddress
        ? Number(usdcBalance.toString()) / ONE_USDC
        : null,
    strkBalance:
      strkBalance && isValidAddress
        ? Number(strkBalance.toString()) / ONE_STK
        : null,
  };
}
