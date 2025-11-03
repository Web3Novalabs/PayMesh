"use client";

import React from "react";
import { X, Users, Calendar, DollarSign, Target } from "lucide-react";

interface FundingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  funding: {
    id: number;
    title: string;
    progress: number;
    donors: number;
    dateCreated: string;
    targetAmount: string;
    currentAmount: string;
    description?: string;
  } | null;
}

const FundingDetailsModal: React.FC<FundingDetailsModalProps> = ({
  isOpen,
  onClose,
  funding,
}) => {
  if (!isOpen || !funding) return null;

  return (
    <div className="fixed inset-0 bg-[#0000009c] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2937] border-gradient-modal rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#FFFFFF0D]">
          <h2 className="text-xl font-semibold text-[#DFDFE0]">
            {funding.title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8398AD] hover:text-[#DFDFE0] cursor-pointer transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#DFDFE0] font-medium">Progress</span>
              <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-sm">
                {funding.progress}% Complete
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-[#282e38] rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${funding.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-[#8398AD]">
                <span>Raised: {funding.currentAmount}</span>
                <span>Target: {funding.targetAmount}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFFFFF0D] p-4 rounded-sm border border-[#FFFFFF0D]">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">{funding.donors}</p>
                  <p className="text-[#8398AD] text-sm">Total Donors</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF0D] p-4 rounded-sm border border-[#FFFFFF0D]">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">
                    {funding.dateCreated}
                  </p>
                  <p className="text-[#8398AD] text-sm">Date Created</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF0D] p-4 rounded-sm border border-[#FFFFFF0D]">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">
                    {funding.currentAmount}
                  </p>
                  <p className="text-[#8398AD] text-sm">Amount Raised</p>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF0D] p-4 rounded-sm border border-[#FFFFFF0D]">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[#8398AD]" />
                <div>
                  <p className="text-[#DFDFE0] font-medium">
                    {funding.targetAmount}
                  </p>
                  <p className="text-[#8398AD] text-sm">Target Amount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-[#DFDFE0] font-medium">Description</h3>
            <p className="text-[#8398AD] text-sm leading-relaxed">
              {funding.description ||
                "This is a crowd funding campaign created to help achieve the specified goal. The campaign has been running successfully and has received support from multiple donors."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-gradient-to-r from-[#434672] to-[#755a5a] cursor-pointer text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium">
              Contribute Now
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-[#FFFFFF0D] border border-[#FFFFFF0D] text-[#DFDFE0] cursor-pointer py-3 px-4 rounded-sm hover:bg-[#282e38] transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingDetailsModal;
