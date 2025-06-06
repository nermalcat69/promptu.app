import { IVotingService } from "./interfaces/IUpvoteService";
import { ITrendingService } from "./interfaces/ITrendingService";
import { ICommunityStatsService } from "./interfaces/ICommunityStatsService";

import { VotingService } from "./implementations/UpvoteService";
import { TrendingService } from "./implementations/TrendingService";
import { CommunityStatsService } from "./implementations/CommunityStatsService";

/**
 * Service factory that provides singleton instances of services
 * Follows Dependency Inversion Principle by returning interfaces
 */
export class ServiceFactory {
  private static votingService: IVotingService | null = null;
  private static trendingService: ITrendingService | null = null;
  private static communityStatsService: ICommunityStatsService | null = null;

  /**
   * Get voting service instance (singleton)
   */
  static getVotingService(): IVotingService {
    if (!this.votingService) {
      this.votingService = new VotingService();
    }
    return this.votingService;
  }

  /**
   * Get trending service instance (singleton)
   */
  static getTrendingService(): ITrendingService {
    if (!this.trendingService) {
      this.trendingService = new TrendingService();
    }
    return this.trendingService;
  }

  /**
   * Get community stats service instance (singleton)
   */
  static getCommunityStatsService(): ICommunityStatsService {
    if (!this.communityStatsService) {
      this.communityStatsService = new CommunityStatsService();
    }
    return this.communityStatsService;
  }

  /**
   * Reset all service instances (useful for testing)
   */
  static reset(): void {
    this.votingService = null;
    this.trendingService = null;
    this.communityStatsService = null;
  }
}

// Export convenience functions for easier access
export const getVotingService = () => ServiceFactory.getVotingService();
export const getTrendingService = () => ServiceFactory.getTrendingService();
export const getCommunityStatsService = () => ServiceFactory.getCommunityStatsService(); 