type UsdFormatOptions = {
  decimals?: number;
};

export function formatAmountUsd(
  amount: number,
  options: UsdFormatOptions = {}
): string {
  const {decimals = 0 } = options;

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `$${formatted}`;
}
