import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StarknetProvider } from "./providers/StarknetProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PAYMESH",
  description: "An automated group payment on starknet",
  keywords: [
    "decentralized security",
    "paymesh",
    "payment",
    "security",
    "automated rewards",
    "trustless",
    "Web3 payment",
    "crypto payment",
  ],
  openGraph: {
    title: "PAYMESH - An automated group payment on starknet",
    description:
      "Paymesh automates group payment distribution using Starknet smart contracts. Create a group, set wallet addresses with specific percentages, and any payment sent to your group address automatically splits and distributes funds instantly,",
    url: "/",
    siteName: "paymesh",
    images: [
      {
        url: "../../public/WhatsApp Image 2025-08-24 at 22.16.46.jpeg",
        width: 1200,
        height: 630,
        alt: "paymesh - Decentralized Payment Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PAYMESH - An automated group payment on starknet",
    description:
      "Paymesh automates group payment distribution using Starknet smart contracts. Create a group, set wallet addresses with specific percentages, and any payment sent to your group address automatically splits and distributes funds instantly,",
    images: ["../../public/Logo (1).svg"],
    creator: "@paymeshglobal",
  },

  icons: {
    icon: [
      { url: "/Group 1.svg" },
      {
        url: "/Group 1.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        url: "/Group 1.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/Group 1.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <StarknetProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#434672",
                color: "#E2E2E2",
                border: "1px solid #755A5A",
              },
            }}
          />
        </StarknetProvider>
      </body>
    </html>
  );
}
