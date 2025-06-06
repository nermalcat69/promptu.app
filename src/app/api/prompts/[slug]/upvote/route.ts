import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVotingService } from "@/services/ServiceFactory";

// GET /api/prompts/[slug]/vote - Get voting status and counts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { slug: promptSlug } = await params;
    const votingService = getVotingService();

    if (!session) {
      // Return counts only for unauthenticated users
      const counts = await votingService.getVoteCounts(promptSlug);
      return NextResponse.json({
        upvoted: false,
        downvoted: false,
        upvoteCount: counts.upvoteCount,
        downvoteCount: counts.downvoteCount,
        netScore: counts.netScore,
      });
    }

    // Get full voting status for authenticated users
    const result = await votingService.getVotingStatus(promptSlug, session.user.id);

    return NextResponse.json({
      upvoted: result.upvoted,
      downvoted: result.downvoted,
      upvoteCount: result.upvoteCount,
      downvoteCount: result.downvoteCount,
      netScore: result.upvoteCount - result.downvoteCount,
    });
  } catch (error) {
    console.error("Error checking voting status:", error);
    return NextResponse.json(
      { error: "Failed to check voting status" },
      { status: 500 }
    );
  }
}

// POST /api/prompts/[slug]/vote - Toggle upvote or downvote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug: promptSlug } = await params;
    const body = await request.json();
    const { type } = body; // "upvote" or "downvote"

    if (!type || !["upvote", "downvote"].includes(type)) {
      return NextResponse.json(
        { error: "Vote type must be 'upvote' or 'downvote'" },
        { status: 400 }
      );
    }

    const votingService = getVotingService();

    // Toggle vote using service
    const result = type === "upvote" 
      ? await votingService.toggleUpvote(promptSlug, session.user.id)
      : await votingService.toggleDownvote(promptSlug, session.user.id);

    return NextResponse.json({
      upvoted: result.upvoted,
      downvoted: result.downvoted,
      upvoteCount: result.upvoteCount,
      downvoteCount: result.downvoteCount,
      netScore: result.upvoteCount - result.downvoteCount,
      message: result.message,
    });
  } catch (error) {
    console.error("Error toggling vote:", error);
    
    // Handle specific service errors
    if (error instanceof Error) {
      if (error.message === "Prompt not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to toggle vote" },
      { status: 500 }
    );
  }
} 