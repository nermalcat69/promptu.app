"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { UpvoteButton } from "@/components/upvote-button";
import { PromptFilters } from "@/components/prompt-filters";

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

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    sort: 'recent',
    category: 'all',
  });
  const [initialLoad, setInitialLoad] = useState(true);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const fetchPrompts = useCallback(async (page: number, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters.sort && filters.sort !== 'recent') params.set('sort', filters.sort);
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await fetch(`/api/prompts?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        const newPrompts = data.prompts || [];
        
        if (reset) {
          setPrompts(newPrompts);
        } else {
          setPrompts(prev => [...prev, ...newPrompts]);
        }
        
        setHasMore(data.pagination?.hasNext || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, loading]);

  // Load more prompts when scrolling to bottom
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPrompts(currentPage + 1);
    }
  }, [hasMore, loading, currentPage, fetchPrompts]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loadingRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );
      
      observerRef.current.observe(loadingRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
    fetchPrompts(1, true);
  };

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
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              All AI Prompts
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our complete collection of AI prompts. Use filters to find exactly what you need.
            </p>
          </div>
          
          {/* Filters */}
          <Suspense fallback={
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          }>
            <PromptFilters 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </Suspense>
          


          {/* Prompts Grid */}
          {initialLoad ? (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-gray-600">Loading prompts...</span>
              </div>
            </div>
          ) : promptsWithTokens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No prompts found matching your criteria.
              </p>
              <p className="text-sm text-gray-500">Try adjusting your filters.</p>
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
                                                     <UpvoteButton 
                             promptSlug={prompt.slug}
                             initialUpvotes={prompt.upvotes || 0}
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
                         <UpvoteButton 
                           promptSlug={prompt.slug}
                           initialUpvotes={prompt.upvotes || 0}
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
                         <UpvoteButton 
                           promptSlug={prompt.slug}
                           initialUpvotes={prompt.upvotes || 0}
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

           {/* Loading indicator for infinite scroll */}
          {!initialLoad && hasMore && (
            <div ref={loadingRef} className="flex justify-center py-8">
              {loading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-gray-600">Loading more prompts...</span>
                </div>
              )}
            </div>
          )}

          {/* End of results */}
          {!initialLoad && !hasMore && promptsWithTokens.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of the prompts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 