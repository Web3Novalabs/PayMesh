import { FormData } from "@/app/components/dashboard/crowd-fund/components/CreateCrowdFundForm";
import {
  myProvider,
  normalizeAddress,
  ONE_STK,
  ONE_USDC,
  PAYMESH_ADDRESS,
  strkTokenAddress,
} from "@/utils/contract";
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
import { CreateGroupFormData } from "@/types/group";

const usdc =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
export const CROWDFUNDINGADDRESS =
  // "0x03e58267891dff9318e6e715336b84b515547173dee464d251d0aae3ed19e22a"; // Testing new
  "0x02c92666029b207dc882c267d7b55c3fe4178e9f550f7188cd49adb85f963623"; // lastest mainnet contract address
// "0x03e58267891dff9318e6e715336b84b515547173dee464d251d0aae3ed19e22a"; // second CA the last before main, money in it
// "0x05a37b08ab67fba4de346b7db2c16e68c59c408bb6ce4e7d3deeecc9ec3f2723"; // third mainnet testing contract
// "0x05371e167ec1a1884734895bd25aa66765829d1b040f66fc757d1f4ce13aa401";
// "0x02625bd794f2e623270c244b9871306747addee48c2b449f6a6dce75120e0841"; // mainnet
// "0x021f66a88f2be9de6ccf5414362c1d5319c5de6dbcb889852424acf860f8475d"; // mainnet
type SetIsSubmitting = (isSubmitting: boolean) => void;
type SetIsSuccess = (isSuccess: boolean) => void;
type SetPoolAddress = (address: string) => void;
type SetResultHash = (txHash: string) => void;
export type SetFormData = React.Dispatch<
  React.SetStateAction<CreateGroupFormData>
>;
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
  // const formated_description = removeNonASCII(description);

  // handler();
  try {
    // console.log(
    //   "Blockchain function - Starting create_pool"
    //   // formated_description
    // );
    setIsSubmitting(true);

    if (account != undefined) {
      const Call = {
        contractAddress: CROWDFUNDINGADDRESS,
        entrypoint: "create_pool",
        calldata: CallData.compile({
          name: byteArray.byteArrayFromString(""),
          target: cairo.uint256(+targetAmount * ONE_USDC),
          beneficiary: walletAddress,
          description: byteArray.byteArrayFromString(""),
        }),
      };
      // console.log(Call);
      const approveCall = {
        contractAddress:
          "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        entrypoint: "approve",
        calldata: [
          CROWDFUNDINGADDRESS, // spender
          // cairo.uint256(ONE_STK),
          "4000000000000000000",
          "0",
        ],
      };
      const multicallData = [approveCall, Call];
      // console.log(multicallData);
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

      const address = `0x${normalizeAddress(poolAddress)}`;
      // console.log(address, "addr");
      await create_crowd_funding(
        address,
        account.address,
        name,
        (+targetAmount * ONE_USDC).toString(),
        description
      );
      setPoolAddress(address as string);

      setIsSuccess(true);
      // console.log(result);

      console.log(status);
      // console.log("Blockchain function - Successfully completed");
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
export const donate = async (
  pool_address: string,
  amount: number,
  account: AccountInterface | undefined,
  setIsLoading: SetIsLoading,
  isAnonymous: boolean,
  setIsSuccess: SetIsSuccess
  // onSuccess: OnSuccess,
  // onError: OnError
): Promise<void> => {
  const sdk = new TyphoonSDK();

  try {
    console.log("Blockchain function - Starting donation");
    setIsLoading(true);
    console.log("hey");
    if (account != undefined) {
      if (isAnonymous) {
        const calls = await sdk.generate_approve_and_deposit_calls(
          BigInt(+amount * ONE_USDC),
          usdc
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
        const Call = {
          contractAddress: CROWDFUNDINGADDRESS,
          entrypoint: "paymesh_donate",
          calldata: CallData.compile({
            pool_address: pool_address,
            amount: cairo.uint256(amount * ONE_USDC),
          }),
        };

        const approveCall = {
          contractAddress: usdc,
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: CROWDFUNDINGADDRESS,
            amount: cairo.uint256(amount * ONE_USDC),
          }),
        };
        console.log();
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
        // const result = await account.execute(multicallData);

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

export const createGroup = async (
  formData: CreateGroupFormData,
  setIsSubmitting: SetIsSubmitting,
  account: AccountInterface,
  setResultHash: SetResultHash,
  setFormData: SetFormData
) => {
  setIsSubmitting(true);

  try {
    if (account != undefined && formData.usage) {
      // console.log("formData.members", formData.members);

      const formattedMembers = formData.members
        .filter((member) => member.addr.trim() !== "")
        .map((member) => ({
          addr: member.addr.trim(),
          percentage: cairo.uint256(Number(member.percentage) * 1000),
        }));
      console.log(formattedMembers, "fmt");
      // const totalPercentage = formattedMembers.reduce(
      //   (sum, member) => sum + member.percentage,
      //   0
      // );
      // console.log("Total percentage:", totalPercentage);
      // console.log("form dataDDDDDDDDDDD xxxxxxxxxx:", {
      //   name: formData.name,
      //   usage: formData.usage,
      //   formattedMembers,
      // });

      const call = {
        contractAddress: PAYMESH_ADDRESS,
        entrypoint: "create_group",
        calldata: CallData.compile({
          name: byteArray.byteArrayFromString(formData.name),
          members: formattedMembers,
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

      const multicallData = [approveCall, call];
      // const result = await account.execute(multicallData);

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
      console.log(result);
      await myProvider.waitForTransaction(result?.transaction_hash as string);
      setResultHash(result.transaction_hash);
    }

    // Reset form
    setFormData({
      name: "",
      usage: "",
      members: [
        { addr: "", percentage: 0, id: "1" },
        { addr: "", percentage: 0, id: "2" },
      ],
      agreeTerms: false,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    toast.error("Failed to create group. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

// const updatePool = async (
//   pool_address: string,
//   creator_address: string,
//   name: string,
//   description: string
// ) => {
//   console.log("Crowd updated ", pool_address);

//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/crowdfunding/${pool_address}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           creator_address: creator_address,
//           description: description,
//           name: name,
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text(); // Capture response body
//       throw new Error(
//         `HTTP error! Status: ${response.status}, Body: ${errorText}`
//       );
//     }

//     const data = await response.json();
//     console.log("Response:", data);
//     return data;
//   } catch (error) {
//     console.log("Error updating pool:", error);
//   }
// };
const create_crowd_funding = async (
  pool_address: string,
  creator_address: string,
  name: string,
  target_amount: string,
  description: string
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/crowdfunding`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "paymesh-api-key": `${process.env.NEXT_PUBLIC_PAYMESH_API}`,
        },
        body: JSON.stringify({
          creator_address: creator_address,
          name: name,
          pool_address: pool_address,
          target_amount: target_amount,
          description: description,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); // Capture response body
      throw new Error(
        `HTTP error! Status: ${response.status}, Body: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.log("Error updating pool:", error);
  }
  console.log("Crowd funding created: ", pool_address);
};
