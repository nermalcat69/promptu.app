import { db } from "@/lib/db";
import { prompt, upvote } from "@/lib/db/schema";
import { desc, eq, gte, sql, and } from "drizzle-orm";
import { ITrendingService, TrendingPrompt } from "../interfaces/ITrendingService";

export class TrendingService implements ITrendingService {
  /**
   * Get trending prompts based on upvotes and recent activity
   */
  async getTrendingPrompts(
    limit: number = 5,
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly'
  ): Promise<TrendingPrompt[]> {
    try {
      let dateFilter: Date | undefined;
      
      if (timeframe !== 'all-time') {
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
      }

      // Build query with optional date filter
      const whereConditions = [eq(prompt.published, true)];
      if (dateFilter) {
        whereConditions.push(gte(prompt.createdAt, dateFilter));
      }

      const trendingData = await db
        .select({
          id: prompt.id,
          title: prompt.title,
          slug: prompt.slug,
          upvotes: prompt.upvotes,
          excerpt: prompt.excerpt,
          promptType: prompt.promptType,
          createdAt: prompt.createdAt,
          netScore: sql<number>`COALESCE(${prompt.upvotes}, 0)`.as('net_score'),
        })
        .from(prompt)
        .where(and(...whereConditions))
        .orderBy(
          desc(sql`COALESCE(${prompt.upvotes}, 0)`), // Sort by upvotes
          desc(prompt.createdAt) // Secondary sort by recency
        )
        .limit(limit);

      return trendingData.map(item => ({
        ...item,
        upvotes: item.upvotes || 0,
        netScore: item.netScore || 0,
      }));
    } catch (error) {
      console.error('Error fetching trending prompts:', error);
      return [];
    }
  }

  /**
   * Get trending prompts by category
   */
  async getTrendingByCategory(category: string, limit: number = 5): Promise<TrendingPrompt[]> {
    try {
      const trendingData = await db
        .select({
          id: prompt.id,
          title: prompt.title,
          slug: prompt.slug,
          upvotes: prompt.upvotes,
          excerpt: prompt.excerpt,
          promptType: prompt.promptType,
          createdAt: prompt.createdAt,
          netScore: sql<number>`COALESCE(${prompt.upvotes}, 0)`.as('net_score'),
        })
        .from(prompt)
        .where(and(
          eq(prompt.published, true),
          eq(prompt.categoryId, category)
        ))
        .orderBy(
          desc(sql`COALESCE(${prompt.upvotes}, 0)`),
          desc(prompt.createdAt)
        )
        .limit(limit);

      return trendingData.map(item => ({
        ...item,
        upvotes: item.upvotes || 0,
        netScore: item.netScore || 0,
      }));
    } catch (error) {
      console.error('Error fetching trending prompts by category:', error);
      return [];
    }
  }

  /**
   * Get trending prompts by type
   */
  async getTrendingByType(
    promptType: 'system' | 'user' | 'developer',
    limit: number = 5
  ): Promise<TrendingPrompt[]> {
    try {
      const trendingData = await db
        .select({
          id: prompt.id,
          title: prompt.title,
          slug: prompt.slug,
          upvotes: prompt.upvotes,
          excerpt: prompt.excerpt,
          promptType: prompt.promptType,
          createdAt: prompt.createdAt,
          netScore: sql<number>`COALESCE(${prompt.upvotes}, 0)`.as('net_score'),
        })
        .from(prompt)
        .where(and(
          eq(prompt.published, true),
          eq(prompt.promptType, promptType)
        ))
        .orderBy(
          desc(sql`COALESCE(${prompt.upvotes}, 0)`),
          desc(prompt.createdAt)
        )
        .limit(limit);

      return trendingData.map(item => ({
        ...item,
        upvotes: item.upvotes || 0,
        netScore: item.netScore || 0,
      }));
    } catch (error) {
      console.error('Error fetching trending prompts by type:', error);
      return [];
    }
  }

  /**
   * Get hot prompts (recently created with good engagement)
   */
  async getHotPrompts(limit: number = 5): Promise<TrendingPrompt[]> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Get prompts created in the last 24 hours with good net score ratio
      const hotData = await db
        .select({
          id: prompt.id,
          title: prompt.title,
          slug: prompt.slug,
          upvotes: prompt.upvotes,
          excerpt: prompt.excerpt,
          promptType: prompt.promptType,
          createdAt: prompt.createdAt,
          netScore: sql<number>`COALESCE(${prompt.upvotes}, 0)`.as('net_score'),
        })
        .from(prompt)
        .where(and(
          eq(prompt.published, true),
          gte(prompt.createdAt, oneDayAgo)
        ))
        .orderBy(
          desc(sql`COALESCE(${prompt.upvotes}, 0) / EXTRACT(EPOCH FROM (NOW() - ${prompt.createdAt})) * 3600`), // Upvotes per hour
          desc(sql`COALESCE(${prompt.upvotes}, 0)`)
        )
        .limit(limit);

      return hotData.map(item => ({
        ...item,
        upvotes: item.upvotes || 0,
        netScore: item.netScore || 0,
      }));
    } catch (error) {
      console.error('Error fetching hot prompts:', error);
      return [];
    }
  }
} 