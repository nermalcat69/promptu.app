"use client";

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronUp, Copy, Eye, User, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { calculatePromptTokens, formatTokenCount } from '@/lib/token-calculator'
import { CopyButton } from '@/components/copy-button'
import { UpvoteButton } from '@/components/upvote-button'
import { useParams } from 'next/navigation'
import Link from 'next/link'

async function getPrompt(slug: string) {
  try {
    // Use window.location.origin in the browser, fallback for server-side rendering
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/prompts/${slug}`, {
      cache: 'no-store', // Always fetch fresh data
      // Add timestamp to ensure view tracking works
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

export default function PromptPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copyCount, setCopyCount] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchPrompt();
    }
  }, [slug]);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      const data = await getPrompt(slug);
      if (data) {
        setPrompt(data);
        setCopyCount(data.copyCount || 0);
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyIncrement = () => {
    setCopyCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header Skeleton */}
              <div className="py-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Author and Meta Skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>



              {/* Content Skeleton */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card Skeleton */}
              <div className="bg-card text-card-foreground rounded-xl border p-4">
                <div className="mb-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Discord Card Skeleton */}
              <div className="bg-card text-card-foreground rounded-xl border p-4">
                <div className="mb-2">
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    notFound();
  }

  const tokens = calculatePromptTokens(prompt.title, prompt.excerpt, prompt.content).tokens;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="py-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    {prompt.title}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {prompt.excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge 
                    variant="outline" 
                    className={`${getPromptTypeColor(prompt.promptType)}`}
                  >
                    {prompt.promptType}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <UpvoteButton 
                      promptSlug={prompt.slug}
                      initialUpvotes={prompt.upvotes || 0}
                      className="h-8"
                    />

                    <CopyButton 
                      text={prompt.content}
                      promptSlug={prompt.slug}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                      size="sm"
                      onCopy={handleCopyIncrement}
                    >
                      Copy
                    </CopyButton>
                  </div>
                </div>
              </div>

              {/* Author and Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={prompt.author?.image || ''} alt={prompt.author?.name || 'Unknown'} />
                    <AvatarFallback className="text-xs bg-gray-100">
                      {prompt.author?.name ? prompt.author.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{prompt.author?.name || 'Unknown Author'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{prompt.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Copy className="h-4 w-4" />
                    <span>{copyCount}</span>
                  </div>
                  <span className="font-mono">{formatTokenCount(tokens)}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="min-h-[100px] max-h-[400px] overflow-y-auto scrollbar-visible border border-gray-100 rounded-md p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 leading-relaxed">
                  {prompt.content}
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-card text-card-foreground rounded-xl border p-4">
              <div className="mb-2">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Author Profile
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={prompt.author?.image || ''} alt={prompt.author?.name || 'Unknown'} />
                    <AvatarFallback className="bg-gray-100">
                      {prompt.author?.name ? prompt.author.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{prompt.author?.name || 'Unknown Author'}</p>
                    <p className="text-xs text-gray-500">@{prompt.author?.username || 'unknown'}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Member since {new Date(prompt.author?.createdAt || prompt.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/profile/${prompt.author?.username || prompt.author?.id}`}>
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>

            {/* Discord Card */}
            <div className="bg-card text-card-foreground rounded-xl border p-4">
              <div className="mb-2">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Join Our Community
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Connect with other prompt creators, share ideas, and get feedback on your prompts.
                </p>
                <Button asChild className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white">
                  <Link href="https://discord.gg/your-server" target="_blank" rel="noopener noreferrer">
                    Join Discord
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 