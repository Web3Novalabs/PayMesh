"use client";

import WalletGuard from "@/components/WalletGuard";

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletGuard>{children}</WalletGuard>;
}
