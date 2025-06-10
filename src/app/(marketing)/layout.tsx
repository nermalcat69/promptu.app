"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MarketingNavButtons } from "@/components/nav-buttons";
import { UserProfile } from "@/components/user-profile";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const [showTimeout, setShowTimeout] = useState(false);

  // Simple timeout to prevent infinite loading
  useEffect(() => {
    if (session.isPending) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [session.isPending]);

  const shouldShowLoading = session.isPending && !showTimeout;
  const isAuthenticated = !!session.data?.user;

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
              <header className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between max-w-5xl mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold flex items-center gap-3">
              <span className="text-lg text-gray-900">Promptu</span>
            </Link>
            <nav className="hidden text-sm md:flex gap-6">
              <Link href="/prompts" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Browse All
              </Link>
              <Link href="/prompt-guide" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Prompt Guide
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                About
              </Link>
              <Link href="https://discord.gg/WJDaqEdJRC" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Discord
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {shouldShowLoading ? (
              // Show loading state while checking authentication
              <div className="w-16 h-8 bg-gray-100 animate-pulse rounded" />
            ) : isAuthenticated ? (
              // Show authenticated user navigation
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                <UserProfile className="size-9" />
              </>
            ) : (
              // Show unauthenticated user navigation
              <MarketingNavButtons />
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <PromptLogo />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                The Website for you to find AI prompts. Discover, share, and find high-quality prompts for all your AI needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Prompts</Link></li>
                <li><Link href="/trending" className="text-gray-600 hover:text-gray-900 transition-colors">Trending</Link></li>
                <li><Link href="/submit" className="text-gray-600 hover:text-gray-900 transition-colors">Submit Prompt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://discord.gg/WJDaqEdJRC" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Join Discord
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Promptu. All rights reserved. Made with ❤️ for the AI community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const PromptLogo = () => {
  return (
    <div className="group relative">
      <div className="w-8 h-8 flex items-center justify-center group-hover:opacity-80 transition-opacity">
        <svg 
          width="24" 
          height="32" 
          viewBox="0 0 202 269" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-900"
        >
          <path 
            d="M86.5987 262.498L87.749 136.944C87.9077 119.609 105.474 103.225 126.985 100.35C148.497 97.4747 165.808 109.197 165.648 126.533L164.781 221.352" 
            stroke="currentColor" 
            strokeWidth="12" 
            strokeLinecap="round"
          />
          <path 
            d="M87.5573 169.161C87.8914 132.642 8.85235 101.758 9.1865 65.2393C9.34588 47.9033 26.9127 31.5195 48.4245 28.644L49.2355 28.536C70.7473 25.6604 88.0575 37.3827 87.8981 54.7185L87.5573 169.161Z" 
            stroke="currentColor" 
            strokeWidth="12" 
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};