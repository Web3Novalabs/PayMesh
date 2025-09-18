import { FormData } from "@/app/dashboard/crowd-fund/components/CreateCrowdFundForm";
import { myProvider, ONE_STK } from "@/utils/contract";
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
  "0x021f66a88f2be9de6ccf5414362c1d5319c5de6dbcb889852424acf860f8475d"; // mainnet
//   "0x026ac4c4946d2b3c66c17012b6dd92f8f3f8f859dd3a152ebdd7930e58357bd0"; //sepolia
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
          //   cairo.uint256(ONE_STK),
          "1000000000000000000",
          "0",
        ],
      };
      const multicallData = [approveCall, Call];
      //   const feeDetails: PaymasterDetails = {
      //     feeMode: {
      //       mode: "sponsored",
      //     },
      //   };

      //   const feeEstimation = await account?.estimatePaymasterTransactionFee(
      //     [...multicallData],
      //     feeDetails
      //   );

      //   const result = await account?.executePaymasterTransaction(
      //     [...multicallData],
      //     feeDetails,
      //     feeEstimation?.suggested_max_fee_in_gas_token
      //   );
      const result = await account.execute(multicallData);

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

// export const donate = async (
//   pool_address: string,
//   amount: number,
//   account: AccountInterface | undefined
// ): Promise<void> => {
//   // handler();

//   const sdk = new TyphoonSDK();
//   const STRK_ADDR =
//     "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

//   try {
//     console.log("Blockchain function - Starting donation");

//     if (account != undefined) {
//       //   const Call = {
//       //     contractAddress: CROWDFUNDINGADDRESS,
//       //     entrypoint: "paymesh_donate",
//       //     calldata: CallData.compile({
//       //       pool_address: pool_address,
//       //       amount: cairo.uint256(amount * ONE_STK),
//       //     }),
//       //   };
//       //   console.log(Call);
//       //   const approveCall = {
//       //     contractAddress:
//       //       "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // strk address
//       //     entrypoint: "approve",
//       //     calldata: [
//       //       CROWDFUNDINGADDRESS, // spender
//       //       //   cairo.uint256(amount * ONE_STK),
//       //       "1000000000000000000",
//       //       "0",
//       //     ],
//       //   };
//       //   const multicallData = [approveCall, Call];
//       //   const feeDetails: PaymasterDetails = {
//       //     feeMode: {
//       //       mode: "sponsored",
//       //     },
//       //   };

//       //   const feeEstimation = await account?.estimatePaymasterTransactionFee(
//       //     [...multicallData],
//       //     feeDetails
//       //   );

//       //   const result = await account?.executePaymasterTransaction(
//       //     [...multicallData],
//       //     feeDetails,
//       //     feeEstimation?.suggested_max_fee_in_gas_token
//       //   );
//       const calls = await sdk.generate_approve_and_deposit_calls(
//         amount * ONE_STK,
//         STRK_ADDR
//       );
//       await account.execute(calls);
//       //   const result = await account.execute(calls);
//       await account.waitForTransaction(calls.transaction_hash);
//       await sdk.withdraw(calls.transaction_hash, [pool_address]);

//       //   const status = await myProvider.waitForTransaction(
//       //     result?.transaction_hash as string
//       //   );
//       //   setIsOpen(true);
//       console.log("Blockchain function - Setting isSuccess to true");
//       //   setIsSuccess(true);
//       //   onSubmit();
//       //   console.log(result);

//       console.log(status);
//       console.log("Blockchain function - Successfully completed");
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

export const donate = async (
  pool_address: string,
  amount: number,
  account: AccountInterface | undefined
): Promise<void> => {
  const sdk = new TyphoonSDK();
  const STRK_ADDR =
    "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

  try {
    console.log("Blockchain function - Starting donation");

    if (account != undefined) {
      const calls = await sdk.generate_approve_and_deposit_calls(
        BigInt(+amount * ONE_STK),
        STRK_ADDR
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
      console.log("Blockchain function - Setting isSuccess to true");
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
    // setIsSubmitting(false);
  }
};
