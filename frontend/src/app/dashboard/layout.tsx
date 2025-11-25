import React from "react";
import DashboardNav from "./DashboardNav";
import MainGroupLinks from "./MainGroupLinks";
import StickyNav from "./components/StickyNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#030407] to-[#111827]  md:px-24 md:py-5 px-5 py-4 ">
      <div>
        <DashboardNav />
        <MainGroupLinks />
      </div>
      <div>{children}</div>

      <StickyNav />
    </main>
  );
}
