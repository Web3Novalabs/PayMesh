"use client";
import { Share2 } from "lucide-react";
import React, { useState } from "react";

interface PoolData {
  amountRaised: string;
  remainingAmount: string;
  targetAmount: string;
  fundraiserId: string;
}

export const XShareButtonWithPoolImage = ({
  poolData,
}: {
  poolData: PoolData;
}) => {
  const [showModal, setShowModal] = useState(false);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image at ${src}`));
      img.src = src;
    });
  };

  const generateAndDownload = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d")!;

    // 1. Background
    ctx.fillStyle = "#070A11";
    ctx.fillRect(0, 0, 1200, 1200);

    // 2. Background Coin
    try {
      const coinImg = await loadImage("/coin.png");
      ctx.globalAlpha = 0.6;
      ctx.drawImage(
        coinImg,
        100,
        380,
        1000,
        1000 * (coinImg.height / coinImg.width)
      );
      ctx.globalAlpha = 1.0;
    } catch (e) {
      console.error("Background coin failed to load", e);
    }

    // 3. Logo Badge & Logo Image
    const badgeX = 80,
      badgeY = 420,
      badgeW = 280,
      badgeH = 75;

    // Draw the pill background
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 40);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.stroke();

    try {
      // FIX: Load and draw the logo image inside the badge
      const logoImg = await loadImage("/logo.png");
      // Adjust size (50x50) and position within the badge
      ctx.drawImage(logoImg, badgeX + 15, badgeY + 12, 50, 50);
    } catch (e) {
      console.error("Logo image failed to load", e);
    }

    // Draw "PAYMESH" Text
    ctx.fillStyle = "white";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "left"; // Ensure alignment
    ctx.fillText("PAYMESH", badgeX + 75, badgeY + 48);

    // 4. Stats Rendering
    const drawStat = (
      x: number,
      label: string,
      value: string,
      color: string
    ) => {
      ctx.textAlign = "left";
      ctx.fillStyle = "#8398AD";
      ctx.font = "bold 24px Arial";
      ctx.fillText(label, x, 650);
      ctx.fillStyle = color;
      ctx.font = "bold 30px Arial";
      ctx.fillText(value, x, 700);
    };

    drawStat(80, "Amount Raised", poolData.amountRaised, "#BCC0C5");
    drawStat(480, "Remaining Amount", poolData.remainingAmount, "#BCC0C5");
    drawStat(880, "Target Amount", poolData.targetAmount, "#92FFB0");

    // 5. Bottom Text
    ctx.fillStyle = "white";
    ctx.font = "900 100px Impact, Arial Black, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("A LITTLE SUPPORT CAN", 600, 950);
    ctx.fillText("MAKE A BIG DIFFERENCE.", 600, 1070);

    // 6. Download Trigger
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `paymesh-share.png`;
        a.click();
        URL.revokeObjectURL(url);
        setShowModal(true);
      }
    });
  };

  const handlePostToX = () => {
    const fundraiserUrl = `https://paymesh.app/fundraiser/${poolData.fundraiserId}`;
    const defaultText = encodeURIComponent(
      `Every contribution counts! 🚀\n\n` +
        `I just joined the pool on @paymesh_ to support this initiative on @StarknetFndn. \n\n` +
        `Current progress: ${poolData.amountRaised} / ${poolData.targetAmount}\n\n` +
        `Join me and make an impact here: ${fundraiserUrl}`
    );
    const xUrl = `https://twitter.com/intent/tweet?text=${defaultText}`;
    window.open(xUrl, "_blank");
    setShowModal(false);
  };

  return (
    <>
      <button
        className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
        onClick={generateAndDownload}
      >
        <span className="text-[#030407] text-sm font-medium">Share</span>
        <Share2 className="w-4 h-4 text-[#030407]" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#070A11] border border-white/20 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
            <h2 className="text-white text-2xl font-bold mb-4">
              Image Downloaded
            </h2>
            <p className="text-[#8398AD] mb-6 leading-relaxed">
              To share on X, simply click the button below. When the window
              opens,
              <strong> attach the image you just downloaded</strong> from your
              files.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePostToX}
                className="bg-[#575EB7] text-[#DDDDDD] font-bold py-3 rounded-full hover:brightness-110 transition-all"
              >
                Open X & Post
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/50 text-sm hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
