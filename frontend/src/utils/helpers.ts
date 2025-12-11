import { CreateGroupFormData, GroupMemberShare } from "@/types/group";
import { RefObject } from "react";
import { checkAddressNetwork } from "./contract";

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
type SetForm = React.Dispatch<React.SetStateAction<CreateGroupFormData>>;
export const handleAddMember = (
  members: GroupMemberShare[],
  setMembers: SetForm
) => {
  const newId = (
    Math.max(...members.map((m) => Number.parseInt(m?.id ?? "")), 0) + 1
  ).toString();
  setMembers((prev) => {
    return {
      ...prev,
      members: [...members, { id: newId, addr: "", percentage: 0 }],
    };
  });
};

export const handleRemoveMember = (
  id: string,
  setMembers: SetForm,
  members: GroupMemberShare[]
) => {
  if (members.length > 1) {
    setMembers((prev) => {
      return { ...prev, members: members.filter((m) => m.id !== id) };
    });
  }
};

// Function to validate a single address
const validateAddress = async (
  address: string,
  id: string,
  setFormData: SetForm
) => {
  // Skip empty or very short addresses
  if (!address || address.trim().length < 10) {
    return;
  }

  // Set validating state
  setFormData((prev) => ({
    ...prev,
    members: prev.members.map((member) =>
      member.id === id ? { ...member, isValidating: true } : member
    ),
  }));

  try {
    const result = await checkAddressNetwork(address);
    // Update member with validation results
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.id === id
          ? {
              ...member,
              isValidating: false,
              networkResult: result,
            }
          : member
      ),
    }));
  } catch (error) {
    console.error("Error validating address:", error);
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.id === id
          ? {
              ...member,
              isValidating: false,
              networkResult: null,
            }
          : member
      ),
    }));
  }
};

export const handleAddressChange = (
  id: string,
  value: string,
  setMembers: SetForm,
  members: GroupMemberShare[]
) => {
  setMembers((prev) => {
    setTimeout(() => {
      validateAddress(value, id, setMembers);
    }, 1000);
    return {
      ...prev,
      members: members.map((m) => (m.id === id ? { ...m, addr: value } : m)),
    };
  });
};

export const handlePercentageChange = (
  id: string,
  value: string,
  setMembers: SetForm,
  members: GroupMemberShare[]
) => {
  setMembers((prev) => {
    return {
      ...prev,
      members: members.map((m) =>
        m.id === id ? { ...m, percentage: Number.parseFloat(value) || 0 } : m
      ),
    };
  });
};

export const handleCSVImport = (
  event: React.ChangeEvent<HTMLInputElement>,
  setMembers: SetForm,
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
          addr: line.trim(),
          percentage: 0,
        }));

      if (addresses.length > 0) {
        setMembers((prev) => {
          return { ...prev, members: addresses };
        });
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

export const distributeEvenly = (
  members: GroupMemberShare[],
  setMembers: SetForm
) => {
  const memberCount = members.length;

  if (memberCount === 0) return;

  const basePercentage = Math.floor((100 / memberCount) * 100) / 100;
  const totalDistributed = basePercentage * memberCount;
  const remainder = Number((100 - totalDistributed).toFixed(2));

  setMembers((prev) => ({
    ...prev,
    members: prev.members.map((member, index) => ({
      ...member,
      percentage:
        index === 0
          ? Number((basePercentage + remainder).toFixed(2))
          : basePercentage,
    })),
  }));
};

export const manualDistribute = (
  members: GroupMemberShare[],
  setMembers: SetForm
) => {
  const memberCount = members.length;

  if (memberCount === 0) return;

  setMembers((prev) => ({
    ...prev,
    members: prev.members.map((member) => ({
      ...member,
      percentage: 0,
    })),
  }));
};
