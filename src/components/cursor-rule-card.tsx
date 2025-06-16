"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy } from "lucide-react";
import Link from "next/link";
import { formatTokenCount } from "@/lib/token-calculator";
import { UpvoteButton } from "@/components/upvote-button";
import { CursorRuleData } from "@/lib/types";

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

interface CursorRuleCardProps {
  rule: CursorRuleData;
}

export function CursorRuleCard({ rule }: CursorRuleCardProps) {
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
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group">
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
              <AvatarImage src={rule.author?.image || undefined} alt={rule.author?.name || 'Anonymous'} />
              <AvatarFallback className="text-xs bg-gray-100">
                {rule.author?.name?.split(' ').map(n => n[0]).join('') || 'A'}
              </AvatarFallback>
            </Avatar>
            <span>{rule.author?.name || 'Anonymous'}</span>
          </div>
          <span className="font-mono">
            {formatTokenCount(rule.tokens || 0)}
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
  );
} 