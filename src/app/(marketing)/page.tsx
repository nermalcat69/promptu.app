"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { VotingButtons } from "@/components/voting-buttons";
import { PromptFilters } from "@/components/prompt-filters";
import { SidebarFallback } from "@/components/sidebar-fallback";
import { Pagination } from "@/components/ui/pagination";

interface PromptData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  promptType: string;
  category: string;
  author: {
    id: string;
    name: string;
    image?: string;
    username?: string;
  };
  upvotes: number;
  views: number;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
}

function getPromptTypeColor(type: string) {
  switch (type) {
    case "system":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "user":
      return "bg-green-100 text-green-800 border-green-200";
    case "developer":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function Home() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    sort: 'recent',
    category: 'all',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchPrompts = useCallback(async (page: number, reset = false) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters.sort && filters.sort !== 'recent') params.set('sort', filters.sort);
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      params.set('page', page.toString());
      params.set('limit', '8');

      const response = await fetch(`/api/prompts?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        const newPrompts = data.prompts || [];
        
        setPrompts(newPrompts);
        setPagination({
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
          hasNext: data.pagination?.hasNext || false,
          hasPrev: data.pagination?.hasPrev || false,
        });
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters.search, filters.type, filters.sort, filters.category]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch prompts when filters or page changes
  useEffect(() => {
    fetchPrompts(currentPage);
  }, [fetchPrompts, currentPage]);

  // Initial load
  useEffect(() => {
    fetchPrompts(1, true);
  }, []);

  const promptsWithTokens = prompts.map(prompt => ({
    ...prompt,
    tokens: calculatePromptTokens(prompt.title, prompt.excerpt, prompt.content).tokens
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
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
              
              {/* Prompts Grid */}
              {initialLoad ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading prompts...</p>
                  </div>
                </div>
              ) : promptsWithTokens.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-8 text-center">
                    <p className="text-gray-600 mb-4">
                      No prompts found matching your criteria.
                    </p>
                    <p className="text-sm text-gray-500">Try adjusting your filters.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Desktop Table Header - Hidden on mobile/tablet */}
                  <div className="hidden lg:block border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-1">Tokens</div>
                      <div className="col-span-2">Votes</div>
                      <div className="col-span-2">Copies</div>
                    </div>
                  </div>

                  {/* Medium Screen Table Header - Hidden on mobile and desktop */}
                  <div className="hidden md:block lg:hidden border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-10 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-4">Name</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-2">Votes</div>
                      <div className="col-span-2">Copies</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {promptsWithTokens.map((prompt) => (
                      <div key={prompt.id} className="hover:bg-gray-50 transition-colors group">
                        
                        {/* Mobile Layout (< md) */}
                        <div className="block md:hidden p-4 space-y-3">
                          {/* Title */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm leading-tight flex-1">
                              <Link href={`/prompts/${prompt.slug}`}>
                                {prompt.title}
                              </Link>
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`${getPromptTypeColor(prompt.promptType)} text-xs whitespace-nowrap ml-2`}
                            >
                              {prompt.promptType}
                            </Badge>
                          </div>
                          
                          {/* Author and Stats Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={prompt.author.image} alt={prompt.author.name} />
                                <AvatarFallback className="text-xs bg-gray-100">
                                  {prompt.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">{prompt.author.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 font-mono">
                                {formatTokenCount(prompt.tokens)}
                              </span>
                              <VotingButtons 
                                promptSlug={prompt.slug}
                                size="sm"
                                showCounts={true}
                              />
                            </div>
                          </div>
                          
                          {/* Copy Count Row */}
                          <div className="flex items-center justify-end text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Copy className="h-3 w-3" />
                              <span>{prompt.copyCount || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Medium Screen Layout (md to lg) */}
                        <div className="hidden md:grid lg:hidden grid-cols-10 gap-2 px-4 py-3">
                          {/* Name Column */}
                          <div className="col-span-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                                  <Link href={`/prompts/${prompt.slug}`}>
                                    {prompt.title}
                                  </Link>
                                </h3>
                                <Badge 
                                  variant="outline" 
                                  className={`${getPromptTypeColor(prompt.promptType)} text-xs mt-1`}
                                >
                                  {prompt.promptType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Author Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={prompt.author.image} alt={prompt.author.name} />
                                <AvatarFallback className="text-xs bg-gray-100">
                                  {prompt.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600 truncate">{prompt.author.name}</span>
                            </div>
                          </div>
                          
                          {/* Votes Column */}
                          <div className="col-span-2">
                            <VotingButtons 
                              promptSlug={prompt.slug}
                              size="md"
                              showCounts={true}
                            />
                          </div>
                          
                          {/* Copies Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Copy className="h-3 w-3" />
                              <span>{prompt.copyCount || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout (lg+) */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3">
                          {/* Name Column */}
                          <div className="col-span-5">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                                  <Link href={`/prompts/${prompt.slug}`}>
                                    {prompt.title}
                                  </Link>
                                </h3>
                                <p className="text-xs text-gray-500 truncate mt-1">{prompt.excerpt}</p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`${getPromptTypeColor(prompt.promptType)} text-xs whitespace-nowrap`}
                              >
                                {prompt.promptType}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Author Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={prompt.author.image} alt={prompt.author.name} />
                                <AvatarFallback className="text-xs bg-gray-100">
                                  {prompt.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm text-gray-600 truncate block">{prompt.author.name}</span>
                                {prompt.author.username && (
                                  <Link href={`/profile/${prompt.author.username}`} className="text-xs text-blue-600 hover:text-blue-800">
                                    @{prompt.author.username}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Tokens Column */}
                          <div className="col-span-1">
                            <span className="text-sm text-gray-500 font-mono">
                              {formatTokenCount(prompt.tokens)}
                            </span>
                          </div>
                          
                          {/* Votes Column */}
                          <div className="col-span-2">
                            <VotingButtons 
                              promptSlug={prompt.slug}
                              size="md"
                              showCounts={true}
                            />
                          </div>
                          
                          {/* Copies Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Copy className="h-3 w-3" />
                              <span>{prompt.copyCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
              
              {/* Advertisement Section - Below prompts for pagination space */}
              <div className="mt-12">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Advertise with Us</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Reach thousands of AI enthusiasts and developers. Promote your AI tools, courses, or services to our engaged community.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>10K+ monthly visitors</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>High engagement rates</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Targeted AI audience</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="mailto:ads@promptu.app"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
                    >
                      Contact Us
                    </a>
                    <a 
                      href="/advertise"
                      className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SidebarFallback />
          </div>
        </div>
      </div>
    </div>
  );
}
