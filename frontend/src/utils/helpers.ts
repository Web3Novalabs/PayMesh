import { Member } from "@/types/group";
import { RefObject } from "react";

export const getNetworkColor = (
  mainnet: string,
  sepolia: string,
  chainId?: string
) => {
  if (!chainId) return "text-gray-500";
  if (String(chainId) === sepolia) return "text-orange-600";
  if (String(chainId) === mainnet) return "text-green-600";
  return "text-gray-500";
};

export const getNetworkName = (
  mainnet: string,
  sepolia: string,
  chainId?: string
) => {
  if (!chainId) return "Not Connected";

  if (String(chainId) === sepolia) return "Sepolia Testnet";
  if (String(chainId) === mainnet) return "Mainnet";
  return "Unknown Network";
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const gradientColors = [
  "#BCC0C5",
  "#FF929F",
  "#FFAC92",
  "#FFD392",
  "#92FFB0",
  "#92F2FF",
  "#92CAFF",
  "#A192FF",
  "#DC92FF",
];
// button border gradient
export const gradientStops = gradientColors
  .map((color, index) => {
    const percentage = (index / (gradientColors.length - 1)) * 100;
    return `${color} ${percentage}%`;
  })
  .join(", ");

// group utils
type SetMembers = React.Dispatch<React.SetStateAction<Member[]>>;
export const handleAddMember = (members: Member[], setMembers: SetMembers) => {
  const newId = (
    Math.max(...members.map((m) => Number.parseInt(m.id)), 0) + 1
  ).toString();
  setMembers([...members, { id: newId, address: "", percentage: 0 }]);
};

export const handleRemoveMember = (
  id: string,
  setMembers: SetMembers,
  members: Member[]
) => {
  if (members.length > 1) {
    setMembers(members.filter((m) => m.id !== id));
  }
};

export const handleAddressChange = (
  id: string,
  value: string,
  setMembers: SetMembers,
  members: Member[]
) => {
  setMembers(members.map((m) => (m.id === id ? { ...m, address: value } : m)));
};

export const handlePercentageChange = (
  id: string,
  value: string,
  setMembers: SetMembers,
  members: Member[]
) => {
  setMembers(
    members.map((m) =>
      m.id === id ? { ...m, percentage: Number.parseFloat(value) || 0 } : m
    )
  );
};

export const handleCSVImport = (
  event: React.ChangeEvent<HTMLInputElement>,
  setMembers: SetMembers,
  fileInputRef: RefObject<HTMLInputElement | null>
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const lines = text.trim().split("\n");

      // Filter out empty lines and header rows
      const addresses = lines
        .filter(
          (line) => line.trim() && !line.toLowerCase().includes("address")
        )
        .map((line, index) => ({
          id: (index + 1).toString(),
          address: line.trim(),
          percentage: 0,
        }));

      if (addresses.length > 0) {
        setMembers(addresses);
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      alert("Error parsing CSV file");
    }
  };
  reader.readAsText(file);

  // Reset file input
  if (fileInputRef?.current) {
    fileInputRef.current.value = "";
  }
};
