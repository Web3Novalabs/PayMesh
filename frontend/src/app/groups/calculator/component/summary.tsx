interface SummaryProps {
  total: number;
  allocated: number;
  remaining: number;
  remainingPercent: number| string;
}

export default function Summary({
  total,
  allocated,
  remaining,
  remainingPercent,
}: SummaryProps) {
  return (
    <div className="text-white md:p-8 pt-0  grid gap-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 md:py-2.5 border-b-2 border-gray-100">
          <span className="text-sm md:text-base font-semibold">
            Total Tokens:
          </span>
          <span className="text-base md:text-lg font-bold text-gray-900">
            {total.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 md:py-2.5 border-b-2 border-gray-100">
          <span className="text-sm md:text-base font-semibold">Allocated:</span>
          <span className="text-base md:text-lg font-bold text-[#00E69D]">
            {allocated.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 md:py-2.5">
          <span className="text-sm md:text-base font-semibold">Remaining:</span>
          <div className="text-right">
            <p className="text-base md:text-lg font-bold text-[#0073E6]">
              {remaining.toLocaleString()}
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {remainingPercent}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
