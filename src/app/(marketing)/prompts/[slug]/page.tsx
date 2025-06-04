"use client";

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronUp, Copy, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { calculatePromptTokens, formatTokenCount } from '@/lib/token-calculator'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

async function getPrompt(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/prompts/${slug}`, {
      cache: 'no-store' // Always fetch fresh data
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

async function copyToClipboard(text: string, promptSlug: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Prompt copied to clipboard!');
    
    // Increment copy count
    try {
      await fetch(`/api/prompts/${promptSlug}/copy`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to increment copy count:', error);
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    toast.error('Failed to copy prompt');
  }
}

export default function PromptPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrompt = async () => {
      const promptData = await getPrompt(slug);
      if (!promptData) {
        notFound();
      }
      setPrompt(promptData);
      setLoading(false);
    };
    
    loadPrompt();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prompt...</p>
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
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <div className="space-y-6">
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
              <Badge 
                variant="outline" 
                className={`${getPromptTypeColor(prompt.promptType)} shrink-0`}
              >
                {prompt.promptType}
              </Badge>
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
                  <span>{prompt.copyCount || 0}</span>
                </div>
                <span className="font-mono">{formatTokenCount(tokens)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-9 p-0 cursor-pointer border border-gray-300 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-900 min-w-[2.5rem] text-center">
                {prompt.upvotes || 0}
              </span>
            </div>

            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white"
              onClick={() => copyToClipboard(prompt.content, prompt.slug)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Prompt
            </Button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 leading-relaxed">
              {prompt.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 