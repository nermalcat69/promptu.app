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
                    className="text-xs font-medium text-gray-900 hover:text-gray-700 line-clamp-2"
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
            <span className="text-xs text-gray-600">Total Users</span>
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

      {/* Discord Community */}
      <div className="bg-card text-card-foreground rounded-xl border p-4">
        <div className="mb-2">
          <div className="text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z"/>
            </svg>
            Join Our Community
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Connect with fellow AI enthusiasts, share tips, and get help with your prompts.
          </p>
          <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            <a 
              href="https://discord.gg/WJDaqEdJRC" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z"/>
              </svg>
              Join Discord Server
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
} 