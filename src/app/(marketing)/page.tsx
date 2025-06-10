"use client";

import { useState, useEffect, useCallback } from "react";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { VotingButtons } from "@/components/voting-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, ArrowRight } from "lucide-react";
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

export default function Home() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [copyCounts, setCopyCounts] = useState<Record<string, number>>({});

  const fetchTopPrompts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch top 10 upvoted prompts
      const params = new URLSearchParams();
      params.set('sort', 'upvotes');
      params.set('page', '1');
      params.set('limit', '10');

      const response = await fetch(`/api/prompts?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        const newPrompts = data.prompts || [];
        setPrompts(newPrompts);
        
        // Initialize copy counts from fetched data
        const initialCopyCounts: Record<string, number> = {};
        newPrompts.forEach((prompt: PromptData) => {
          initialCopyCounts[prompt.slug] = prompt.copyCount || 0;
        });
        setCopyCounts(initialCopyCounts);
      }
    } catch (error) {
      console.error('Error fetching top prompts:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Function to handle copy count increment
  const handleCopyIncrement = useCallback((promptSlug: string) => {
    setCopyCounts(prev => ({
      ...prev,
      [promptSlug]: (prev[promptSlug] || 0) + 1
    }));
  }, []);

  // Initial load
  useEffect(() => {
    fetchTopPrompts();
  }, [fetchTopPrompts]);

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
                  Discover System, User, and Developer Prompts
            </h1>
                <p className="text-gray-600">
                  Find high-quality prompts for AI models, share your own creations, and connect with the community.
            </p>
          </div>
          
              {/* Prompts Grid */}
              {loading && initialLoad ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading top prompts...</p>
                  </div>
                </div>
              ) :
              promptsWithTokens.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-8 text-center">
                    <p className="text-gray-600 mb-4">
                      No prompts found.
                    </p>
                    <p className="text-sm text-gray-500">Check back later for new prompts.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Desktop Table Header - Hidden on mobile/tablet */}
                  <div className="hidden lg:block border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-1">Tokens</div>
                      <div className="col-span-2">Votes</div>
                      <div className="col-span-1">Copies</div>
                    </div>
                  </div>

                  {/* Medium Screen Table Header - Hidden on mobile and desktop */}
                  <div className="hidden md:block lg:hidden border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-10 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-2">Author</div>
                      <div className="col-span-2">Votes</div>
                      <div className="col-span-1">Copies</div>
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
                              <VotingButtons 
                                promptSlug={prompt.slug}
                                size="sm"
                                showCounts={true}
                                upvoteOnly={true}
                              />
                            </div>
                          </div>
                          
                          {/* Copy Count Row */}
                          <div className="flex items-center justify-end text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Copy className="h-3 w-3" />
                              <span>{copyCounts[prompt.slug] || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Medium Screen Layout (md to lg) */}
                        <div className="hidden md:grid lg:hidden grid-cols-10 gap-2 px-4 py-3">
                          {/* Name Column */}
                          <div className="col-span-5">
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
                            <VotingButtons 
                              promptSlug={prompt.slug}
                              size="sm"
                              showCounts={true}
                              upvoteOnly={true}
                            />
                          </div>
                          
                          {/* Copies Column */}
                          <div className="col-span-1">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Copy className="h-3 w-3" />
                              <span>{copyCounts[prompt.slug] || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout (lg+) */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3">
                          {/* Name Column */}
                          <div className="col-span-6">
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
                            <VotingButtons 
                              promptSlug={prompt.slug}
                              size="sm"
                              showCounts={true}
                              upvoteOnly={true}
                            />
                          </div>
                          
                          {/* Copies Column */}
                          <div className="col-span-1">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Copy className="h-3 w-3" />
                              <span>{copyCounts[prompt.slug] || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Browse All Prompts Button */}
              <div className="mt-8">
                <Button asChild className="w-full h-12 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 text-base font-medium">
                  <Link href="/prompts" className="flex items-center justify-center gap-2">
                    Browse All Prompts
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
