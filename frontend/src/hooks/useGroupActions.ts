import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { CallData, cairo } from "starknet";
import {
  PAYMESH_ADDRESS,
  strkTokenAddress,
  ONE_STK,
  myProvider,
} from "@/utils/contract";
import toast from "react-hot-toast";

export const useGroupActions = () => {
  const { account } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTopUp, setIsTopUp] = useState(false);

  const handleSplit = async (
    groupAddress: string | undefined,
    balanceFormatted: string | undefined
  ) => {
    if (!balanceFormatted || !groupAddress) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (account) {
        const swiftpayCall = {
          contractAddress: PAYMESH_ADDRESS,
          entrypoint: "paymesh",
          calldata: CallData.compile({
            group_address: groupAddress,
          }),
        };

        const approveCall = {
          contractAddress: strkTokenAddress,
          entrypoint: "approve",
          calldata: [
            PAYMESH_ADDRESS, // spender
            cairo.uint256(ONE_STK),
          ],
        };

        const multicallData = [approveCall, swiftpayCall];

        // const feeDetails: PaymasterDetails = {
        //   feeMode: {
        //     mode: "sponsored",
        //   },
        // };

        // const feeEstimation = await account.estimatePaymasterTransactionFee(
        //   [...multicallData],
        //   feeDetails
        // );

        // const result = await account.executePaymasterTransaction(
        //   [...multicallData],
        //   feeDetails,
        //   feeEstimation?.suggested_max_fee_in_gas_token
        // );

        const result = await account.execute(multicallData);
        const status = await myProvider.waitForTransaction(
          result?.transaction_hash as string
        );

        console.log(result);
        console.log(status);
        toast.success("split succesfull");
      }
    } catch (error) {
      console.error("Error splitting funds:", error);
      toast.error("Failed to split funds, top up subscription. and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopUp = async (
    groupId: string | undefined,
    balanceFormatted: string | undefined,
    userBalanceFormatted: string | undefined
  ) => {
    if (!balanceFormatted && !groupId) {
      return;
    }

    if (userBalanceFormatted && +userBalanceFormatted < 1) {
      toast.error(`Insufficient balance, Top Up!`);
      return;
    }

    try {
      setIsTopUp(true);

      if (account && balanceFormatted) {
        const swiftpayCall = {
          contractAddress: PAYMESH_ADDRESS,
          entrypoint: "top_subscription",
          calldata: CallData.compile({
            group_id: cairo.uint256(+(groupId || 0)),
            new_planned_usage_count: cairo.uint256(1),
          }),
        };

        const approveCall = {
          contractAddress: strkTokenAddress,
          entrypoint: "approve",
          calldata: [PAYMESH_ADDRESS, cairo.uint256(ONE_STK)],
        };

        const multicallData = [approveCall, swiftpayCall];

        // const feeDetails: PaymasterDetails = {
        //   feeMode: {
        //     mode: "sponsored",
        //   },
        // };

        // const feeEstimation = await account.estimatePaymasterTransactionFee(
        //   [...multicallData],
        //   feeDetails
        // );

        // await account.executePaymasterTransaction(
        //   [...multicallData],
        //   feeDetails,
        //   feeEstimation?.suggested_max_fee_in_gas_token
        // );
        await account.execute(multicallData);
        toast.success("Top Up Successful!");
      }
    } catch (error) {
      console.error("Error paying group:", error);
      toast.error("Failed to top up subscription. Please try again.");
    } finally {
      setIsTopUp(false);
    }
  };

  return {
    handleSplit,
    handleTopUp,
    isSubmitting,
    isTopUp,
  };
};
