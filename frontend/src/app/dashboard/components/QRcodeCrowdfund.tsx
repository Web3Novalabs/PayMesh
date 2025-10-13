import QRCode from "react-qr-code";
import { useState } from "react";
import {
  getTwitterShareUrl,
  createShareUrl,
  generateShortId,
} from "@/utils/shareUtils";
import { Copy } from "lucide-react";

interface QRcodeCrowdfundProps {
  fundAddress: string;
  groupBalance: string;
  isLoadingBalance: boolean;
  copySuccess: boolean;
  copyToClipboard: () => void;
  resetForm: () => void;
  campaignTitle?: string;
  campaignDescription?: string;
  campaignId?: string;
}

export default function QRcodeCrowdfund({
  fundAddress,
  copySuccess,
  copyToClipboard,
  resetForm,
  campaignTitle = "My Crowdfunding Campaign",
  campaignDescription = "Support this amazing cause!",
  campaignId,
}: QRcodeCrowdfundProps) {
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const handleCopyShareLink = async () => {
    // Use campaignId if available, otherwise fallback to fundAddress
    const id = campaignId || fundAddress || "temp";
    const shareUrl = `paymesh.app/dashboard/crowd-fund/details/${generateShortId()}/${id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy share link:", err);
    }
  };

  const handleShareOnTwitter = () => {
    // Use campaignId if available, otherwise fallback to fundAddress
    const id = campaignId || fundAddress || "temp";
    const shareUrl = `paymesh.app/dashboard/crowd-fund/details/${generateShortId()}/${id}`;
    const shareText = `🌟 I just launched my Fundraising campaign "${campaignTitle}" on @paymesh_ 🚀


Every contribution counts — let's build something amazing together! 💫

#PayMesh #Starknet #CryptoForGood #Crowdfunding`;

    const twitterUrl = getTwitterShareUrl(shareText, shareUrl);
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  console.log(
    "QRcodeCrowdfund component rendering with fundAddress:",
    fundAddress,
    "campaignId:",
    campaignId
  );
  return (
    <div className="fixed inset-0 bg-[#000000a3] bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#ffffff1e] border-gradient-modal rounded-lg shadow-xl w-full max-w-sm sm:max-w-xl max-h-[95vh] sm:max-h-[100vh] overflow-y-auto relative mx-2">
        {/* Close Button */}
        <button
          onClick={() => {
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
                value={fundAddress}
                size={160}
                level="H"
                className="w-40 h-40 sm:w-48 sm:h-48 lg:w-50 lg:h-50"
              />
            </div>
            <p className="text-xs sm:text-sm text-[#e2e2e2] mt-2">
              Scan this QR code to get the fund address
            </p>
          </div>

          {/* Group Address Display */}
          <div className="mb-4 sm:mb-6 rounded-lg">
            <div className="!text-left text-xs sm:text-sm font-medium text-[#8398AD] mb-2">
              Fund Address
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={fundAddress}
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

          {/* Share Section - Simplified */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm text-[#8398AD]">
                Share your Fundraising campaign:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareOnTwitter}
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Share on X</span>
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer ${
                    shareLinkCopied
                      ? "bg-green-600 text-white"
                      : "bg-[#434672] hover:bg-[#755A5A] text-white"
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>{shareLinkCopied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
            <button
              onClick={() => {
                resetForm();
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#434672] cursor-pointer text-white w-full rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Go to Crowd Fundings
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://sepolia.starkscan.co/contract/${fundAddress}`,
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
