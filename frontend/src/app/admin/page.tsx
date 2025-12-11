"use client";

import { useMemo, useState } from "react";
import { CROWDFUNDINGADDRESS } from "@/hooks/blockchainWriteFunction";
import { PAYMESH_ADDRESS } from "@/utils/contract";
import {
  useAdminStats,
  useCrowdFundReadValues,
  useGroupReadValues,
  useContractTokenBalances,
} from "@/hooks/useAdminData";
import {
  TrendingUp,
  Users,
  Handshake,
  DollarSign,
  Settings,
  Eye,
  Zap,
  Shield,
  Coins,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import gearIcon from "../../../public/Gear.svg";

// Components
import StatCard from "./components/StatCard";
import ReadValueCard from "./components/ReadValueCard";
import ContractInfoCard from "./components/ContractInfoCard";
import PoolBalanceChecker from "./components/PoolBalanceChecker";
import AdminActionsSection from "./components/AdminActionsSection";

type ActionConfig = {
  key: string;
  title: string;
  description: string;
  placeholder: string;
  type?: "text" | "number";
  section: "fundraising" | "group";
  icon?: React.ReactNode;
};

export default function AdminPage() {
  const stats = useAdminStats();
  const groupValues = useGroupReadValues();

  // For global contract values (when poolAddress is empty)
  const globalCrowdFundValues = useCrowdFundReadValues("");

  // Fetch token balances for both contracts
  const crowdfundBalances = useContractTokenBalances(CROWDFUNDINGADDRESS);
  const paymeshBalances = useContractTokenBalances(PAYMESH_ADDRESS);

  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const actionConfigs: ActionConfig[] = useMemo(
    () => [
      {
        key: "upgrade",
        title: "Upgrade Contract",
        description: "Deploy a new implementation class hash",
        placeholder: "0x... class hash",
        section: "fundraising",
        icon: <Zap className="w-5 h-5" />,
      },
      {
        key: "set_platform_percentage",
        title: "Set Platform Percentage",
        description: "Update platform fee percentage",
        placeholder: "Enter percentage (e.g. 2.5)",
        type: "number",
        section: "fundraising",
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        key: "set_supported_token",
        title: "Add Supported Token",
        description: "Whitelist a new token for donations",
        placeholder: "0x... token address",
        section: "fundraising",
        icon: <Coins className="w-5 h-5" />,
      },
      {
        key: "upgrade_child",
        title: "Upgrade Child Contract",
        description: "Update child pool implementation",
        placeholder: "0x... child class hash",
        section: "fundraising",
        icon: <Zap className="w-5 h-5" />,
      },
      {
        key: "set_donation_token",
        title: "Set Donation Token",
        description: "Set default donation token address",
        placeholder: "0x... token address",
        section: "fundraising",
        icon: <Wallet className="w-5 h-5" />,
      },
      {
        key: "set_platform_fee_token",
        title: "Set Platform Fee Token",
        description: "Configure platform fee token",
        placeholder: "0x... token address",
        section: "fundraising",
        icon: <DollarSign className="w-5 h-5" />,
      },
      {
        key: "set_group_usage_fee",
        title: "Set Group Usage Fee",
        description: "Update fee per group distribution",
        placeholder: "Enter fee amount",
        type: "number",
        section: "group",
        icon: <DollarSign className="w-5 h-5" />,
      },
      {
        key: "set_group_update_fee",
        title: "Set Group Update Fee",
        description: "Fee for group parameter updates",
        placeholder: "Enter fee amount",
        type: "number",
        section: "group",
        icon: <Settings className="w-5 h-5" />,
      },
      {
        key: "set_group_supported_token",
        title: "Add Group Supported Token",
        description: "Whitelist token for group settlements",
        placeholder: "0x... token address",
        section: "group",
        icon: <Coins className="w-5 h-5" />,
      },
      {
        key: "group_upgrade",
        title: "Upgrade Group Contract",
        description: "Deploy new group implementation",
        placeholder: "0x... class hash",
        section: "group",
        icon: <Zap className="w-5 h-5" />,
      },
      {
        key: "group_upgrade_child",
        title: "Upgrade Group Child",
        description: "Update child group implementation",
        placeholder: "0x... child class hash",
        section: "group",
        icon: <Zap className="w-5 h-5" />,
      },
    ],
    []
  );

  const handleExecute = (actionKey: string, value: string) => {
    if (!value) {
      setActionStatus((prev) => ({
        ...prev,
        [actionKey]: "Please enter a value",
      }));
      return;
    }

    // TODO: Wire to actual contract calls
    setActionStatus((prev) => ({
      ...prev,
      [actionKey]: `Transaction queued for ${actionKey} with value: ${value}`,
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(key);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const fundraisingActions = actionConfigs.filter(
    (a) => a.section === "fundraising"
  );
  const groupActions = actionConfigs.filter((a) => a.section === "group");

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#03040769] via-[#0a0e156a] to-[#0304075b] rounded-lg px-4 sm:px-8 md:px-14 lg:px-20 pb-16 pt-28">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#4950B1] to-[#5961ce] p-3">
            <Image src={gearIcon} alt="Admin" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#9BB4EE]">
              Platform Administration
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#DFDFE0] to-[#8398AD] bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
        </div>
        <p className="max-w-3xl text-[#8398AD]">
          Manage platform parameters, monitor statistics, and execute admin
          functions.
        </p>
      </div>

      {/* Pool Balance Checker */}
      <PoolBalanceChecker />

      {/* Statistics Cards */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#4950B1]" />
          Platform Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6 text-[#DFDFE0]" />}
            gradient="from-[#4950B1]/20 to-[#5961ce]/10"
            subtitle="From all fundraisers"
          />
          <StatCard
            title="Total Pools for FundRaising"
            value={stats.totalPools}
            icon={<Handshake className="w-6 h-6 text-[#DFDFE0]" />}
            gradient="from-[#9BB4EE]/20 to-[#7a9dee]/10"
            subtitle={`${stats.activePools} active, ${stats.completedPools} completed`}
          />
          <StatCard
            title="Total Groups for groups"
            value={stats.totalGroups}
            icon={<Users className="w-6 h-6 text-[#DFDFE0]" />}
            gradient="from-[#4950B1]/20 to-[#5961ce]/10"
          />
          <StatCard
            title="Total Donors"
            value={stats.totalDonors}
            icon={<Users className="w-6 h-6 text-[#DFDFE0]" />}
            gradient="from-[#9BB4EE]/20 to-[#7a9dee]/10"
          />
        </div>
      </section>

      {/* Contract Information */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#4950B1]" />
          Contract Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContractInfoCard
            title="Crowdfunding Contract"
            address={CROWDFUNDINGADDRESS}
            usdcBalance={crowdfundBalances.usdcBalance}
            strkBalance={crowdfundBalances.strkBalance}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
            copyKey="crowdfund"
          />
          <ContractInfoCard
            title="Paymesh Contract (Group)"
            address={PAYMESH_ADDRESS}
            usdcBalance={paymeshBalances.usdcBalance}
            strkBalance={paymeshBalances.strkBalance}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
            copyKey="paymesh"
          />
        </div>
      </section>

      {/* Crowdfunding Current Values */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#4950B1]" />
          Crowdfunding Contract Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReadValueCard
            title="Platform Percentage"
            value={
              globalCrowdFundValues.platformPercentage !== null
                ? `${globalCrowdFundValues.platformPercentage}%`
                : null
            }
            description="Current platform fee"
            icon={<TrendingUp className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
          <ReadValueCard
            title="Donation Token"
            value={globalCrowdFundValues.donationToken}
            description="Default donation token"
            icon={<Wallet className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
          <ReadValueCard
            title="Pool Creation Fee"
            value={
              globalCrowdFundValues.poolCreationFee !== null
                ? `${globalCrowdFundValues.poolCreationFee} STRK`
                : null
            }
            description="Fee to create new pool"
            icon={<Coins className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
          <ReadValueCard
            title="Supported Tokens"
            value={
              globalCrowdFundValues.supportedTokens
                ? `${globalCrowdFundValues.supportedTokens.length} tokens`
                : null
            }
            description="Whitelisted donation tokens"
            icon={<Coins className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
          <ReadValueCard
            title="Contract Owner"
            value={globalCrowdFundValues.owner}
            description="Admin address"
            icon={<Shield className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
        </div>
      </section>

      {/* Group Current Values */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-[#DFDFE0] flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#4950B1]" />
          Group Contract Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReadValueCard
            title="Group Usage Fee"
            value={
              groupValues.groupUsageFee !== null
                ? `${groupValues.groupUsageFee} STRK`
                : null
            }
            description="Fee per group distribution"
            icon={<DollarSign className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
          <ReadValueCard
            title="Group Update Fee"
            value={
              groupValues.groupUpdateFee !== null
                ? `${groupValues.groupUpdateFee} STRK`
                : null
            }
            description="Fee for group updates"
            icon={<Settings className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
          <ReadValueCard
            title="Supported Tokens"
            value={
              groupValues.supportedTokens
                ? `${groupValues.supportedTokens.length} tokens`
                : null
            }
            description="Whitelisted settlement tokens"
            icon={<Coins className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
          <ReadValueCard
            title="Contract Owner"
            value={groupValues.owner}
            description="Admin address"
            icon={<Shield className="w-4 h-4" />}
            onCopy={copyToClipboard}
            copiedAddress={copiedAddress}
          />
        </div>
      </section>

      {/* Admin Actions - Fundraising */}
      <AdminActionsSection
        title="Crowdfunding Admin Actions"
        actions={fundraisingActions}
        onExecute={handleExecute}
        actionStatuses={actionStatus}
        icon={<Settings className="w-5 h-5 text-[#4950B1]" />}
      />

      {/* Admin Actions - Groups */}
      <AdminActionsSection
        title="Group Admin Actions"
        actions={groupActions}
        onExecute={handleExecute}
        actionStatuses={actionStatus}
        icon={<Settings className="w-5 h-5 text-[#4950B1]" />}
      />
    </main>
  );
}
