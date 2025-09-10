import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string) {
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
