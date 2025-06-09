import { db } from "@/lib/db";
import { prompt, upvote } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { IVotingService } from "../interfaces/IUpvoteService";

export class VotingService implements IVotingService {
  /**
   * Toggle upvote for a prompt
   */
  async toggleUpvote(promptSlug: string, userId: string): Promise<{
    upvoted: boolean;
    upvoteCount: number;
    message: string;
  }> {
    try {
      // Get prompt ID from slug
      const promptResult = await db
        .select({ 
          id: prompt.id, 
          authorId: prompt.authorId, 
          upvotes: prompt.upvotes
        })
        .from(prompt)
        .where(eq(prompt.slug, promptSlug))
        .limit(1);

      if (!promptResult[0]) {
        throw new Error("Prompt not found");
      }

      const { id: promptId, upvotes: currentUpvotes } = promptResult[0];

      // Check existing upvote
      const existingUpvote = await db.select({ id: upvote.id }).from(upvote)
        .where(and(eq(upvote.promptId, promptId), eq(upvote.userId, userId)))
        .limit(1);

      let newUpvotes = currentUpvotes || 0;
      let message = "";
      let upvoted = false;

      if (existingUpvote[0]) {
        // Remove existing upvote
        await db.delete(upvote).where(eq(upvote.id, existingUpvote[0].id));
        newUpvotes = Math.max(0, newUpvotes - 1);
        message = "Upvote removed";
        upvoted = false;
      } else {
        // Add upvote
        await db.insert(upvote).values({
          id: crypto.randomUUID(),
          promptId,
          userId,
          createdAt: new Date(),
        });
        newUpvotes += 1;
        message = "Prompt upvoted";
        upvoted = true;
      }

      // Update prompt counts
      await db.update(prompt).set({
        upvotes: newUpvotes,
        updatedAt: new Date()
      }).where(eq(prompt.id, promptId));

      return {
        upvoted,
        upvoteCount: newUpvotes,
        message,
      };
    } catch (error) {
      console.error("Error toggling upvote:", error);
      throw error;
    }
  }



  /**
   * Get user's voting status for a prompt
   */
  async getVotingStatus(promptSlug: string, userId: string): Promise<{
    upvoted: boolean;
    upvoteCount: number;
  }> {
    try {
      // Get prompt ID and counts from slug
      const promptResult = await db
        .select({ 
          id: prompt.id,
          upvotes: prompt.upvotes
        })
        .from(prompt)
        .where(eq(prompt.slug, promptSlug))
        .limit(1);

      if (!promptResult[0]) {
        return { upvoted: false, upvoteCount: 0 };
      }

      const { id: promptId, upvotes: upvoteCount } = promptResult[0];

      // Check user's voting status
      const existingUpvote = await db.select({ id: upvote.id }).from(upvote)
        .where(and(eq(upvote.promptId, promptId), eq(upvote.userId, userId)))
        .limit(1);

      return {
        upvoted: !!existingUpvote[0],
        upvoteCount: upvoteCount || 0,
      };
    } catch (error) {
      console.error("Error getting voting status:", error);
      return { upvoted: false, upvoteCount: 0 };
    }
  }

  /**
   * Get vote counts for a prompt
   */
  async getVoteCounts(promptSlug: string): Promise<{
    upvoteCount: number;
    netScore: number;
  }> {
    try {
      // Get prompt vote counts directly from prompt table
      const promptResult = await db
        .select({ 
          upvotes: prompt.upvotes
        })
        .from(prompt)
        .where(eq(prompt.slug, promptSlug))
        .limit(1);

      if (!promptResult[0]) {
        return { upvoteCount: 0, netScore: 0 };
      }

      const upvoteCount = promptResult[0].upvotes || 0;

      return { 
        upvoteCount,
        netScore: upvoteCount
      };
    } catch (error) {
      console.error("Error getting vote counts:", error);
      return { upvoteCount: 0, netScore: 0 };
    }
  }
} 