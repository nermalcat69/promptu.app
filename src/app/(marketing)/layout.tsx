import React from "react";
import Link from "next/link";
import { MarketingNavButtons } from "@/components/nav-buttons";
import { UserProfile } from "@/components/user-profile";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold flex items-center gap-3">
              <PromptLogo />
              <span className="text-xl text-gray-900">Promptu</span>
            </Link>
            <nav className="hidden text-sm md:flex gap-6">
              <Link href="/prompts" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Browse Prompts
              </Link>
              <Link href="/categories" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Categories
              </Link>
              <Link href="/advertise" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Advertise
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <MarketingNavButtons />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <PromptLogo />
                <h3 className="font-bold text-xl text-gray-900">Promptu</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                The ultimate marketplace for AI prompts. Discover, share, and find high-quality prompts for all your AI needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/prompts" className="text-gray-600 hover:text-gray-900 transition-colors">Browse Prompts</Link></li>
                <li><Link href="/categories" className="text-gray-600 hover:text-gray-900 transition-colors">Categories</Link></li>
                <li><Link href="/trending" className="text-gray-600 hover:text-gray-900 transition-colors">Trending</Link></li>
                <li><Link href="/featured" className="text-gray-600 hover:text-gray-900 transition-colors">Featured</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Community</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signin" className="text-gray-600 hover:text-gray-900 transition-colors">Join Community</Link></li>
                <li><Link href="/submit" className="text-gray-600 hover:text-gray-900 transition-colors">Submit Prompt</Link></li>
                <li><Link href="/discord" target="_blank" className="text-gray-600 hover:text-gray-900 transition-colors">Discord</Link></li>
                <li><Link href="/advertise" className="text-gray-600 hover:text-gray-900 transition-colors">Advertise</Link></li>
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
      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            d="M8 9h8M8 13h6M8 17h4M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};