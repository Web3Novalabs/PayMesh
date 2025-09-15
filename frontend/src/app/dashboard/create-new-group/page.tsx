"use client";

import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useAccount,
  // useBalance,
  useTransactionReceipt,
} from "@starknet-react/core";
import {
  byteArray,
  cairo,
  CallData,
  Contract,
  PaymasterDetails,
} from "starknet";
import {
  myProvider,
  ONE_STK,
  PAYMESH_ADDRESS,
  strkTokenAddress,
} from "@/utils/contract";
import React from "react";
import group1icon from "../../../../public/PlusCircle.svg";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import group4icon from "../../../../public/UsersFour.svg";
import QRcode from "../components/QRcode";
import Loading from "../components/Loading";
import { Trash2 } from "lucide-react";
import { useContractFetch } from "@/hooks/useContractInteraction";
import { PAYMESH_ABI } from "@/abi/swiftswap_abi";
import WalletConnect from "@/app/components/WalletConnect";
import { useGetBalance } from "@/utils/contract";

interface GroupMember {
  addr: string;
  percentage: number;
}

interface CreateGroupFormData {
  name: string;
  usage: string;
  tokenAddress: string;
  members: GroupMember[];
}

const CreateNewGroup = () => {
  const { account } = useAccount();

  // const { createGroup, isCreatingGroup } = useContractInteraction();

  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: "",
    usage: "",
    tokenAddress:
      "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    members: [
      {
        addr: "",
        percentage: 0,
      },
      {
        addr: "",
        percentage: 0,
      },
    ],
  });

  const totalPercentage = formData.members.reduce(
    (sum, member) =>
      sum + (typeof member.percentage === "number" ? member.percentage : 0),
    0
  );

  // const [errors, setErrors] = useState<Record<string, string>>({});
  const [groupAddress, setGroupAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [groupBalance, setGroupBalance] = useState<string>("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [creationFee, setCreationFee] = useState<null | number>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [resultHash, setResultHash] = useState("");
  const [hasProcessedTransaction, setHasProcessedTransaction] = useState(false);
  const { address } = useAccount();
  const balance = useGetBalance(address || "0x0");

  const { data, error } = useTransactionReceipt({
    hash: resultHash,
  });

  useEffect(() => {
    let m;
    if (!data || hasProcessedTransaction) return;
    if (
      data.value &&
      typeof data.value === "object" &&
      "events" in data.value &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Array.isArray((data.value as any).events)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      m = (data.value as any).events[3]?.data[0];
      m = m.replace("0x", "0x0");
      setGroupAddress(m);
      setIsSuccess(true);
      setHasProcessedTransaction(true);
      toast.success("Group created successfully! 🎉");
      // Fetch balance when group address is set
      fetchGroupBalance(m);
    } else {
      m = undefined;
    }
  }, [data, error, hasProcessedTransaction]);

  const { readData: usageFee } = useContractFetch(
    PAYMESH_ABI,
    "get_group_usage_fee",
    [""]
  );

  useEffect(() => {
    if (!usageFee) return;

    const fee = BigInt(usageFee);
    setCreationFee(Number(fee) / ONE_STK);
  }, [usageFee]);

  // Reset success state when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      setIsSuccess(false);
      setGroupAddress("");
      setGroupBalance("0");
      setHasProcessedTransaction(false);
      setResultHash("");
    };
  }, []);

  // Handle page loading state
  useEffect(() => {
    // Simulate page initialization loading
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const removeMember = (index: number) => {
    if (formData.members.length <= 2) return;

    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const fetchGroupBalance = async (groupAddr: string) => {
    if (!groupAddr) return;

    setIsLoadingBalance(true);
    try {
      // STRK token address on Sepolia

      // Create a contract instance for the STRK token
      const strkContract = new Contract(
        [
          {
            name: "balanceOf",
            type: "function",
            inputs: [{ name: "account", type: "felt" }],
            outputs: [{ name: "balance", type: "Uint256" }],
            state_mutability: "view",
          },
        ],
        strkTokenAddress,
        myProvider
      );

      // Call balanceOf function
      const result = await strkContract.balanceOf(groupAddr);

      const balanceValue = result.balance;

      const balanceInStrk =
        parseFloat(balanceValue.toString()) / Math.pow(10, 18);
      setGroupBalance(balanceInStrk.toFixed(4));
    } catch (error) {
      console.error("Error fetching group balance:", error);
      setGroupBalance("Error");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Check for duplicate addresses
  const checkDuplicateAddresses = () => {
    const addresses = formData.members
      .map((member) => member.addr.trim().toLowerCase())
      .filter((addr) => addr !== ""); // Only check non-empty addresses

    const uniqueAddresses = new Set(addresses);

    if (addresses.length !== uniqueAddresses.size) {
      return true; // Has duplicates
    }
    return false; // No duplicates
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate addresses
    if (checkDuplicateAddresses()) {
      toast.error(
        "Duplicate addresses detected! Please ensure each member has a unique address."
      );
      return;
    }

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (totalPercentage !== 100) {
      toast.error("Total percentage must be exactly 100%");
      return;
    }

    if (!account) {
      toast.error("No account connected");
      return;
    }

    if (!isCheckboxChecked) {
      toast.error("Please accept the terms by checking the checkbox");
      return;
    }

    if (!formData.usage) {
      toast.error("Please select a usage");
      return;
    }
    if (balance?.formatted && Number(balance.formatted) < +formData.usage) {
      toast.error(`Insufficient balance, Top Up!`);
      return;
    }

    setIsSubmitting(true);

    try {
      // const amount = parseFloat(formData.amount);

      if (account != undefined && formData.usage) {
        const swiftpayCall = {
          contractAddress: PAYMESH_ADDRESS,
          entrypoint: "create_group",
          calldata: CallData.compile({
            name: byteArray.byteArrayFromString(formData.name),
            members: formData.members,
            usage_count: cairo.uint256(+formData?.usage),
          }),
        };
        const approveCall = {
          contractAddress: strkTokenAddress,
          entrypoint: "approve",
          calldata: [
            PAYMESH_ADDRESS, // spender
            cairo.uint256(+formData?.usage * ONE_STK),
            // "1000000000000000000",
            // "0"
          ],
        };

        const multicallData = [approveCall, swiftpayCall];
        // const result = await account.execute(multicallData)

        const feeDetails: PaymasterDetails = {
          feeMode: {
            mode: "sponsored",
          },
        };

        const feeEstimation = await account?.estimatePaymasterTransactionFee(
          [...multicallData],
          feeDetails
        );

        const result = await account?.executePaymasterTransaction(
          [...multicallData],
          feeDetails,
          feeEstimation?.suggested_max_fee_in_gas_token
        );

        const status = await myProvider.waitForTransaction(
          result?.transaction_hash as string
        );

        console.log(result);
        setResultHash(result.transaction_hash);
        console.log(status);
      }

      // Reset form
      setFormData({
        name: "",
        usage: "",
        tokenAddress: "",
        members: [
          { addr: "", percentage: 0 },
          { addr: "", percentage: 0 },
        ],
      });
      setIsCheckboxChecked(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new member
  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, { addr: "", percentage: 0 }],
    }));
  };

  // Update member
  const updateMember = (
    index: number,
    field: keyof GroupMember,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member, i) => {
        if (i === index) {
          if (field === "percentage") {
            // Ensure percentage is a number and doesn't exceed 100
            const numValue =
              typeof value === "string" ? parseInt(value) || 0 : value;
            const clampedValue = Math.min(Math.max(numValue, 0), 100);
            return { ...member, percentage: clampedValue };
          }
          if (field === "addr") {
            // Ensure addr is always a string
            return { ...member, addr: String(value) };
          }
          return { ...member, [field]: value };
        }
        return member;
      }),
    }));
  };

  // Auto-distribute percentages evenly
  const distributeEvenly = () => {
    const memberCount = formData.members.length;
    const percentagePerMember = Math.floor(100 / memberCount);
    const remainder = 100 % memberCount;

    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member, index) => ({
        ...member,
        percentage: percentagePerMember + (index < remainder ? 1 : 0),
      })),
    }));
  };

  // Copy address to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(groupAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // Reset form and success state
  const resetForm = () => {
    setIsSuccess(false);
    setGroupAddress("");
    setGroupBalance("0");
    setIsSubmitting(false);
    setCopySuccess(false);
    setIsLoadingBalance(false);
    setIsCheckboxChecked(false);
    setHasProcessedTransaction(false);
    setResultHash("");
    setFormData({
      name: "",
      usage: "",
      tokenAddress:
        "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      members: [
        {
          addr: "",
          percentage: 0,
        },
        {
          addr: "",
          percentage: 0,
        },
      ],
    });
  };

  // Force close modal and reset everything
  const forceCloseModal = () => {
    setIsSuccess(false);
    setGroupAddress("");
    setGroupBalance("0");
    setIsSubmitting(false);
    setCopySuccess(false);
    setIsLoadingBalance(false);
    setIsCheckboxChecked(false);
    setHasProcessedTransaction(false);
    setResultHash("");
  };
  const fee = creationFee
    ? Number(creationFee * Number(formData.usage)).toFixed(2)
    : "";
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
    <div className="px-0 sm:px-4 md:px-0">
      <div className="space-y-2 border-b border-[#FFFFFF0D] pb-8">
        <h1 className="text-[#DFDFE0] text-lg sm:text-xl font-semibold">
          Create new group
        </h1>
        <p className="text-[#8398AD] text-sm sm:text-base">
          Create and manage your groups
        </p>
      </div>

      <div className="mt-8 sm:mt-10">
        <h2 className="text-[#E2E2E2] text-base sm:text-lg pb-3 sm:pb-5 font-semibold">
          Group Details
        </h2>
        <p className="text-[#E2E2E2] text-sm sm:text-base">Group Name</p>
        <Input
          placeholder="Enter Group Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="mt-2 py-4 sm:py-6 px-3 sm:px-4 rounded-sm bg-[#FFFFFF0D] border border-[#FFFFFF0D] text-[#8398AD] !text-sm sm:!text-base"
        />
      </div>

      {/* <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full">
        <div className="w-full sm:w-1/2">
          <h2 className="text-[#E2E2E2] text-base sm:text-lg pb-3 sm:pb-5 font-semibold">
            Expected token
          </h2>

          <Select>
            <SelectTrigger className="w-full bg-[#FFFFFF0D] border py-4 sm:py-6 px-3 sm:px-4 rounded-sm border-[#FFFFFF0D] text-[#8398AD] !text-sm sm:!text-base">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D] w-full">
              <SelectGroup>
                <SelectLabel className="text-[#E2E2E2]">Tokens</SelectLabel>
                <SelectItem
                  value="strk"
                  className="text-[#8398AD] hover:bg-[#374151]"
                >
                  STRK
                </SelectItem>
                <SelectItem
                  value="eth"
                  className="text-[#8398AD] hover:bg-[#374151]"
                >
                  ETH
                </SelectItem>
                <SelectItem
                  value="usdc"
                  className="text-[#8398AD] hover:bg-[#374151]"
                >
                  USDC
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/2">
          <h2 className="text-[#E2E2E2] text-base sm:text-lg pb-3 sm:pb-5 font-semibold">
            Percentage Type
          </h2>

          <Select>
            <SelectTrigger className="w-full bg-[#FFFFFF0D] border py-4 sm:py-6 px-3 sm:px-4 rounded-sm border-[#FFFFFF0D] text-[#8398AD] !text-sm sm:!text-base">
              <SelectValue placeholder="Select percentage type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1F2937] border border-[#FFFFFF0D] w-full">
              <SelectItem
                value="percentage"
                className="text-[#8398AD] hover:bg-[#374151]"
              >
                Percentage
              </SelectItem>
              <SelectItem
                value="fixed"
                className="text-[#8398AD] hover:bg-[#374151]"
              >
                Fixed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}

      <div className="mt-8 sm:mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#E2E2E2] text-base sm:text-lg font-semibold">
            Members configuration
          </h2>
          <button
            onClick={distributeEvenly}
            className=" py-2 px-4 w-fit border-gradient rounded-sm bg-[#FFFFFF0D] text-[#E2E2E2] flex items-center justify-center gap-2 hover:bg-opacity-10 transition-colors cursor-pointer"
          >
            Distribute
          </button>
        </div>

        {formData.members.map((member, index) => (
          <div
            key={index}
            className="w-full flex flex-col sm:flex-row items-center mb-7 justify-center gap-4 sm:gap-6"
          >
            <div className="w-full sm:w-[75%]">
              <p className="text-[#E2E2E2] text-sm sm:text-base">
                Wallet address
              </p>
              <Input
                placeholder="Enter wallet address"
                value={member.addr}
                onChange={(e) => updateMember(index, "addr", e.target.value)}
                className="mt-2 py-4 sm:py-6 px-3 sm:px-4 rounded-sm bg-[#FFFFFF0D] border border-[#FFFFFF0D] text-[#8398AD] !text-sm sm:!text-base"
              />
            </div>

            <div className="w-full sm:w-[25%]">
              <p className="text-[#E2E2E2] text-sm sm:text-base">
                Enter Percentage
              </p>
              <div className="flex items-center gap-2 ">
                <div className="w-full">
                  <Input
                    type="text"
                    placeholder="Enter percentage"
                    value={member.percentage || ""}
                    onChange={(e) => {
                      // Only allow numbers 0-100
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      const numValue = parseInt(value) || 0;
                      if (numValue <= 100) {
                        updateMember(index, "percentage", numValue);
                      }
                    }}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="mt-2 py-4 sm:py-6 px-3 sm:px-4 rounded-sm bg-[#FFFFFF0D] border border-[#FFFFFF0D] text-[#8398AD] !text-sm sm:!text-base"
                  />
                </div>

                {formData.members.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="w-fit h-full mt-2 cursor-pointer bg-[#403E3E] border border-[#FFFFFF0D] rounded-sm p-3 hover:bg-[#755A5A] transition-all duration-300"
                  >
                    <Trash2 className="w-6 h-6 text-[#E2E2E2]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="mt-8 sm:mt-10 w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Total Percentage Display */}
          <div className="w-full sm:w-[75%]">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[#E2E2E2] text-xs sm:text-[15px]">
                Total percentage must equal
              </p>
              <div className="text-[#E2E2E2] text-xs sm:text-[15px]">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700"></span>
                  <span
                    className={`text-lg font-bold ${
                      totalPercentage === 100
                        ? "text-green-600"
                        : totalPercentage > 100
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {totalPercentage}%
                  </span>
                </div>
                {totalPercentage !== 100 && (
                  <p className="text-sm text-red-600 mt-1">
                    {totalPercentage < 100
                      ? `${100 - totalPercentage}% remaining`
                      : `${totalPercentage - 100}% over`}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#374151] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  totalPercentage === 100
                    ? "bg-green-500"
                    : totalPercentage > 100
                    ? "bg-red-500"
                    : "bg-[#8B5CF6]"
                }`}
                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="w-full sm:w-[25%]">
            {/* Add Member Button */}
            <button
              onClick={addMember}
              className="mt-2 py-3 px-4 w-full border-gradient rounded-sm bg-[#FFFFFF0D] text-[#E2E2E2] flex items-center justify-center gap-2 hover:bg-opacity-10 transition-colors cursor-pointer"
            >
              <span>
                <Image
                  src={group1icon}
                  alt="icon"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </span>
              <span className="text-[#E2E2E2] text-sm sm:text-base">
                Add Member
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Usage section */}
      <div className="mt-8 border-t border-[#FFFFFF0D] pt-10 sm:mt-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Usage section left side */}
        <div className="w-full">
          <h2 className="text-[#E2E2E2] text-lg sm:text-xl pb-3 sm:pb-5 font-semibold">
            Usage
          </h2>
          <p className="text-[#E2E2E2] text-sm sm:text-base">
            Number of Planned Uses
          </p>
          <Input
            type="number"
            value={formData?.usage ? formData.usage : ""}
            placeholder="Enter number of usage"
            min={1}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, usage: e.target.value }))
            }
            className="mt-2 py-4 sm:py-6 px-3 sm:px-4 w-full rounded-sm bg-[#FFFFFF0D] border border-[#FFFFFF0D] text-[#8398AD] !text-sm sm:!text-base"
          />

          <div className="mt-8 sm:mt-10 bg-[#FFFFFF0D] p-4 sm:p-5 rounded-sm">
            <h1 className="text-[#E2E2E2] text-sm sm:text-base pb-3 sm:pb-5 font-semibold">
              Cost Calculation
            </h1>
            <div className="flex items-center justify-between">
              <h3 className="text-[#8398AD] text-sm sm:text-base font-semibold">
                Cost per use:
              </h3>
              <p className="text-[#E2E2E2] text-base sm:text-base font-bold">
                {creationFee ? creationFee.toFixed(2) : "1"} STRK
              </p>
            </div>

            <div className="flex items-center py-3 sm:py-5 border-b border-[#FFFFFF0D] justify-between">
              <h3 className="text-[#8398AD] text-sm sm:text-base font-semibold">
                Number of uses:
              </h3>
              <p className="text-[#E2E2E2] text-base sm:text-lg font-bold">
                {formData.usage}
              </p>
            </div>

            <div className="flex items-center pt-3 sm:pt-5 justify-between">
              <h3 className="text-[#8398AD] text-sm sm:text-base font-semibold">
                Total cost:
              </h3>
              <p className="text-[#E2E2E2] text-base sm:text-lg font-bold">
                STRK
                {Number(Number(formData.usage)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Review section right side */}
        <div className="w-full bg-[#FFFFFF0D] p-4 sm:p-5 rounded-sm border border-[#FFFFFF0D] h-[300px] sm:h-[400px] flex flex-col">
          <h2 className="text-[#E2E2E2] text-lg sm:text-xl pb-3 sm:pb-5 font-semibold">
            Review
          </h2>

          {/* Group Information */}
          <div className="space-y-2 mb-4 sm:mb-6 bg-[#FFFFFF0D] p-1.5 rounded-sm border border-[#FFFFFF0D]">
            <div className="flex items-center justify-between">
              <span className="text-[#8398AD] text-sm sm:text-base font-semibold">
                Group Name:
              </span>
              <span className="text-[#8398AD] text-sm sm:text-base font-semibold">
                Total Members:
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#E2E2E2] text-sm sm:text-base">
                {formData.name}
              </span>
              <span className="text-[#E2E2E2] text-sm sm:text-base">
                {formData.members.length}
              </span>
            </div>
          </div>

          {/* Member Details - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-2">
            {formData.members.map((member, index) => (
              <div key={index} className="border-b border-[#FFFFFF0D] pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8398AD] text-sm sm:text-base font-semibold">
                    Wallet address:
                  </span>
                  <span className="text-[#8398AD] text-sm sm:text-base font-semibold">
                    Percentage:
                  </span>
                </div>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <span className="text-[#E2E2E2] text-xs sm:text-sm break-all font-mono">
                      {member.addr}
                    </span>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className="text-[#E2E2E2] text-sm sm:text-base font-semibold">
                      {member.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Section */}
      <div className="mt-8 sm:mt-10 w-full border-t border-[#FFFFFF0D] pt-8 pb-16">
        <h2 className="text-[#E2E2E2] text-lg sm:text-xl pb-3 sm:pb-5 font-semibold">
          Confirmation
        </h2>

        {/* Checkbox */}
        <div className="bg-[#FFFFFF0D] p-3 sm:p-4 rounded-sm border border-[#FFFFFF0D] mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-[#434672] to-[#755a5a] cursor-pointer rounded-full flex items-center justify-center">
              <Checkbox
                checked={isCheckboxChecked}
                onCheckedChange={(checked) =>
                  setIsCheckboxChecked(checked as boolean)
                }
                className="!rounded-full h-4 w-4 sm:h-5 sm:w-5 cursor-pointer"
              />
            </span>
            <span className="text-[#E2E2E2] text-sm sm:text-base">
              By checking I accept the creation fee and confirm members and
              percentages are correct.
            </span>
          </div>
        </div>

        {/* Create Group Button */}
        <button
          onClick={handleSubmit}
          className={`w-full sm:w-fit  bg-[#FFFFFF0D] border border-[#FFFFFF0D] text-[#E2E2E2] py-3 sm:py-4 px-6 sm:px-12 rounded-sm flex items-center justify-center gap-2 sm:gap-3 transition-colors ${
            totalPercentage !== 100 ||
            isSubmitting ||
            !isCheckboxChecked ||
            !formData.usage
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#282e38] cursor-pointer"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#E2E2E2] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#E2E2E2] text-base sm:text-lg font-semibold">
                Creating Group...
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center">
                <Image
                  src={group4icon}
                  alt="icon"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>
              <span className="text-[#E2E2E2] text-base sm:text-lg font-semibold">
                Create Group
              </span>
            </>
          )}
        </button>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && <Loading />}

      {isSuccess && (
        <QRcode
          groupAddress={groupAddress}
          groupBalance={groupBalance}
          isLoadingBalance={isLoadingBalance}
          copySuccess={copySuccess}
          copyToClipboard={copyToClipboard}
          resetForm={resetForm}
          closeModal={forceCloseModal}
        />
      )}
    </div>
  );
};

export default CreateNewGroup;
