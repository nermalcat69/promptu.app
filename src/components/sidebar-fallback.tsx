"use client";

import { Button } from "@/components/ui/button";
import { TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  totalUpvotes: number;
  totalCopies: number;
}

export function SidebarFallback() {
  const [trendingPrompts, setTrendingPrompts] = useState<TrendingPrompt[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalPrompts: 0,
    activeUsers: 0,
    weeklyPrompts: 0,
    totalUpvotes: 0,
    totalCopies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, statsRes] = await Promise.all([
          fetch('/api/trending?limit=5&timeframe=weekly'),
          fetch('/api/stats/community')
        ]);

        if (trendingRes.ok) {
          const trendingData = await trendingRes.json();
          setTrendingPrompts(trendingData.data || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || stats);
        }
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Trending Prompts */}
      <div className="bg-card text-card-foreground rounded-xl border p-4">
        <div className="mb-2">
          <div className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending This Week
          </div>
        </div>
        <div className="space-y-1">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : trendingPrompts.length > 0 ? (
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
                    <span className="text-xs text-gray-500">{prompt.upvotes || 0} upvotes</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No trending prompts yet.</p>
          )}
        </div>
      </div>

      {/* Prompt Guide */}
      <div className="bg-card text-card-foreground rounded-xl border p-4">
        <div className="mb-2">
          <div className="text-sm font-semibold">📚 Prompt Guide</div>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Learn how to write effective AI prompts with our comprehensive guide.
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href="/prompt-guide">
              View Guide
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-card text-card-foreground rounded-xl border p-4">
        <div className="mb-2">
          <div className="text-sm font-semibold">Community Stats</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Prompts</span>
            <span className="text-xs font-medium text-gray-900">
              {loading ? "..." : stats.totalPrompts.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Active Users</span>
            <span className="text-xs font-medium text-gray-900">
              {loading ? "..." : stats.activeUsers.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">This Week</span>
            <span className="text-xs font-medium text-green-600">
              {loading ? "..." : `+${stats.weeklyPrompts} prompts`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Upvotes</span>
            <span className="text-xs font-medium text-blue-600">
              {loading ? "..." : stats.totalUpvotes.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Total Copies</span>
            <span className="text-xs font-medium text-purple-600">
              {loading ? "..." : stats.totalCopies.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 