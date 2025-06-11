"use client";

import { useState, useEffect, useCallback } from "react";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { VotingButtons } from "@/components/voting-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SidebarFallback } from "@/components/sidebar-fallback";

// Helper function for prompt type colors
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

// Helper function for cursor rule type colors
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

// Define types
interface PromptData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  promptType: string;
  upvotes: number;
  views: number;
  copyCount: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tokens?: number;
}

interface CursorRuleData {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  ruleType: string;
  globs?: string;
  upvotes: number;
  views: number;
  copyCount: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
  category: string | null;
  tokens?: number;
}

// Unified content interface
interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  type: 'prompt' | 'cursor-rule';
  itemType: string; // promptType or ruleType
  upvotes: number;
  views: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    username: string | null;
  };
  category: string | null;
  tokens: number;
  globs?: string;
}

// Helper functions for unified content
function getContentTypeColor(item: ContentItem) {
  if (item.type === 'prompt') {
    return getPromptTypeColor(item.itemType);
  } else {
    return getRuleTypeColor(item.itemType);
  }
}

function getContentLink(item: ContentItem) {
  return item.type === 'prompt' ? `/prompts/${item.slug}` : `/cursor-rules/${item.slug}`;
}

function getContentTypeLabel(item: ContentItem) {
  return item.type === 'prompt' ? item.itemType : item.itemType;
}

export default function Home() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchTopContent = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch top 5 prompts and top 5 cursor rules
      const [promptsResponse, cursorRulesResponse] = await Promise.all([
        fetch('/api/prompts?sort=upvotes&page=1&limit=5'),
        fetch('/api/cursor-rules?sort=upvotes&page=1&limit=5')
      ]);

      const mixedContent: ContentItem[] = [];

      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json();
        const prompts = promptsData.prompts || [];
        
        prompts.forEach((prompt: PromptData) => {
          const tokens = calculatePromptTokens(prompt.title, prompt.excerpt, prompt.content).tokens;
          mixedContent.push({
            id: prompt.id,
            title: prompt.title,
            slug: prompt.slug,
            description: prompt.excerpt,
            content: prompt.content,
            type: 'prompt',
            itemType: prompt.promptType,
            upvotes: prompt.upvotes,
            views: prompt.views,
            createdAt: prompt.createdAt,
            author: prompt.author,
            category: prompt.category?.name || null,
            tokens
          });
        });
      }

      if (cursorRulesResponse.ok) {
        const cursorRulesData = await cursorRulesResponse.json();
        const cursorRules = cursorRulesData.cursorRules || [];
        
        cursorRules.forEach((rule: CursorRuleData) => {
          const tokens = calculatePromptTokens(rule.title, rule.description, rule.content).tokens;
          mixedContent.push({
            id: rule.id,
            title: rule.title,
            slug: rule.slug,
            description: rule.description,
            content: rule.content,
            type: 'cursor-rule',
            itemType: rule.ruleType,
            upvotes: rule.upvotes,
            views: rule.views,
            createdAt: rule.createdAt,
            author: rule.author,
            category: rule.category,
            tokens,
            globs: rule.globs
          });
        });
      }

      // Sort by upvotes (highest first) and take top 10
      mixedContent.sort((a, b) => b.upvotes - a.upvotes);
      setContent(mixedContent.slice(0, 10));
      
    } catch (error) {
      console.error('Error fetching top content:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTopContent();
  }, [fetchTopContent]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
      {/* Main Content */}
          <div className="lg:col-span-3">
        <div className="space-y-6">
          <div className="text-start py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Discover AI Prompts & Cursor Rules
            </h1>
                <p className="text-gray-600">
                  Find high-quality prompts for AI models, configuration rules for Cursor, and share your own creations with the community.
            </p>
          </div>
          
              {/* Top Content */}
              {loading && initialLoad ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading top content...</p>
                  </div>
                </div>
              ) :
              content.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-8 text-center">
                    <p className="text-gray-600 mb-4">
                      No content found.
                    </p>
                    <p className="text-sm text-gray-500">Check back later for new prompts and cursor rules.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Desktop Table Header - Hidden on mobile/tablet */}
                  <div className="hidden lg:block border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-11 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-1">Tokens</div>
                      <div className="col-span-2">Votes</div>
                    </div>
                  </div>

                  {/* Medium Screen Table Header - Hidden on mobile and desktop */}
                  <div className="hidden md:block lg:hidden border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-9 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-2">Votes</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {content.map((item) => (
                      <div key={item.id} className="hover:bg-gray-50 transition-colors group">
                        
                        {/* Mobile Layout (< md) */}
                        <div className="block md:hidden p-4 space-y-3">
                          {/* Title */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm leading-tight flex-1">
                              <Link href={getContentLink(item)}>
                                {item.title}
                              </Link>
                            </h3>
                            <div className="flex flex-col gap-1 items-end">
                              <Badge 
                                variant="outline" 
                                className={`${getContentTypeColor(item)} text-xs whitespace-nowrap`}
                              >
                                {getContentTypeLabel(item)}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs whitespace-nowrap bg-gray-50 text-gray-600 border-gray-200"
                              >
                                {item.type === 'prompt' ? 'Prompt' : 'Rule'}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Author and Stats Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={item.author.image || undefined} alt={item.author.name} />
                                <AvatarFallback className="text-xs bg-gray-100">
                                  {item.author.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">{item.author.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 font-mono">
                                {formatTokenCount(item.tokens)}
                              </span>
                              <VotingButtons 
                                promptSlug={item.slug}
                                size="sm"
                                showCounts={true}
                                upvoteOnly={true}
                                contentType={item.type}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Medium Screen Layout (md to lg) */}
                        <div className="hidden md:grid lg:hidden grid-cols-9 gap-2 px-4 py-3">
                          {/* Name Column */}
                          <div className="col-span-5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                                  <Link href={getContentLink(item)}>
                                    {item.title}
                                  </Link>
                                </h3>
                                <div className="flex gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`${getContentTypeColor(item)} text-xs`}
                                  >
                                    {getContentTypeLabel(item)}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                                  >
                                    {item.type === 'prompt' ? 'Prompt' : 'Rule'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Author Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={item.author.image || undefined} alt={item.author.name} />
                                <AvatarFallback className="text-xs bg-gray-100">
                                  {item.author.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600 truncate">{item.author.name}</span>
                            </div>
                          </div>
                          
                          {/* Votes Column */}
                          <div className="col-span-2">
                            <VotingButtons 
                              promptSlug={item.slug}
                              size="sm"
                              showCounts={true}
                              upvoteOnly={true}
                              contentType={item.type}
                            />
                          </div>
                        </div>

                        {/* Desktop Layout (lg+) */}
                        <div className="hidden lg:grid grid-cols-11 gap-4 px-4 py-3">
                          {/* Name Column */}
                          <div className="col-span-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                                  <Link href={getContentLink(item)}>
                                    {item.title}
                                  </Link>
                                </h3>
                                <p className="text-xs text-gray-500 truncate mt-1">{item.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`${getContentTypeColor(item)} text-xs whitespace-nowrap`}
                                >
                                  {getContentTypeLabel(item)}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs whitespace-nowrap bg-gray-50 text-gray-600 border-gray-200"
                                >
                                  {item.type === 'prompt' ? 'Prompt' : 'Rule'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Author Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={item.author.image || undefined} alt={item.author.name} />
                                <AvatarFallback className="text-xs bg-gray-100">
                                  {item.author.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm text-gray-600 truncate block">{item.author.name}</span>
                                {item.author.username && (
                                  <Link href={`/profile/${item.author.username}`} className="text-xs text-blue-600 hover:text-blue-800">
                                    @{item.author.username}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Tokens Column */}
                          <div className="col-span-1">
                            <span className="text-sm text-gray-500 font-mono">
                              {formatTokenCount(item.tokens)}
                            </span>
                          </div>
                          
                          {/* Votes Column */}
                          <div className="col-span-2">
                            <VotingButtons 
                              promptSlug={item.slug}
                              size="sm"
                              showCounts={true}
                              upvoteOnly={true}
                              contentType={item.type}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Browse All Content Buttons */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Button asChild className="w-full h-12 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 text-base font-medium">
                  <Link href="/prompts" className="flex items-center justify-center gap-2">
                    Browse All Prompts
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild className="w-full h-12 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 text-base font-medium">
                  <Link href="/cursor-rules" className="flex items-center justify-center gap-2">
                    Browse All Cursor Rules
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
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
