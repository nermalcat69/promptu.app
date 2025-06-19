"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, MessageCircle, Copy } from "lucide-react";
import Link from "next/link";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { useDebouncedCallback } from "use-debounce";
import { UpvoteButton } from "@/components/upvote-button";

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

interface PromptGridProps {
  filters?: {
    search: string;
    type: string;
    sort: string;
    category: string;
  };
  currentPage?: number;
  limit?: number;
  onPaginationUpdate?: (pagination: {
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }) => void;
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

export function PromptGrid({ filters, currentPage = 1, limit = 12, onPaginationUpdate }: PromptGridProps) {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters from filters
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters?.sort && filters.sort !== 'recent') params.set('sort', filters.sort);
      if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());

      const url = `/api/prompts?${params.toString()}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
        
        // Update pagination info in parent
        if (onPaginationUpdate && data.pagination) {
          onPaginationUpdate({
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
            hasNext: data.pagination.hasNext,
            hasPrev: data.pagination.hasPrev,
          });
        }
              } else {
        setError('Failed to fetch prompts');
      }
    } catch (error) {
      setError('Failed to fetch prompts');
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.type, filters?.sort, filters?.category, currentPage, limit, onPaginationUpdate]);

  // Debounce search requests to avoid excessive API calls
  const debouncedFetchPrompts = useDebouncedCallback(fetchPrompts, 300);

  useEffect(() => {
    // For search, use debounced version. For other filters, fetch immediately
    if (filters?.search) {
      debouncedFetchPrompts();
    } else {
      fetchPrompts();
    }
  }, [filters?.search, filters?.type, filters?.sort, filters?.category, currentPage, fetchPrompts, debouncedFetchPrompts]);

  // Since we're using server-side pagination and filtering, use prompts directly
  const sortedPrompts = prompts;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prompts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPrompts} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (sortedPrompts.length === 0) {
    const hasFilters = filters?.search || (filters?.type && filters?.type !== 'all') || (filters?.category && filters?.category !== 'all');
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-4">
            {hasFilters ? 'No prompts match your filters.' : 'No prompts available yet.'}
          </p>
          {hasFilters ? (
            <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
          ) : (
            <Button asChild>
              <Link href="/sign-in">Sign in to create the first prompt</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Calculate tokens for each prompt
  const promptsWithTokens = sortedPrompts.map(prompt => ({
    ...prompt,
    tokens: calculatePromptTokens(prompt.title, prompt.excerpt, prompt.content).tokens
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Results count */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          {promptsWithTokens.length} prompt{promptsWithTokens.length !== 1 ? 's' : ''} found
          {filters?.search && (
            <span> for "{filters.search}"</span>
          )}
        </p>
      </div>

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
                    className="flex-shrink-0"
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
  );
} 