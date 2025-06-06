import { db } from "@/lib/db";
import { prompt, user } from "@/lib/db/schema";
import { desc, sql, eq, and, gte } from "drizzle-orm";
import { SidebarClient } from "./sidebar-client";

async function getTrendingPrompts() {
  try {
    const trendingData = await db
      .select({
        id: prompt.id,
        title: prompt.title,
        slug: prompt.slug,
        upvotes: prompt.upvotes,
      })
      .from(prompt)
      .where(eq(prompt.published, true))
      .orderBy(desc(prompt.upvotes))
      .limit(5);
    
    return trendingData;
  } catch (error) {
    console.error('Error fetching trending prompts:', error);
    return [];
  }
}

async function getCommunityStats() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalPrompts, activeUsers, weeklyPrompts] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(prompt).where(eq(prompt.published, true)),
      db.select({ count: sql<number>`count(*)` }).from(user),
      db.select({ count: sql<number>`count(*)` }).from(prompt).where(
        and(
          eq(prompt.published, true),
          gte(prompt.createdAt, oneWeekAgo)
        )
      )
    ]);

    return {
      totalPrompts: totalPrompts[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      weeklyPrompts: weeklyPrompts[0]?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return {
      totalPrompts: 0,
      activeUsers: 0,
      weeklyPrompts: 0,
    };
  }
}

export async function SidebarWrapper() {
  const [trendingPrompts, stats] = await Promise.all([
    getTrendingPrompts(),
    getCommunityStats(),
  ]);

  return (
    <SidebarClient 
      trendingPrompts={trendingPrompts}
      stats={stats}
    />
  );
} 