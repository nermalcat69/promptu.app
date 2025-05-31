import React from "react";
import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import RootProviders from "@/components/providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fontHeading = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Promptu - Discover, Share & Find AI Prompts",
  description: "The ultimate marketplace for AI prompts. Find system prompts, user prompts, and developer prompts for all your AI needs. Join our community of prompt creators and discover high-quality prompts for every use case.",
  keywords: ["AI prompts", "system prompts", "user prompts", "developer prompts", "AI marketplace", "prompt sharing", "artificial intelligence"],
  authors: [{ name: "Promptu Team" }],
  creator: "Promptu",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://promptu.app",
    title: "Promptu - Discover, Share & Find AI Prompts",
    description: "The ultimate marketplace for AI prompts. Find system prompts, user prompts, and developer prompts for all your AI needs.",
    siteName: "Promptu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Promptu - Discover, Share & Find AI Prompts",
    description: "The ultimate marketplace for AI prompts. Find system prompts, user prompts, and developer prompts for all your AI needs.",
    creator: "@promptu_app",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
          fontMono.variable
        )}
      >
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
