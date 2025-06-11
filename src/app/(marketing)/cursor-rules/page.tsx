"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { UpvoteButton } from "@/components/upvote-button";
import { CursorRuleFilters } from "@/components/cursor-rule-filters";

interface CursorRuleData {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  ruleType: string;
  globs?: string;
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

function getRuleTypeColor(type: string) {
  switch (type) {
    case "always":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "auto-attached":
      return "bg-green-100 text-green-800 border-green-200";
    case "agent-requested":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "manual":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function CursorRulesPage() {
  const [cursorRules, setCursorRules] = useState<CursorRuleData[]>([]);
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

  const fetchCursorRules = useCallback(async (page: number, reset = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters.sort && filters.sort !== 'recent') params.set('sort', filters.sort);
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      params.set('page', page.toString());
      params.set('limit', '10');

      const response = await fetch(`/api/cursor-rules?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        const newRules = data.cursorRules || [];
        
        if (reset) {
          setCursorRules(newRules);
        } else {
          setCursorRules(prev => [...prev, ...newRules]);
        }
        
        setHasMore(data.pagination?.hasMore || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching cursor rules:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters.search, filters.type, filters.sort, filters.category, loading]);

  // Load more rules when scrolling to bottom
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchCursorRules(currentPage + 1);
    }
  }, [hasMore, loading, currentPage, fetchCursorRules]);

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
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  // Watch for filter changes and fetch rules
  useEffect(() => {
    if (!initialLoad) {
      fetchCursorRules(1, true);
    }
  }, [filters.search, filters.type, filters.sort, filters.category]);

  // Initial load
  useEffect(() => {
    fetchCursorRules(1, true);
  }, []);

  const handleCopyRule = async (rule: CursorRuleData) => {
    try {
      await navigator.clipboard.writeText(rule.content);
      // Increment copy count
      await fetch(`/api/cursor-rules/${rule.slug}/copy`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cursor Rules
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover configuration files and settings for AI-assisted coding environments like Cursor.
            </p>
          </div>
          
          {/* Filters */}
          <Suspense fallback={
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="relative">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mt-4">
                  <div className="h-10 bg-gray-200 rounded w-full lg:w-auto"></div>
                  <div className="flex gap-3 w-full lg:w-auto">
                    <div className="h-10 bg-gray-200 rounded w-full lg:w-[180px]"></div>
                    <div className="h-10 bg-gray-200 rounded w-full lg:w-[180px]"></div>
                  </div>
                </div>
              </div>
            </div>
          }>
            <CursorRuleFilters 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          </Suspense>

          {/* Loading State */}
          {initialLoad ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden lg:block border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-11 gap-4 px-4 py-3">
                  <div className="col-span-5 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Medium Screen Table Header */}
              <div className="hidden md:block lg:hidden border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-9 gap-4 px-4 py-3">
                  <div className="col-span-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Skeleton Rows */}
              <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    {/* Mobile Layout Skeleton */}
                    <div className="block md:hidden p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-12 bg-gray-200 rounded"></div>
                          <div className="h-6 w-12 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout Skeleton */}
                    <div className="hidden lg:grid grid-cols-11 gap-4 px-4 py-3">
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                          <div className="h-3 w-full bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                        <div className="space-y-1">
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                          <div className="h-3 w-12 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      </div>
                      <div className="col-span-2">
                        <div className="h-6 w-12 bg-gray-200 rounded"></div>
                      </div>
                      <div className="col-span-1">
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : cursorRules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No cursor rules found matching your criteria.
              </p>
              <p className="text-sm text-gray-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden lg:block border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-11 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-1">Tokens</div>
                  <div className="col-span-2">Votes</div>
                  <div className="col-span-1">Copies</div>
                </div>
              </div>

              {/* Medium Screen Table Header */}
              <div className="hidden md:block lg:hidden border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-9 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-2">Votes</div>
                  <div className="col-span-1">Copies</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {cursorRules.map((rule) => {
                  const tokens = calculatePromptTokens(rule.title, rule.description, rule.content).tokens;
                  
                  return (
                    <div key={rule.id} className="hover:bg-gray-50 transition-colors group">
                      
                      {/* Mobile Layout (< md) */}
                      <div className="block md:hidden p-4 space-y-3">
                        {/* Title */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm leading-tight flex-1">
                            <Link href={`/cursor-rules/${rule.slug}`}>
                              {rule.title}
                            </Link>
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`${getRuleTypeColor(rule.ruleType)} text-xs whitespace-nowrap ml-2`}
                          >
                            {rule.ruleType.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        {/* Description */}
                        <p className="text-xs text-gray-500 line-clamp-2">{rule.description}</p>
                        
                        {/* Globs */}
                        {rule.globs && (
                          <Badge variant="outline" className="text-xs">
                            {rule.globs}
                          </Badge>
                        )}
                        
                        {/* Author and Stats Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={rule.author?.image || undefined} alt={rule.author?.name || 'Unknown'} />
                              <AvatarFallback className="text-xs bg-gray-100">
                                {rule.author?.name ? rule.author.name.split(' ').map(n => n[0]).join('') : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{rule.author?.name || 'Unknown'}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-mono">
                              {formatTokenCount(tokens)}
                            </span>
                            <UpvoteButton 
                              promptSlug={rule.slug}
                              initialUpvotes={rule.upvotes || 0}
                              contentType="cursor-rule"
                            />
                          </div>
                        </div>
                        
                        {/* Copy Count Row */}
                        <div className="flex items-center justify-end text-sm text-gray-500">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyRule(rule)}
                            className="flex items-center gap-1 h-auto p-1"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{rule.copyCount || 0}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Medium Screen Layout (md to lg) */}
                      <div className="hidden md:grid lg:hidden grid-cols-9 gap-2 px-4 py-3">
                        {/* Name Column */}
                        <div className="col-span-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                                <Link href={`/cursor-rules/${rule.slug}`}>
                                  {rule.title}
                                </Link>
                              </h3>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`${getRuleTypeColor(rule.ruleType)} text-xs`}
                                >
                                  {rule.ruleType.replace('-', ' ')}
                                </Badge>
                                {rule.globs && (
                                  <Badge variant="outline" className="text-xs">
                                    {rule.globs}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Author Column */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={rule.author?.image || undefined} alt={rule.author?.name || 'Unknown'} />
                              <AvatarFallback className="text-xs bg-gray-100">
                                {rule.author?.name ? rule.author.name.split(' ').map(n => n[0]).join('') : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600 truncate">{rule.author?.name || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        {/* Votes Column */}
                        <div className="col-span-2">
                          <UpvoteButton 
                            promptSlug={rule.slug}
                            initialUpvotes={rule.upvotes || 0}
                            contentType="cursor-rule"
                          />
                        </div>
                        
                        {/* Copies Column */}
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyRule(rule)}
                            className="flex items-center gap-1 text-sm text-gray-500 h-auto p-1"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{rule.copyCount || 0}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Desktop Layout (lg+) */}
                      <div className="hidden lg:grid grid-cols-11 gap-4 px-4 py-3">
                        {/* Name Column */}
                        <div className="col-span-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                                <Link href={`/cursor-rules/${rule.slug}`}>
                                  {rule.title}
                                </Link>
                              </h3>
                              <p className="text-xs text-gray-500 truncate mt-1">{rule.description}</p>
                              {rule.globs && (
                                <p className="text-xs text-blue-600 truncate mt-1">Files: {rule.globs}</p>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${getRuleTypeColor(rule.ruleType)} text-xs whitespace-nowrap`}
                            >
                              {rule.ruleType.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Author Column */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={rule.author?.image || undefined} alt={rule.author?.name || 'Unknown'} />
                              <AvatarFallback className="text-xs bg-gray-100">
                                {rule.author?.name ? rule.author.name.split(' ').map(n => n[0]).join('') : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <span className="text-sm text-gray-600 truncate block">{rule.author?.name || 'Unknown'}</span>
                              {rule.author?.username && (
                                <Link href={`/profile/${rule.author.username}`} className="text-xs text-blue-600 hover:text-blue-800">
                                  @{rule.author.username}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Tokens Column */}
                        <div className="col-span-1">
                          <span className="text-sm text-gray-500 font-mono">
                            {formatTokenCount(tokens)}
                          </span>
                        </div>
                        
                        {/* Votes Column */}
                        <div className="col-span-2">
                          <UpvoteButton 
                            promptSlug={rule.slug}
                            initialUpvotes={rule.upvotes || 0}
                            contentType="cursor-rule"
                          />
                        </div>
                        
                        {/* Copies Column */}
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyRule(rule)}
                            className="flex items-center gap-1 text-sm text-gray-500 h-auto p-1"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{rule.copyCount || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading indicator for infinite scroll */}
          {!initialLoad && hasMore && (
            <div ref={loadingRef} className="flex justify-center py-8">
              {loading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-gray-600">Loading more cursor rules...</span>
                </div>
              )}
            </div>
          )}

          {/* End of results */}
          {!initialLoad && !hasMore && cursorRules.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of the cursor rules!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 