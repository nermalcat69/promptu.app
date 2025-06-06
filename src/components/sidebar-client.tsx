"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star } from "lucide-react";
import Link from "next/link";

interface TrendingPrompt {
  id: string;
  title: string;
  slug: string;
  upvotes: number | null;
}

interface CommunityStats {
  totalPrompts: number;
  activeUsers: number;
  weeklyPrompts: number;
}

interface SidebarClientProps {
  trendingPrompts: TrendingPrompt[];
  stats: CommunityStats;
}

export function SidebarClient({ trendingPrompts, stats }: SidebarClientProps) {
  return (
    <div className="space-y-6">
      {/* Trending Prompts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-7 w-7" />
            Trending This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingPrompts.length > 0 ? (
            trendingPrompts.map((prompt, index) => (
              <div key={prompt.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/prompts/${prompt.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 line-clamp-2"
                  >
                    {prompt.title}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{prompt.upvotes || 0} upvotes</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No trending prompts yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Prompt Guide */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📚 Prompt Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Learn how to write effective AI prompts with our comprehensive guide.
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href="/prompt-guide">
              View Guide
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Community Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Prompts</span>
            <span className="text-xs font-medium text-gray-900">{stats.totalPrompts.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Active Users</span>
            <span className="text-xs font-medium text-gray-900">{stats.activeUsers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">This Week</span>
            <span className="text-xs font-medium text-green-600">+{stats.weeklyPrompts} prompts</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 