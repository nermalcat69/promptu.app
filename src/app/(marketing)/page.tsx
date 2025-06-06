"use client";

import { useState, Suspense } from "react";
import { PromptGrid } from "@/components/prompt-grid";
import { PromptFilters } from "@/components/prompt-filters";
import { Sidebar } from "@/components/sidebar";

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    sort: 'recent',
    category: 'all',
  });

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div className="text-start py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Discover AI Prompts
                </h1>
                <p className="text-gray-600">
                  Find high-quality prompts for AI models, share your own creations, and connect with the community
                </p>
              </div>
              
              {/* Filters */}
              <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>}>
                <PromptFilters 
                  onFiltersChange={handleFiltersChange}
                  initialFilters={filters}
                />
              </Suspense>
              
              {/* Prompt Grid */}
              <PromptGrid filters={filters} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
