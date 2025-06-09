export interface TrendingPrompt {
  id: string;
  title: string;
  slug: string;
  upvotes: number | null;
  netScore?: number | null;
  excerpt?: string;
  promptType: string;
  createdAt: Date;
}

export interface ITrendingService {
  /**
   * Get trending prompts based on upvotes and recent activity
   * @param limit - Number of trending prompts to return
   * @param timeframe - Time period to consider (daily, weekly, monthly, all-time)
   * @returns Promise with trending prompts
   */
  getTrendingPrompts(limit?: number, timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time'): Promise<TrendingPrompt[]>;

  /**
   * Get trending prompts by category
   * @param category - The category to filter by
   * @param limit - Number of trending prompts to return
   * @returns Promise with trending prompts
   */
  getTrendingByCategory(category: string, limit?: number): Promise<TrendingPrompt[]>;

  /**
   * Get trending prompts by type
   * @param promptType - The type to filter by (system, user, developer)
   * @param limit - Number of trending prompts to return
   * @returns Promise with trending prompts
   */
  getTrendingByType(promptType: 'system' | 'user' | 'developer', limit?: number): Promise<TrendingPrompt[]>;

  /**
   * Get hot prompts (recently created with good engagement)
   * @param limit - Number of hot prompts to return
   * @returns Promise with hot prompts
   */
  getHotPrompts(limit?: number): Promise<TrendingPrompt[]>;
} 