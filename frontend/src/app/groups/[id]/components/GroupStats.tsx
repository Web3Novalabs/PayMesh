import Groups from "@/components/icons/group";
import Remaining from "@/components/icons/remaining";
import CalendarIcon from "@/components/icons/calendar";

interface TokenBalance {
  formatted?: string;
  symbol?: string;
  value: bigint;
  decimals: number;
}

interface GroupStatsProps {
  balances: {
    usdc?: TokenBalance;
    usdt?: TokenBalance;
    eth?: TokenBalance;
    generic?: TokenBalance;
  };
  memberCount: number;
  createdAt: string;
  usageRemaining: string;
}

const GroupStats = ({
  balances,
  memberCount,
  createdAt,
  usageRemaining,
}: GroupStatsProps) => {
  return (
    <>
      <div className="px-6 py-4 flex flex-col md:flex-row flex-wrap gap-6 md:items-center justify-between">
        <div className="flex items-center space-x-2 border-gradient-modal border border-[#232542] w-fit rounded-full py-2.5 px-4">
          <h3 className="text-[#8398AD] border-r border-[#8398AD] pr-2">
            Amount
          </h3>
          <span className="text-[#E2E2E2] text-sm">
            {balances.usdc?.formatted
              ? Number.parseFloat(balances.usdc.formatted).toFixed(2)
              : "0.00"}{" "}
            {balances.usdc?.symbol}
          </span>
          {balances.generic?.formatted && +balances.generic?.formatted > 0 && (
            <span className="text-[#E2E2E2] text-sm ml-2">
              {balances.generic?.formatted
                ? Number.parseFloat(balances.generic.formatted).toFixed(2)
                : "0.00"}{" "}
              {balances.generic?.symbol}
            </span>
          )}
          {balances.usdt?.formatted && +balances.usdt?.formatted > 0 && (
            <span className="text-[#E2E2E2] text-sm ml-2">
              {balances.usdt?.formatted
                ? Number.parseFloat(balances.usdt.formatted).toFixed(2)
                : "0.00"}{" "}
              {balances.usdt?.symbol}
            </span>
          )}
          {balances.eth?.formatted && +balances.eth?.formatted > 0 && (
            <span className="text-[#E2E2E2] text-sm ml-2">
              {balances.eth?.formatted
                ? Number.parseFloat(balances.eth.formatted).toFixed(2)
                : "0.00"}{" "}
              {balances.eth?.symbol}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
          <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D] flex-shrink-0">
            <Groups />
          </span>

          <div className="text-[#8398AD] text-sm flex flex-col md:items-center justify-center">
            <span className="text-[#8398AD] font-semibold">Members</span>
            <span className="text-[#DFDFE0] font-semibold">{memberCount}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
          <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D] flex-shrink-0">
            <CalendarIcon />
          </span>

          <div className="text-[#8398AD] text-sm flex flex-col justify-center">
            <span className="text-[#8398AD] font-semibold">Date Created:</span>
            <span className="text-[#DFDFE0] font-semibold">
              {createdAt
                ? new Date(createdAt).toLocaleDateString()
                : "Loading..."}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 gap-2 w-full sm:w-auto">
          <span className="flex items-center gap-2 p-3 rounded-full bg-[#FFFFFF05] border border-[#FFFFFF0D] flex-shrink-0">
            <Remaining />
          </span>

          <div className="text-[#8398AD] md:text-center text-sm flex flex-col justify-center">
            <span className="text-[#8398AD] font-semibold">
              Remaining Usage
            </span>
            <span className="text-[#DFDFE0] font-semibold">
              {usageRemaining || "0"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupStats;
