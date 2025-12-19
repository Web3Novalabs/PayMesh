"use client";

import { PuffLoader } from "react-spinners";

interface LoadingProps {
  size?: number;
  color?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = 150,
  color = "#4950B1",
  className = "",
  fullScreen = true,
}: LoadingProps) {
  const loader = (
    <div className={`flex items-center justify-center ${className}`}>
      <PuffLoader color={color} size={size} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#0F111A]/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}
