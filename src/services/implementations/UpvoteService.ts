import { db } from "@/lib/db";
import { prompt, upvote, downvote } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { IVotingService } from "../interfaces/IUpvoteService";

export class VotingService implements IVotingService {
  /**
   * Toggle upvote for a prompt
   */
  async toggleUpvote(promptSlug: string, userId: string): Promise<{
    upvoted: boolean;
    downvoted: boolean;
    upvoteCount: number;
    downvoteCount: number;
    message: string;
  }> {
    try {
      // Get prompt ID from slug
      const promptResult = await db
        .select({ 
          id: prompt.id, 
          authorId: prompt.authorId, 
          upvotes: prompt.upvotes,
          downvotes: prompt.downvotes
        })
        .from(prompt)
        .where(eq(prompt.slug, promptSlug))
        .limit(1);

      if (!promptResult[0]) {
        throw new Error("Prompt not found");
      }

      const { id: promptId, upvotes: currentUpvotes, downvotes: currentDownvotes } = promptResult[0];

      // Check existing votes
      const [existingUpvote, existingDownvote] = await Promise.all([
        db.select({ id: upvote.id }).from(upvote)
          .where(and(eq(upvote.promptId, promptId), eq(upvote.userId, userId)))
          .limit(1),
        db.select({ id: downvote.id }).from(downvote)
          .where(and(eq(downvote.promptId, promptId), eq(downvote.userId, userId)))
          .limit(1)
      ]);

      let newUpvotes = currentUpvotes || 0;
      let newDownvotes = currentDownvotes || 0;
      let message = "";
      let upvoted = false;
      let downvoted = !!existingDownvote[0];

      if (existingUpvote[0]) {
        // Remove existing upvote
        await db.delete(upvote).where(eq(upvote.id, existingUpvote[0].id));
        newUpvotes = Math.max(0, newUpvotes - 1);
        message = "Upvote removed";
        upvoted = false;
      } else {
        // Remove downvote if exists (user is switching from downvote to upvote)
        if (existingDownvote[0]) {
          await db.delete(downvote).where(eq(downvote.id, existingDownvote[0].id));
          newDownvotes = Math.max(0, newDownvotes - 1);
          downvoted = false;
        }

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
        downvotes: newDownvotes,
        updatedAt: new Date()
      }).where(eq(prompt.id, promptId));

      return {
        upvoted,
        downvoted,
        upvoteCount: newUpvotes,
        downvoteCount: newDownvotes,
        message,
      };
    } catch (error) {
      console.error("Error toggling upvote:", error);
      throw error;
    }
  }

  /**
   * Toggle downvote for a prompt
   */
  async toggleDownvote(promptSlug: string, userId: string): Promise<{
    upvoted: boolean;
    downvoted: boolean;
    upvoteCount: number;
    downvoteCount: number;
    message: string;
  }> {
    try {
      // Get prompt ID from slug
      const promptResult = await db
        .select({ 
          id: prompt.id, 
          authorId: prompt.authorId, 
          upvotes: prompt.upvotes,
          downvotes: prompt.downvotes
        })
        .from(prompt)
        .where(eq(prompt.slug, promptSlug))
        .limit(1);

      if (!promptResult[0]) {
        throw new Error("Prompt not found");
      }

      const { id: promptId, upvotes: currentUpvotes, downvotes: currentDownvotes } = promptResult[0];

      // Check existing votes
      const [existingUpvote, existingDownvote] = await Promise.all([
        db.select({ id: upvote.id }).from(upvote)
          .where(and(eq(upvote.promptId, promptId), eq(upvote.userId, userId)))
          .limit(1),
        db.select({ id: downvote.id }).from(downvote)
          .where(and(eq(downvote.promptId, promptId), eq(downvote.userId, userId)))
          .limit(1)
      ]);

      let newUpvotes = currentUpvotes || 0;
      let newDownvotes = currentDownvotes || 0;
      let message = "";
      let upvoted = !!existingUpvote[0];
      let downvoted = false;

      if (existingDownvote[0]) {
        // Remove existing downvote
        await db.delete(downvote).where(eq(downvote.id, existingDownvote[0].id));
        newDownvotes = Math.max(0, newDownvotes - 1);
        message = "Downvote removed";
        downvoted = false;
      } else {
        // Remove upvote if exists (user is switching from upvote to downvote)
        if (existingUpvote[0]) {
          await db.delete(upvote).where(eq(upvote.id, existingUpvote[0].id));
          newUpvotes = Math.max(0, newUpvotes - 1);
          upvoted = false;
        }

        // Add downvote
        await db.insert(downvote).values({
          id: crypto.randomUUID(),
          promptId,
          userId,
          createdAt: new Date(),
        });
        newDownvotes += 1;
        message = "Prompt downvoted";
        downvoted = true;
      }

      // Update prompt counts
      await db.update(prompt).set({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        updatedAt: new Date()
      }).where(eq(prompt.id, promptId));

      return {
        upvoted,
        downvoted,
        upvoteCount: newUpvotes,
        downvoteCount: newDownvotes,
        message,
      };
    } catch (error) {
      console.error("Error toggling downvote:", error);
      throw error;
    }
  }

  /**
   * Get user's voting status for a prompt
   */
  async getVotingStatus(promptSlug: string, userId: string): Promise<{
    upvoted: boolean;
    downvoted: boolean;
    upvoteCount: number;
    downvoteCount: number;
  }> {
    try {
      // Get prompt ID and counts from slug
      const promptResult = await db
        .select({ 
          id: prompt.id,
          upvotes: prompt.upvotes,
          downvotes: prompt.downvotes
        })
        .from(prompt)
        .where(eq(prompt.slug, promptSlug))
        .limit(1);

      if (!promptResult[0]) {
        return { upvoted: false, downvoted: false, upvoteCount: 0, downvoteCount: 0 };
      }

      const { id: promptId, upvotes: upvoteCount, downvotes: downvoteCount } = promptResult[0];

      // Check user's voting status
      const [existingUpvote, existingDownvote] = await Promise.all([
        db.select({ id: upvote.id }).from(upvote)
          .where(and(eq(upvote.promptId, promptId), eq(upvote.userId, userId)))
          .limit(1),
        db.select({ id: downvote.id }).from(downvote)
          .where(and(eq(downvote.promptId, promptId), eq(downvote.userId, userId)))
          .limit(1)
      ]);

      return {
        upvoted: !!existingUpvote[0],
        downvoted: !!existingDownvote[0],
        upvoteCount: upvoteCount || 0,
        downvoteCount: downvoteCount || 0,
      };
    } catch (error) {
      console.error("Error getting voting status:", error);
      return { upvoted: false, downvoted: false, upvoteCount: 0, downvoteCount: 0 };
    }
  }

  /**
   * Get vote counts for a prompt
   */
  async getVoteCounts(promptSlug: string): Promise<{
    upvoteCount: number;
    downvoteCount: number;
    netScore: number;
  }> {
    try {
      // Get prompt vote counts directly from prompt table
      const promptResult = await db
        .select({ 
          upvotes: prompt.upvotes,
          downvotes: prompt.downvotes
        })
        .from(prompt)
        .where(eq(prompt.slug, promptSlug))
        .limit(1);

      if (!promptResult[0]) {
        return { upvoteCount: 0, downvoteCount: 0, netScore: 0 };
      }

      const upvoteCount = promptResult[0].upvotes || 0;
      const downvoteCount = promptResult[0].downvotes || 0;

      return { 
        upvoteCount,
        downvoteCount,
        netScore: upvoteCount - downvoteCount
      };
    } catch (error) {
      console.error("Error getting vote counts:", error);
      return { upvoteCount: 0, downvoteCount: 0, netScore: 0 };
    }
  }
} 