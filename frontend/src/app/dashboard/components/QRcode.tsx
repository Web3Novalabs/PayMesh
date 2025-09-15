import Link from "next/link";
import QRCode from "react-qr-code";

interface QRcodeProps {
  groupAddress: string;
  groupBalance: string;
  isLoadingBalance: boolean;
  copySuccess: boolean;
  copyToClipboard: () => void;
  resetForm: () => void;
  closeModal: () => void;
}

export default function QRcode({
  groupAddress,
  groupBalance,
  isLoadingBalance,
  copySuccess,
  copyToClipboard,
  resetForm,
  closeModal,
}: QRcodeProps) {
  return (
    <div className="fixed inset-0 bg-[#000000a3] bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#ffffff1e] border-gradient-modal rounded-lg shadow-xl w-full max-w-sm sm:max-w-xl max-h-[95vh] sm:max-h-[100vh] overflow-y-auto relative mx-2">
        {/* Close Button */}
        <button
          onClick={() => {
            closeModal();
            resetForm();
          }}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-[#434672] hover:bg-[#755A5A] text-[#E2E2E2] rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center p-4 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#35c066] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-green-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#ffffff] mb-2">
              Group Created Successfully!
            </h1>
          </div>

          {/* QR Code */}
          <div className="mb-4 sm:mb-6">
            <div className="inline-block p-2 sm:p-3 bg-[#fffffffe] border-2 border-[#434672d8] rounded-lg">
              <QRCode
                value={groupAddress}
                size={160}
                level="H"
                className="w-40 h-40 sm:w-48 sm:h-48 lg:w-50 lg:h-50"
              />
            </div>
            <p className="text-xs sm:text-sm text-[#e2e2e2] mt-2">
              Scan this QR code to get the group address
            </p>
          </div>

          {/* Group Address Display */}
          <div className="mb-4 sm:mb-6 rounded-lg">
            <div className="!text-left text-xs sm:text-sm font-medium text-[#8398AD] mb-2">
              Group Address
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={groupAddress}
                readOnly
                className="flex-1 px-2 sm:px-3 py-2 border-gradient font-mono text-xs sm:text-sm text-[#e2e2e2] break-all"
              />
              <button
                onClick={copyToClipboard}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-md cursor-pointer font-medium transition-colors whitespace-nowrap ${
                  copySuccess
                    ? "bg-[#755A5A] text-[#e2e2e2]"
                    : "bg-[#434672] text-[#e2e2e2] hover:bg-[#755A5A]"
                }`}
              >
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
            <Link
              href="/dashboard/my-groups"
              onClick={() => {
                resetForm();
                closeModal();
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#434672] cursor-pointer text-white w-full rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Go to Groups
            </Link>
            <button
              onClick={() =>
                window.open(
                  `https://mainnet.starkscan.co/contract/${groupAddress}`,
                  "_blank"
                )
              }
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#755A5A] cursor-pointer text-white w-full rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              View on Starkscan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
