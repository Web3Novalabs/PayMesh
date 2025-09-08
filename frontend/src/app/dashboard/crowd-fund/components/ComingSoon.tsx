"use client";

import React, { useState } from "react";
import { X, Clock, Star, Zap } from "lucide-react";

interface ComingSoonModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonModalProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  title = "Coming Soon",
  description = "We're working hard to bring you this amazing feature. Stay tuned for updates!",
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = externalOnClose || (() => setInternalIsOpen(false));
  const handleOpen = () => setInternalIsOpen(true);

  // If no external control, show a button to open the modal
  if (externalIsOpen === undefined) {
    return (
      <>
        <button
          onClick={handleOpen}
          className="border-gradient-flow px-8 py-4 text-white font-medium rounded-sm hover:opacity-90 transition-opacity duration-200 flex items-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {title}
        </button>

        <ComingSoonModal
          isOpen={isOpen}
          onClose={handleClose}
          title={title}
          description={description}
        />
      </>
    );
  }

  return (
    <ComingSoonModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
    />
  );
};

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0000009c] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2937] border-gradient-modal rounded-sm max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#FFFFFF0D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#DFDFE0]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8398AD] hover:text-[#DFDFE0] cursor-pointer transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full flex items-center justify-center animate-pulse">
                <Star className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full opacity-30 animate-ping"></div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-[#DFDFE0] text-lg font-medium">{title}</p>
            <p className="text-[#8398AD] text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Features Preview */}
          <div className="space-y-3">
            <h3 className="text-[#DFDFE0] font-medium text-sm">
              What to expect:
            </h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 text-[#8398AD] text-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full"></div>
                <span>Advanced funding features</span>
              </div>
              <div className="flex items-center gap-3 text-[#8398AD] text-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full"></div>
                <span>Enhanced user experience</span>
              </div>
              <div className="flex items-center gap-3 text-[#8398AD] text-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-[#434672] to-[#755a5a] rounded-full"></div>
                <span>Real-time updates</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-[#434672] to-[#755a5a] cursor-pointer text-white py-3 px-4 rounded-sm hover:opacity-90 transition-opacity duration-200 font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
