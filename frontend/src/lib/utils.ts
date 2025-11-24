import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string) {
  if (!address || address.length < 10) return address;
  return address.slice(0, 6) + "..." + address.slice(-4);
}

export async function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  onError?: (error: unknown) => void
) {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch (err) {
    console.error("Failed to copy: ", err);
    onError?.(err);
  }
}

export function formatAmountUsdc(amount: string | number) {
  return (Number(amount) / 1e6).toFixed(2);
}
