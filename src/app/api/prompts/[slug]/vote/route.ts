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
        upvoteCount: counts.upvoteCount,
        netScore: counts.netScore,
      });
    }

    // Get full voting status for authenticated users
    const result = await votingService.getVotingStatus(promptSlug, session.user.id);

    return NextResponse.json({
      upvoted: result.upvoted,
      upvoteCount: result.upvoteCount,
      netScore: result.upvoteCount,
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
    console.log("Vote API called");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("Session:", session ? "authenticated" : "not authenticated");

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug: promptSlug } = await params;
    console.log("Prompt slug:", promptSlug);
    
    const body = await request.json();
    const { type } = body; // only "upvote" supported now
    console.log("Vote type:", type);

    if (!type || type !== "upvote") {
      return NextResponse.json(
        { error: "Vote type must be 'upvote'" },
        { status: 400 }
      );
    }

    const votingService = getVotingService();

    // Toggle upvote using service
    const result = await votingService.toggleUpvote(promptSlug, session.user.id);

    return NextResponse.json({
      upvoted: result.upvoted,
      upvoteCount: result.upvoteCount,
      netScore: result.upvoteCount,
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