export interface CommunityStats {
  totalPrompts: number;
  activeUsers: number;
  weeklyPrompts: number;
  monthlyPrompts: number;
  totalUpvotes: number;
  totalCopies: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
}

export interface ICommunityStatsService {
  /**
   * Get comprehensive community statistics
   * @returns Promise with community stats
   */
  getCommunityStats(): Promise<CommunityStats>;

  /**
   * Get user activity statistics
   * @param timeframe - Time period to analyze
   * @returns Promise with user activity data
   */
  getUserActivity(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<{
    newUsers: number;
    activeUsers: number;
    returningUsers: number;
  }>;

  /**
   * Get prompt creation statistics
   * @param timeframe - Time period to analyze
   * @returns Promise with prompt statistics
   */
  getPromptStats(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<{
    totalCreated: number;
    published: number;
    drafts: number;
    byType: Record<string, number>;
  }>;

  /**
   * Get engagement statistics
   * @returns Promise with engagement metrics
   */
  getEngagementStats(): Promise<{
    totalUpvotes: number;
    totalCopies: number;
    averageUpvotesPerPrompt: number;
    mostUpvotedPrompt: {
      title: string;
      slug: string;
      upvotes: number;
    } | null;
  }>;
} 