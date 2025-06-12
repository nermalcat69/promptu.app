"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatTokenCount } from "@/lib/token-calculator";
import { UpvoteButton } from "@/components/upvote-button";
import { useSearchParams } from "next/navigation";

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
  tokens: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PromptsClientListProps {
  initialData: PromptData[];
  initialPagination: Pagination;
  initialFilters: {
    search: string;
    type: string;
    sort: string;
    category: string;
  };
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

export function PromptsClientList({
  initialData,
  initialPagination,
  initialFilters,
}: PromptsClientListProps) {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialPagination);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Reset when filters change
  useEffect(() => {
    const newFilters = {
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || 'all',
      sort: searchParams.get('sort') || 'recent',
      category: searchParams.get('category') || 'all',
    };

    // Check if filters actually changed
    const filtersChanged = 
      newFilters.search !== currentFilters.search ||
      newFilters.type !== currentFilters.type ||
      newFilters.sort !== currentFilters.sort ||
      newFilters.category !== currentFilters.category;

    if (filtersChanged) {
      setCurrentFilters(newFilters);
      setPrompts([]); // Clear existing prompts when filters change
      setPagination({ ...initialPagination, page: 1, hasNext: true });
    }
  }, [searchParams, currentFilters, initialPagination]);

  const fetchMorePrompts = useCallback(async () => {
    if (loading || !pagination.hasNext) return;
    
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.type && currentFilters.type !== 'all') params.set('type', currentFilters.type);
      if (currentFilters.sort && currentFilters.sort !== 'recent') params.set('sort', currentFilters.sort);
      if (currentFilters.category && currentFilters.category !== 'all') params.set('category', currentFilters.category);
      params.set('page', (pagination.page + 1).toString());
      params.set('limit', '12');

      const response = await fetch(`/api/prompts?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        const newPrompts = data.prompts || [];
        
        setPrompts(prev => [...prev, ...newPrompts]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching more prompts:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, pagination, currentFilters]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loadingRef.current && pagination.hasNext) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchMorePrompts();
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
  }, [fetchMorePrompts, pagination.hasNext]);

  // Show additional prompts only if we have them
  if (prompts.length === 0 && !loading) {
    return null;
  }

  return (
    <>
      {/* Additional Prompts from Infinite Scroll */}
      {prompts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {prompts.map((prompt) => (
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
                        <AvatarImage src={prompt.author.image || undefined} alt={prompt.author.name} />
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
                        <AvatarImage src={prompt.author.image || undefined} alt={prompt.author.name} />
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
                        <AvatarImage src={prompt.author.image || undefined} alt={prompt.author.name} />
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
      {pagination.hasNext && (
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
      {!pagination.hasNext && prompts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">You've reached the end of the prompts!</p>
        </div>
      )}
    </>
  );
} 