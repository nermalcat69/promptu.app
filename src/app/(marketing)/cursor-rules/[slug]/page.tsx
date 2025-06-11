"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Eye, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { UpvoteButton } from "@/components/upvote-button";
import { notFound } from "next/navigation";

interface CursorRuleData {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  ruleType: string;
  globs?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
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

export default function CursorRuleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [cursorRule, setCursorRule] = useState<CursorRuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyCount, setCopyCount] = useState(0);

  useEffect(() => {
    async function fetchCursorRule() {
      try {
        const { slug } = await params;
        const response = await fetch(`/api/cursor-rules/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch cursor rule');
        }
        
        const data = await response.json();
        setCursorRule(data);
        setCopyCount(data.copyCount || 0);
      } catch (error) {
        console.error('Error fetching cursor rule:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchCursorRule();
  }, [params]);

  const handleCopyIncrement = () => {
    setCopyCount(prev => prev + 1);
  };

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

  function getRuleTypeDescription(type: string) {
    switch (type) {
      case "always":
        return "This rule is applied to every AI execution within the project";
      case "auto-attached":
        return "This rule is triggered when working on files matching specific patterns";
      case "agent-requested":
        return "This rule is suggested by the AI when it detects relevant context";
      case "manual":
        return "This rule is activated only when explicitly referenced in chat";
      default:
        return "Custom rule type";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          <div className="space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cursorRule) {
    return notFound();
  }

  const tokens = calculatePromptTokens(cursorRule.title, cursorRule.description, cursorRule.content).tokens;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
            <Link href="/cursor-rules" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cursor Rules
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {cursorRule.title}
              </h1>
              <p className="text-gray-600 leading-relaxed mb-4">
                {cursorRule.description}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className={getRuleTypeColor(cursorRule.ruleType)}>
                  {cursorRule.ruleType.replace('-', ' ')}
                </Badge>
                {cursorRule.globs && (
                  <Badge variant="outline" className="text-xs">
                    Files: {cursorRule.globs}
                  </Badge>
                )}
                {cursorRule.category && (
                  <Badge variant="outline">
                    {cursorRule.category.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {getRuleTypeDescription(cursorRule.ruleType)}
              </p>
            </div>
          </div>

          {/* Author and metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={cursorRule.author?.image || undefined} alt={cursorRule.author?.name || 'Unknown'} />
                <AvatarFallback className="bg-gray-100">
                  {cursorRule.author?.name ? cursorRule.author.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{cursorRule.author?.name || 'Unknown Author'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(cursorRule.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{cursorRule.views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  <span>{copyCount}</span>
                </div>
                <span className="font-mono">{formatTokenCount(tokens)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <UpvoteButton 
                  promptSlug={cursorRule.slug}
                  initialUpvotes={cursorRule.upvotes || 0}
                  contentType="cursor-rule"
                />
                
                {/* Copy Button */}
                <Button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(cursorRule.content);
                      // Increment copy count
                      await fetch(`/api/cursor-rules/${cursorRule.slug}/copy`, { method: 'POST' });
                      handleCopyIncrement();
                    } catch (error) {
                      console.error('Failed to copy:', error);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Rule
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Rule Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rule Content</h2>
            {/* Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="min-h-[100px] max-h-[400px] overflow-y-auto scrollbar-visible border border-gray-100 rounded-md p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 leading-relaxed">
                  {cursorRule.content}
                </pre>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to use this rule</h3>
            <div className="space-y-2 text-sm text-blue-800">
              {cursorRule.ruleType === "always" && (
                <p>Save this content as a <code className="bg-blue-100 px-1 rounded">.cursor-rule</code> file in your project's <code className="bg-blue-100 px-1 rounded">.cursor/rules/</code> directory to apply it to all AI interactions.</p>
              )}
              {cursorRule.ruleType === "auto-attached" && (
                <>
                  <p>Save this content as a <code className="bg-blue-100 px-1 rounded">.cursor-rule</code> file in your project's <code className="bg-blue-100 px-1 rounded">.cursor/rules/</code> directory.</p>
                  {cursorRule.globs && (
                    <p>This rule will automatically activate when working on files matching: <code className="bg-blue-100 px-1 rounded">{cursorRule.globs}</code></p>
                  )}
                </>
              )}
              {cursorRule.ruleType === "manual" && (
                <p>Save this content as a <code className="bg-blue-100 px-1 rounded">.cursor-rule</code> file and reference it using <code className="bg-blue-100 px-1 rounded">@rule-name</code> in your chat.</p>
              )}
              {cursorRule.ruleType === "agent-requested" && (
                <p>Save this content as a <code className="bg-blue-100 px-1 rounded">.cursor-rule</code> file. The AI will suggest using this rule when it detects relevant context.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 