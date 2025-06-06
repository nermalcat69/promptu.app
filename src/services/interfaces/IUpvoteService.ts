export interface IVotingService {
  /**
   * Toggle upvote for a prompt
   * @param promptSlug - The slug of the prompt
   * @param userId - The ID of the user
   * @returns Promise with upvote status and new counts
   */
  toggleUpvote(promptSlug: string, userId: string): Promise<{
    upvoted: boolean;
    downvoted: boolean;
    upvoteCount: number;
    downvoteCount: number;
    message: string;
  }>;

  /**
   * Toggle downvote for a prompt
   * @param promptSlug - The slug of the prompt
   * @param userId - The ID of the user
   * @returns Promise with downvote status and new counts
   */
  toggleDownvote(promptSlug: string, userId: string): Promise<{
    upvoted: boolean;
    downvoted: boolean;
    upvoteCount: number;
    downvoteCount: number;
    message: string;
  }>;

  /**
   * Check user's voting status for a prompt
   * @param promptSlug - The slug of the prompt
   * @param userId - The ID of the user
   * @returns Promise with voting status
   */
  getVotingStatus(promptSlug: string, userId: string): Promise<{
    upvoted: boolean;
    downvoted: boolean;
    upvoteCount: number;
    downvoteCount: number;
  }>;

  /**
   * Get vote counts for a prompt
   * @param promptSlug - The slug of the prompt
   * @returns Promise with vote counts
   */
  getVoteCounts(promptSlug: string): Promise<{
    upvoteCount: number;
    downvoteCount: number;
    netScore: number;
  }>;
} 