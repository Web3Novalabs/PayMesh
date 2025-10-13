import React from "react";

interface LoadingProps {
  title: string;
  description: string;
  progressSteps: string[];
  estimatedTime: string;
}

const Loading: React.FC<LoadingProps> = ({
  title,
  description,
  progressSteps,
  estimatedTime,
}) => {
  return (
    <div className="fixed inset-0 bg-[#000000a3] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#ffffff1e] border-gradient-modal rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        {/* Animated Loading Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 border-4 border-[#434672] border-t-[#755A5A] rounded-full animate-spin mx-auto"></div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-[#E2E2E2] mb-4">{title}</h2>
        <p className="text-[#8398AD] text-base mb-6">{description}</p>

        {/* Progress Steps */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#434672] rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-[#E2E2E2] text-sm">{progressSteps[0]}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#434672] rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-[#E2E2E2] text-sm">{progressSteps[1]}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#434672] border-t-[#755A5A] rounded-full animate-spin"></div>
            <span className="text-[#E2E2E2] text-sm">{progressSteps[2]}</span>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="mt-6 p-3 bg-[#FFFFFF0D] rounded-lg">
          <p className="text-[#8398AD] text-sm">
            ⏱️ Estimated time: {estimatedTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
