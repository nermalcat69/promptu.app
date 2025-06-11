import React from "react";
import Link from "next/link";
import { UserProfile } from "@/components/user-profile";
import { DashboardNavButtons } from "@/components/nav-buttons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between max-w-5xl mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold flex items-center gap-3">
              <span className="text-lg text-gray-900">Promptu</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                Dashboard
              </Link>
              <Link href="/dashboard/prompts" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                My Prompts
              </Link>
              <Link href="/dashboard/cursor-rules" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                My Cursor Rules
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <DashboardNavButtons />
            <UserProfile className="size-9" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}