"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronUp, Copy, Eye, User, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatTokenCount } from '@/lib/token-calculator';
import { CopyButton } from '@/components/copy-button';
import { UpvoteButton } from '@/components/upvote-button';
import Link from 'next/link';

interface PromptPageClientProps {
  prompt: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    promptType: string;
    upvotes: number | null;
    views: number | null;
    copyCount: number | null;
    featured: boolean | null;
    published: boolean | null;
    createdAt: Date;
    updatedAt: Date | null;
    author: {
      id: string;
      name: string;
      image: string | null;
      username: string | null;
    } | null;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  tokens: number;
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

export function PromptPageClient({ prompt, tokens }: PromptPageClientProps) {
  const [copyCount, setCopyCount] = useState(prompt.copyCount || 0);

  const handleCopyIncrement = () => {
    setCopyCount(prev => prev + 1);
  };

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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {prompt.title}
                  </h1>
                  <p className="text-gray-600 leading-relaxed">
                    {prompt.excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge 
                    variant="outline" 
                    className={`${getPromptTypeColor(prompt.promptType)} whitespace-nowrap`}
                  >
                    {prompt.promptType}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <UpvoteButton 
                      promptSlug={prompt.slug}
                      initialUpvotes={prompt.upvotes || 0}
                    />
                    <span className="text-sm text-gray-500 font-mono">
                      {formatTokenCount(tokens)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Author and Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={prompt.author?.image || undefined} alt={prompt.author?.name || 'Anonymous'} />
                    <AvatarFallback className="text-xs bg-gray-100">
                      {prompt.author?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {prompt.author?.name || 'Anonymous'}
                    </div>
                    {prompt.author?.username && (
                      <Link href={`/profile/${prompt.author.username}`} className="text-xs text-blue-600 hover:text-blue-800">
                        @{prompt.author.username}
                      </Link>
                    )}
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
                  <span className="font-mono">
                    {formatTokenCount(tokens)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Prompt Content</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="min-h-[100px] max-h-[400px] overflow-y-auto scrollbar-visible border border-gray-100 rounded-md p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 leading-relaxed">
                      {prompt.content}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Copy Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">How to use this prompt</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Copy the prompt below and paste it into your AI assistant or use it as inspiration for your own prompts.
                </p>
                <CopyButton 
                  text={prompt.content}
                  promptSlug={prompt.slug}
                  onCopy={handleCopyIncrement}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Author Profile Card */}
            {prompt.author && (
              <div className="bg-card text-card-foreground rounded-xl border p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Created by
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={prompt.author.image || undefined} alt={prompt.author.name} />
                      <AvatarFallback className="bg-primary/10">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {prompt.author.name}
                      </div>
                      {prompt.author.username && (
                        <div className="text-xs text-muted-foreground truncate">
                          @{prompt.author.username}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Member on Promptu
                  </div>
                  {prompt.author.username && (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/profile/${prompt.author.username}`}>
                        View Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Discord Community Card */}
            <div className="bg-card text-card-foreground rounded-xl border p-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Join our community
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    Get help, share ideas, and connect with other prompt creators on our Discord server.
                  </div>
                </div>
                <Button asChild className="w-full" size="sm">
                  <Link 
                    href="https://discord.gg/WJDaqEdJRC" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
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