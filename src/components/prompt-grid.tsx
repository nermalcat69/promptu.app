"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, MessageCircle, Copy } from "lucide-react";
import Link from "next/link";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";

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

export function PromptGrid() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      } else {
        setError('Failed to fetch prompts');
      }
    } catch (error) {
      setError('Failed to fetch prompts');
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (prompts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-4">No prompts available yet.</p>
          <Button asChild>
            <Link href="/sign-in">Sign in to create the first prompt</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate tokens for each prompt
  const promptsWithTokens = prompts.map(prompt => ({
    ...prompt,
    tokens: calculatePromptTokens(prompt.title, prompt.excerpt, prompt.content).tokens
  }));

  return (
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
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-8 p-0 cursor-pointer border border-gray-300 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
                      {prompt.upvotes || 0}
                    </span>
                  </div>
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
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 font-mono">
                        {formatTokenCount(prompt.tokens)}
                      </span>
                    </div>
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{prompt.author.name}</p>
                  </div>
                </div>
              </div>

              {/* Votes Column */}
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-9 p-0 cursor-pointer border border-gray-300 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                  >
                    <ChevronUp className="h-7 w-7" />
                  </Button>
                  <span className="text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
                    {prompt.upvotes || 0}
                  </span>
                </div>
              </div>

              {/* Copies Column */}
              <div className="col-span-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <Copy className="h-3 w-3" />
                  <span className="text-sm">{prompt.copyCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Desktop Layout (lg+) - Updated Layout with Copies */}
            <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3">
              {/* Name Column */}
              <div className="col-span-5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                      <Link href={`/prompts/${prompt.slug}`}>
                        {prompt.title}
                      </Link>
                    </h3>
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">{prompt.author.name}</p>
                  </div>
                </div>
              </div>

              {/* Tokens Column */}
              <div className="col-span-1">
                <span className="text-sm text-gray-700 font-mono">
                  {formatTokenCount(prompt.tokens)}
                </span>
              </div>

              {/* Votes Column */}
              <div className="col-span-2">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-9 p-0 cursor-pointer border border-gray-300 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                  >
                    <ChevronUp className="h-7 w-7" />
                  </Button>
                  <span className="text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
                    {prompt.upvotes || 0}
                  </span>
                </div>
              </div>

              {/* Copies Column */}
              <div className="col-span-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <Copy className="h-3 w-3" />
                  <span className="text-sm">{prompt.copyCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 