import React from "react";
import QRCode from "react-qr-code";

interface MyCleanQrCodeProps {
  value: string;
}

export const MyCleanQrCode: React.FC<MyCleanQrCodeProps> = ({ value }) => {
  // Define the colors for the inverted style
  const foregroundColor = "#FFFFFF"; // White modules
  const backgroundColor = "#000000"; // Black background

  // The size can be adjusted based on your needs
  const size = 200;

  return (
    <div style={{ padding: "20px" }}>
      <QRCode
        // 1. DATA: The string value for the QR code
        value={value}
        // 2. SIZE: Adjust for your layout
        size={size}
        // 3. STYLING: Set the inverted colors
        fgColor={foregroundColor}
        bgColor={backgroundColor}
        // 4. LEVEL: (Optional) Higher Lvl provides better error correction
        level="M"
        // 5. VIEWBOX: Crucial for SVG to ensure proper scaling
        viewBox={`0 0 ${size} ${size}`}
      />
    </div>
  );
};
