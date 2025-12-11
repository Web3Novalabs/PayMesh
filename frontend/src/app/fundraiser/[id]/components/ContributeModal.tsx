import { ContributeModalProps } from "@/types/usdcDataApi";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGetPool } from "@/hooks/useContractInteraction";
import { donate } from "@/hooks/blockchainWriteFunction";
import { useAccount } from "@starknet-react/core";
import { X, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  pool_address,
}) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const params = useParams();
  const { id } = params;
  //   const pool = useGetPool(Array.isArray(id) ? id[0] : id ?? "");
  const { account } = useAccount();
  // const balance = useGetBalance(account?.address || "0x0");
  // Handle success state close modal and show success toast
  useEffect(() => {
    if (isSuccess) {
      toast.success("🎉 Donation successful! Thank you for your contribution!");
      // Reset form state
      setAmount("");
      setIsAnonymous(false);
      setIsSuccess(false);
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isSuccess, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    // Validation: If anonymous is selected, amount must be more than 10
    if (isAnonymous && numAmount <= 10) {
      toast.error("Anonymous donations must be more than 10 STRK or 2 USDC");
      return;
    }

    // if (isAnonymous && balance?.formatted && +balance.formatted < 12) {
    //   toast.error("Insufficient balance, Top Up!");
    //   return;
    // }

    // Validation: Amount must be positive
    if (numAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    donate(
      pool_address,
      numAmount,
      account,
      setIsLoading,
      isAnonymous,
      setIsSuccess
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0000009c] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2937] border-gradient-modal rounded-sm max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#FFFFFF0D]">
          <h2 className="text-xl font-semibold text-[#DFDFE0]">
            Contribute to Campaign
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading || isSuccess}
            className={`transition-colors duration-200 ${
              isLoading || isSuccess
                ? "text-[#8398AD] cursor-not-allowed opacity-50"
                : "text-[#8398AD] hover:text-[#DFDFE0] cursor-pointer"
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success State */}
          {/* {isSuccess && (
              <div className="bg-[#064E3B] border border-[#10B981] rounded-sm p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-[#10B981] text-sm font-medium">
                    Donation successful! 🎉
                  </p>
                </div>
                <p className="text-[#6EE7B7] text-xs mt-2">
                  Your contribution has been recorded on the blockchain. Thank
                  you!
                </p>
              </div>
            )} */}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-[#10273E] border border-[#0073E6] rounded-sm p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0073E6]"></div>
                <p className="text-[#0073E6] text-sm font-medium">
                  Processing your donation on the blockchain...
                </p>
              </div>
              <p className="text-[#8398AD] text-xs mt-2">
                Please wait while the transaction is being confirmed. Do not
                close this window.
              </p>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#E2E2E2]">
              How much do you want to donate?
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8398AD] w-4 h-4" />
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF0D] rounded-sm text-[#8398AD] border border-[#FFFFFF0D] placeholder:text-[#8398AD] focus:outline-none focus:ring-0 focus:border-[#FFFFFF0D]"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#E2E2E2]">
              Donation Privacy
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={!isAnonymous}
                  onChange={() => setIsAnonymous(false)}
                  className="w-4 h-4 text-[#434672] bg-[#FFFFFF0D] border-[#FFFFFF0D] focus:ring-[#434672]"
                />
                <span className="text-[#DFDFE0]">Public donation</span>
              </label>
              {/* <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    checked={isAnonymous}
                    onChange={() => setIsAnonymous(true)}
                    className="w-4 h-4 text-[#434672] bg-[#FFFFFF0D] border-[#FFFFFF0D] focus:ring-[#434672]"
                  />
                  <span className="text-[#DFDFE0]">Anonymous donation</span>
                </label> */}
            </div>

            {/* Anonymous donation requirement notice */}
            {isAnonymous && (
              <div className="bg-[#1F2937] border border-[#F59E0B] rounded-sm p-3">
                <p className="text-[#F59E0B] text-sm">
                  ⚠️ Anonymous donations require a minimum of{" "}
                  <strong>10 STRK/2 USDC</strong>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={
                isLoading ||
                isSuccess ||
                (isAnonymous && parseFloat(amount) <= 10) ||
                parseFloat(amount) <= 0
              }
              className={`flex-1 bg-gradient-to-r from-[#434672] to-[#755a5a] text-white py-3 px-4 rounded-sm transition-opacity duration-200 font-medium ${
                isLoading ||
                isSuccess ||
                (isAnonymous && parseFloat(amount) <= 10) ||
                parseFloat(amount) <= 0
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:opacity-90"
              }`}
            >
              {isLoading
                ? "Processing Transaction..."
                : isSuccess
                ? "Donation Successful!"
                : "Contribute Now"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSuccess}
              className={`flex-1 border border-[#FFFFFF0D] text-[#DFDFE0] py-3 px-4 rounded-sm transition-colors duration-200 ${
                isLoading || isSuccess
                  ? "bg-[#282e38] cursor-not-allowed opacity-50"
                  : "bg-[#FFFFFF0D] cursor-pointer hover:bg-[#282e38]"
              }`}
            >
              {isSuccess ? "Closing..." : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributeModal;
