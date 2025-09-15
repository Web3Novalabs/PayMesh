import { FormData } from "@/app/dashboard/crowd-fund/components/CreateCrowdFundForm";
import { myProvider, ONE_STK } from "@/utils/contract";
import toast from "react-hot-toast";
import {
  AccountInterface,
  byteArray,
  cairo,
  CallData,
  PaymasterDetails,
} from "starknet";

export const CROWDFUNDINGADDRESS =
  "0x026ac4c4946d2b3c66c17012b6dd92f8f3f8f859dd3a152ebdd7930e58357bd0";
type SetIsSubmitting = (isSubmitting: boolean) => void;
type SetIsSuccess = (isSuccess: boolean) => void;
export const create_pool = async (
  formData: FormData,
  account: AccountInterface,
  setIsSubmitting: SetIsSubmitting,
  setIsSuccess: SetIsSuccess
): Promise<void> => {
  const { walletAddress, name, targetAmount } = formData;

  if (!name) {
    toast.error("pool name is required!");
    return;
  }
  if (!targetAmount) {
    toast.error("pool target amount is required!");
    return;
  }
  if (walletAddress.length != 66) {
    toast.error("input a valid contract address");
    return;
  }
  // handler();
  try {
    console.log("Blockchain function - Starting create_pool");
    setIsSubmitting(true);

    if (account != undefined) {
      const Call = {
        contractAddress: CROWDFUNDINGADDRESS,
        entrypoint: "create_pool",
        calldata: CallData.compile({
          name: byteArray.byteArrayFromString(name),
          target: cairo.uint256(+targetAmount * ONE_STK),
          beneficiary: walletAddress,
        }),
      };
      console.log(Call);
      const approveCall = {
        contractAddress:
          "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // strk address
        entrypoint: "approve",
        calldata: [
          CROWDFUNDINGADDRESS, // spender
          cairo.uint256(ONE_STK),
        ],
      };
      const multicallData = [approveCall, Call];
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
      //   const result = await account.execute(multicallData);

      const status = await myProvider.waitForTransaction(
        result?.transaction_hash as string
      );
      //   setIsOpen(true);
      console.log("Blockchain function - Setting isSuccess to true");
      setIsSuccess(true);
      //   onSubmit();
      console.log(result);

      console.log(status);
      console.log("Blockchain function - Successfully completed");
    }
  } catch (error) {
    console.error("Blockchain function - Error occurred:", error);
    // setIsError(true);
    toast.error("error creating a pool");
  } finally {
    console.log(
      "Blockchain function - Finally block, setting isSubmitting to false"
    );
    setIsSubmitting(false);
  }
};
