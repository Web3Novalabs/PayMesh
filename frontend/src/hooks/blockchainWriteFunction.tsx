import { FormData } from "@/app/dashboard/crowd-fund/components/CreateCrowdFundForm";
import { myProvider, ONE_STK, strkTokenAddress } from "@/utils/contract";
// @ts-expect-error typhoon-sdk has incorrect type declarations
import { TyphoonSDK } from "typhoon-sdk";
import toast from "react-hot-toast";
import {
  AccountInterface,
  byteArray,
  cairo,
  CallData,
  PaymasterDetails,
} from "starknet";

export const CROWDFUNDINGADDRESS =
  "0x05371e167ec1a1884734895bd25aa66765829d1b040f66fc757d1f4ce13aa401";
// "0x02625bd794f2e623270c244b9871306747addee48c2b449f6a6dce75120e0841"; // mainnet
// "0x021f66a88f2be9de6ccf5414362c1d5319c5de6dbcb889852424acf860f8475d"; // mainnet
type SetIsSubmitting = (isSubmitting: boolean) => void;
type SetIsSuccess = (isSuccess: boolean) => void;
type SetPoolAddress = (address: string) => void;

export let poolAddrQr: string = "";
function removeNonASCII(text: string) {
  return text.replace(/[^\x00-\x7F]/g, "");
}
export const create_pool = async (
  formData: FormData,
  account: AccountInterface,
  setIsSubmitting: SetIsSubmitting,
  setIsSuccess: SetIsSuccess,
  setPoolAddress: SetPoolAddress
): Promise<void> => {
  const { walletAddress, name, targetAmount, description } = formData;

  if (!name) {
    toast.error("pool name is required!");
    return;
  }

  if (!description) {
    toast.error("pool descrion with character lenth min 150 is required!");
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
  const formated_description = removeNonASCII(description);

  // handler();
  try {
    console.log(
      "Blockchain function - Starting create_pool"
      // formated_description
    );
    setIsSubmitting(true);

    if (account != undefined) {
      console.log("hey");
      const Call = {
        contractAddress: CROWDFUNDINGADDRESS,
        entrypoint: "create_pool",
        calldata: CallData.compile({
          name: byteArray.byteArrayFromString(name),
          target: cairo.uint256(+targetAmount * ONE_STK),
          beneficiary: walletAddress,
          description: byteArray.byteArrayFromString(formated_description),
        }),
      };
      console.log(Call);
      const approveCall = {
        contractAddress:
          "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // strk address
        entrypoint: "approve",
        calldata: [
          CROWDFUNDINGADDRESS, // spender
          // cairo.uint256(ONE_STK),
          "1000000000000000000",
          "0",
        ],
      };
      const multicallData = [approveCall, Call];
      console.log(multicallData);
      // const feeDetails: PaymasterDetails = {
      //   feeMode: {
      //     mode: "sponsored",
      //   },
      // };

      // const feeEstimation = await account?.estimatePaymasterTransactionFee(
      //   [...multicallData],
      //   feeDetails
      // );

      // const result = await account?.executePaymasterTransaction(
      //   [...multicallData],
      //   feeDetails,
      //   feeEstimation?.suggested_max_fee_in_gas_token
      // );
      const result = await account.execute(multicallData);

      const status = await myProvider.waitForTransaction(
        result?.transaction_hash as string
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const poolAddress = (status as any)?.events?.[3]?.data?.[0];
      poolAddrQr = poolAddress as string;

      console.log("Pool address extracted:", poolAddress);
      setPoolAddress(poolAddress as string);

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

type SetIsLoading = (isSubmitting: boolean) => void;
type OnSuccess = (isSubmitting: boolean) => void;
type OnError = (isSubmitting: string) => void;
export const donate = async (
  pool_address: string,
  amount: number,
  account: AccountInterface | undefined,
  setIsLoading: SetIsLoading,
  isAnonymous: boolean,
  setIsSuccess: SetIsSuccess
  // setIsSuccess: SetIsSuccess,
  // onSuccess: OnSuccess,
  // onError: OnError
): Promise<void> => {
  const sdk = new TyphoonSDK();
  const STRK_ADDR =
    // "0x52aecc8358313bd9bce6303b3152f8951723654d7e8dc2a6d55b291b8989976";
    "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

  try {
    console.log("Blockchain function - Starting donation");
    setIsLoading(true);
    console.log("hey");
    if (account != undefined) {
      if (isAnonymous) {
        const calls = await sdk.generate_approve_and_deposit_calls(
          BigInt(+amount * ONE_STK),
          strkTokenAddress
        );
        console.log(calls);
        const multicall = await account.execute(calls);

        const download = await sdk.download_notes(multicall.transaction_hash);
        console.log("download", download);
        const result1 = await account.waitForTransaction(
          multicall.transaction_hash
        );
        console.log("result1", result1);
        const withdraw = await sdk.withdraw(multicall.transaction_hash, [
          pool_address,
        ]);
        console.log("widthdraw", withdraw);

        // Set success state for anonymous donations
        console.log("Anonymous donation isSuccess true");
        setIsSuccess(true);
      } else {
        console.log(
          "main-address",
          "0x06921613abdd80028144c8df3be64646d1291377f3ff1bcaf126617821d60e40"
        );
        console.log("pool_address", pool_address);
        const Call = {
          contractAddress: CROWDFUNDINGADDRESS,
          entrypoint: "paymesh_donate",
          calldata: CallData.compile({
            pool_address: pool_address,
            amount: cairo.uint256(amount * ONE_STK),
          }),
        };
        console.log(Call, "input", amount * ONE_STK);
        const approveCall = {
          contractAddress:
            "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // strk address
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: CROWDFUNDINGADDRESS,
            amount: cairo.uint256(amount * ONE_STK),
          }),
        };
        console.log();
        const multicallData = [approveCall, Call];
        // const feeDetails: PaymasterDetails = {
        //   feeMode: {
        //     mode: "sponsored",
        //   },
        // };

        // const feeEstimation = await account?.estimatePaymasterTransactionFee(
        //   [...multicallData],
        //   feeDetails
        // );

        // const result = await account?.executePaymasterTransaction(
        //   [...multicallData],
        //   feeDetails,
        //   feeEstimation?.suggested_max_fee_in_gas_token
        // );
        const result = await account.execute(multicallData);

        const status = await myProvider.waitForTransaction(
          result?.transaction_hash as string
        );
        console.log("Regular donation isSuccess true");
        console.log(status);
        setIsSuccess(true);
      }
    }
  } catch (error) {
    console.error("Blockchain function - Error occurred:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Provide more specific error messages
    if (errorMessage.includes("insufficient")) {
      toast.error("Insufficient balance. Please check your wallet balance.");
    } else if (errorMessage.includes("rejected")) {
      toast.error("Transaction was rejected. Please try again.");
    } else if (errorMessage.includes("network")) {
      toast.error("Network error. Please check your connection and try again.");
    } else {
      toast.error("Failed to process donation. Please try again.");
    }
  } finally {
    console.log(
      "Blockchain function - Finally block, setting isLoading to false"
    );
    setIsLoading(false);
  }
};
// export const donate = async (
//   pool_address: string,
//   amount: number,
//   account: AccountInterface | undefined
// ): Promise<void> => {
//   const sdk = new TyphoonSDK();
//   const STRK_ADDR =
//     "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

//   try {
//     console.log("Blockchain function - Starting donation");

//     if (account != undefined) {
//     }
//   } catch (error) {
//     console.error("Blockchain function - Error occurred:", error);
//     // setIsError(true);
//     toast.error("error creating a pool");
//   } finally {
//     console.log(
//       "Blockchain function - Finally block, setting isSubmitting to false"
//     );
//     // setIsSubmitting(false);
//   }
// };
