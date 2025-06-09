import { db } from "@/lib/db";
import { prompt, user, upvote } from "@/lib/db/schema";
import { eq, gte, sql, desc, and } from "drizzle-orm";
import { ICommunityStatsService, CommunityStats } from "../interfaces/ICommunityStatsService";
import { cacheGet, cacheSet } from "@/lib/redis";

export class CommunityStatsService implements ICommunityStatsService {
  private readonly CACHE_TTL = 300; // 5 minutes cache
  private readonly CACHE_KEYS = {
    communityStats: 'community:stats',
    engagementStats: 'community:engagement',
    userActivity: (timeframe: string) => `community:user_activity:${timeframe}`,
    promptStats: (timeframe: string) => `community:prompt_stats:${timeframe}`,
  };

  /**
   * Get comprehensive community statistics
   */
  async getCommunityStats(): Promise<CommunityStats> {
    try {
      // Try to get from cache first
      const cached = await cacheGet(this.CACHE_KEYS.communityStats);
      if (cached) {
        return JSON.parse(cached);
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

      // Execute all queries in parallel for better performance
      const [
        totalPromptsResult,
        activeUsersResult,
        weeklyPromptsResult,
        monthlyPromptsResult,
        totalUpvotesResult,
        totalCopiesResult,
        topCategoriesResult
      ] = await Promise.all([
        // Total published prompts
        db.select({ count: sql<number>`count(*)` })
          .from(prompt)
          .where(eq(prompt.published, true)),

        // Total users (all registered users)
        db.select({ count: sql<number>`count(*)` })
          .from(user),

        // Weekly prompts
        db.select({ count: sql<number>`count(*)` })
          .from(prompt)
          .where(and(
            eq(prompt.published, true),
            gte(prompt.createdAt, oneWeekAgo)
          )),

        // Monthly prompts
        db.select({ count: sql<number>`count(*)` })
          .from(prompt)
          .where(and(
            eq(prompt.published, true),
            gte(prompt.createdAt, oneMonthAgo)
          )),

        // Total upvotes across all prompts
        db.select({ total: sql<number>`coalesce(sum(${prompt.upvotes}), 0)` })
          .from(prompt)
          .where(eq(prompt.published, true)),

        // Total copies across all prompts
        db.select({ total: sql<number>`coalesce(sum(${prompt.copyCount}), 0)` })
          .from(prompt)
          .where(eq(prompt.published, true)),

        // Top categories by prompt count
        db.select({
          name: prompt.promptType,
          count: sql<number>`count(*)`
        })
          .from(prompt)
          .where(eq(prompt.published, true))
          .groupBy(prompt.promptType)
          .orderBy(desc(sql<number>`count(*)`))
          .limit(5)
      ]);

      const stats: CommunityStats = {
        totalPrompts: totalPromptsResult[0]?.count || 0,
        activeUsers: activeUsersResult[0]?.count || 0,
        weeklyPrompts: weeklyPromptsResult[0]?.count || 0,
        monthlyPrompts: monthlyPromptsResult[0]?.count || 0,
        totalUpvotes: totalUpvotesResult[0]?.total || 0,
        totalCopies: totalCopiesResult[0]?.total || 0,
        topCategories: topCategoriesResult.map(item => ({
          name: this.formatCategoryName(item.name),
          count: item.count
        }))
      };

      // Cache the results
      await cacheSet(this.CACHE_KEYS.communityStats, JSON.stringify(stats), this.CACHE_TTL);

      return stats;
    } catch (error) {
      console.error('Error fetching community stats:', error);
      // Return default stats in case of error
      return {
        totalPrompts: 0,
        activeUsers: 0,
        weeklyPrompts: 0,
        monthlyPrompts: 0,
        totalUpvotes: 0,
        totalCopies: 0,
        topCategories: []
      };
    }
  }

  /**
   * Get user activity statistics
   */
  async getUserActivity(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<{
    newUsers: number;
    activeUsers: number;
    returningUsers: number;
  }> {
    try {
      // Try to get from cache first
      const cacheKey = this.CACHE_KEYS.userActivity(timeframe);
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      let dateFilter: Date;
      const now = new Date();

      switch (timeframe) {
        case 'daily':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const [newUsersResult, totalUsersResult] = await Promise.all([
        // New users in timeframe
        db.select({ count: sql<number>`count(*)` })
          .from(user)
          .where(gte(user.createdAt, dateFilter)),

        // Total users (for active/returning calculation)
        db.select({ count: sql<number>`count(*)` })
          .from(user)
      ]);

      const newUsers = newUsersResult[0]?.count || 0;
      const totalUsers = totalUsersResult[0]?.count || 0;

      const result = {
        newUsers,
        activeUsers: totalUsers,
        returningUsers: Math.max(0, totalUsers - newUsers)
      };

      // Cache the results (shorter TTL for activity data)
      await cacheSet(cacheKey, JSON.stringify(result), 180); // 3 minutes

      return result;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return { newUsers: 0, activeUsers: 0, returningUsers: 0 };
    }
  }

  /**
   * Get prompt creation statistics
   */
  async getPromptStats(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<{
    totalCreated: number;
    published: number;
    drafts: number;
    byType: Record<string, number>;
  }> {
    try {
      // Try to get from cache first
      const cacheKey = this.CACHE_KEYS.promptStats(timeframe);
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      let dateFilter: Date;
      const now = new Date();

      switch (timeframe) {
        case 'daily':
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const [totalResult, publishedResult, draftsResult, byTypeResult] = await Promise.all([
        // Total created in timeframe
        db.select({ count: sql<number>`count(*)` })
          .from(prompt)
          .where(gte(prompt.createdAt, dateFilter)),

        // Published prompts in timeframe
        db.select({ count: sql<number>`count(*)` })
          .from(prompt)
          .where(and(
            gte(prompt.createdAt, dateFilter),
            eq(prompt.published, true)
          )),

        // Draft prompts in timeframe
        db.select({ count: sql<number>`count(*)` })
          .from(prompt)
          .where(and(
            gte(prompt.createdAt, dateFilter),
            eq(prompt.published, false)
          )),

        // By type in timeframe
        db.select({
          type: prompt.promptType,
          count: sql<number>`count(*)`
        })
          .from(prompt)
          .where(gte(prompt.createdAt, dateFilter))
          .groupBy(prompt.promptType)
      ]);

      const byType: Record<string, number> = {};
      byTypeResult.forEach(item => {
        byType[item.type] = item.count;
      });

      const result = {
        totalCreated: totalResult[0]?.count || 0,
        published: publishedResult[0]?.count || 0,
        drafts: draftsResult[0]?.count || 0,
        byType
      };

      // Cache the results
      await cacheSet(cacheKey, JSON.stringify(result), this.CACHE_TTL);

      return result;
    } catch (error) {
      console.error('Error fetching prompt stats:', error);
      return { totalCreated: 0, published: 0, drafts: 0, byType: {} };
    }
  }

  /**
   * Get engagement statistics
   */
  async getEngagementStats(): Promise<{
    totalUpvotes: number;
    totalCopies: number;
    averageUpvotesPerPrompt: number;
    mostUpvotedPrompt: {
      title: string;
      slug: string;
      upvotes: number;
    } | null;
  }> {
    try {
      // Try to get from cache first
      const cached = await cacheGet(this.CACHE_KEYS.engagementStats);
      if (cached) {
        return JSON.parse(cached);
      }

      const [totalsResult, mostUpvotedResult] = await Promise.all([
        // Total upvotes and copies
        db.select({
          totalUpvotes: sql<number>`coalesce(sum(${prompt.upvotes}), 0)`,
          totalCopies: sql<number>`coalesce(sum(${prompt.copyCount}), 0)`,
          totalPrompts: sql<number>`count(*)`
        })
          .from(prompt)
          .where(eq(prompt.published, true)),

        // Most upvoted prompt
        db.select({
          title: prompt.title,
          slug: prompt.slug,
          upvotes: prompt.upvotes
        })
          .from(prompt)
          .where(eq(prompt.published, true))
          .orderBy(desc(prompt.upvotes))
          .limit(1)
      ]);

      const totals = totalsResult[0];
      const mostUpvoted = mostUpvotedResult[0];

      const result = {
        totalUpvotes: totals?.totalUpvotes || 0,
        totalCopies: totals?.totalCopies || 0,
        averageUpvotesPerPrompt: totals?.totalPrompts > 0 
          ? Math.round((totals.totalUpvotes || 0) / totals.totalPrompts * 100) / 100 
          : 0,
        mostUpvotedPrompt: mostUpvoted ? {
          title: mostUpvoted.title,
          slug: mostUpvoted.slug,
          upvotes: mostUpvoted.upvotes || 0
        } : null
      };

      // Cache the results
      await cacheSet(this.CACHE_KEYS.engagementStats, JSON.stringify(result), this.CACHE_TTL);

      return result;
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
      return {
        totalUpvotes: 0,
        totalCopies: 0,
        averageUpvotesPerPrompt: 0,
        mostUpvotedPrompt: null
      };
    }
  }

  /**
   * Format category name for display
   */
  private formatCategoryName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
} 