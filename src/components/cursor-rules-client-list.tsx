"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatTokenCount } from "@/lib/token-calculator";
import { UpvoteButton } from "@/components/upvote-button";
import { useSearchParams } from "next/navigation";

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

interface CursorRulesClientListProps {
  initialData: CursorRuleData[];
  initialPagination: Pagination;
  initialFilters: {
    search: string;
    type: string;
    sort: string;
    category: string;
  };
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

export function CursorRulesClientList({
  initialData,
  initialPagination,
  initialFilters,
}: CursorRulesClientListProps) {
  const [rules, setRules] = useState<CursorRuleData[]>([]);
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
      setRules([]); // Clear existing rules when filters change
      setPagination({ ...initialPagination, page: 1, hasNext: true });
    }
  }, [searchParams, currentFilters, initialPagination]);

  const fetchMoreRules = useCallback(async () => {
    if (loading || !pagination.hasNext) return;
    
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.type && currentFilters.type !== 'all') params.set('type', currentFilters.type);
      if (currentFilters.sort && currentFilters.sort !== 'recent') params.set('sort', currentFilters.sort);
      if (currentFilters.category && currentFilters.category !== 'all') params.set('category', currentFilters.category);
      params.set('page', (pagination.page + 1).toString());
      params.set('limit', '10');

      const response = await fetch(`/api/cursor-rules?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        const newRules = data.cursorRules || [];
        
        setRules(prev => [...prev, ...newRules]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching more cursor rules:', error);
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
            fetchMoreRules();
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
  }, [fetchMoreRules, pagination.hasNext]);

  const handleCopyRule = async (rule: CursorRuleData) => {
    try {
      await navigator.clipboard.writeText(rule.content);
      // Increment copy count
      await fetch(`/api/cursor-rules/${rule.slug}/copy`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Show additional rules only if we have them
  if (rules.length === 0 && !loading) {
    return null;
  }

  return (
    <>
      {/* Additional Rules from Infinite Scroll */}
      {rules.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link href={`/cursor-rules/${rule.slug}`}>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors mb-1">
                      {rule.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {rule.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge 
                    variant="outline" 
                    className={`${getRuleTypeColor(rule.ruleType)} text-xs whitespace-nowrap`}
                  >
                    {rule.ruleType}
                  </Badge>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={rule.author.image || undefined} alt={rule.author.name} />
                      <AvatarFallback className="text-xs bg-gray-100">
                        {rule.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{rule.author.name}</span>
                  </div>
                  <span className="font-mono">
                    {formatTokenCount(rule.tokens)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <UpvoteButton 
                    promptSlug={rule.slug}
                    initialUpvotes={rule.upvotes || 0}
                  />
                  <div className="flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    <span>{rule.copyCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Globs info if present */}
              {rule.globs && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">File patterns:</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {rule.globs}
                  </code>
                </div>
              )}

              {/* Content Preview */}
              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4 overflow-hidden">
                  {rule.content}
                </pre>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/cursor-rules/${rule.slug}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details →
                </Link>
                <button
                  onClick={() => handleCopyRule(rule)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy Rule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {pagination.hasNext && (
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
      {!pagination.hasNext && rules.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">You've reached the end of the cursor rules!</p>
        </div>
      )}
    </>
  );
} 