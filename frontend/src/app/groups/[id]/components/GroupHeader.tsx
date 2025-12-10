import { Copy } from "lucide-react";
import { formatAddress } from "@/utils/helpers";

interface GroupHeaderProps {
  groupName: string;
  groupAddress: string;
  isCreator: boolean;
  onCopyAddress: (text: string) => void;
}

const GroupHeader = ({
  groupName,
  groupAddress,
  isCreator,
  onCopyAddress,
}: GroupHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between flex-col px-6 sm:flex-row gap-4 border-b border-[#232542] py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-[#E2E2E2] font-semibold text-base leading-tight">
            {groupName || "Loading..."}
          </h2>
          <span
            className={`py-1.5 px-3 rounded-full ${
              isCreator
                ? "bg-blue-btn text-blue-text"
                : "bg-[#103E3A] text-[#00E69D]"
            }`}
          >
            {isCreator ? "Creator" : "Member"}
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-[#0C121D] py-2 px-5 rounded-full">
          <h3 className="text-[#8398AD] text-base border-r border-[#8398AD] pr-2">
            Group address
          </h3>

          <span className="md:hidden text-white">
            {formatAddress(groupAddress)}
          </span>
          <span className="hidden md:block text-white break-all">
            {groupAddress}
          </span>

          <Copy
            className="w-4 h-4 text-[#8398AD] cursor-pointer"
            onClick={() => onCopyAddress(groupAddress)}
          />
        </div>
      </div>
    </>
  );
};

export default GroupHeader;
