import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { cursorRule, cursorRuleUpvote } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

// GET /api/cursor-rules/[slug]/vote - Get voting status and counts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { slug } = await params;

    // Get cursor rule and current upvote count
    const ruleResult = await db
      .select({
        id: cursorRule.id,
        upvotes: cursorRule.upvotes,
      })
      .from(cursorRule)
      .where(eq(cursorRule.slug, slug))
      .limit(1);

    if (ruleResult.length === 0) {
      return NextResponse.json(
        { error: "Cursor rule not found" },
        { status: 404 }
      );
    }

    const rule = ruleResult[0];

    if (!session?.user) {
      // Return counts only for unauthenticated users
      return NextResponse.json({
        upvoted: false,
        upvoteCount: rule.upvotes || 0,
        netScore: rule.upvotes || 0,
      });
    }

    // Check if user has already upvoted
    const existingVote = await db
      .select()
      .from(cursorRuleUpvote)
      .where(
        and(
          eq(cursorRuleUpvote.cursorRuleId, rule.id),
          eq(cursorRuleUpvote.userId, session.user.id)
        )
      )
      .limit(1);

    return NextResponse.json({
      upvoted: existingVote.length > 0,
      upvoteCount: rule.upvotes || 0,
      netScore: rule.upvotes || 0,
    });
  } catch (error) {
    console.error("Error checking cursor rule voting status:", error);
    return NextResponse.json(
      { error: "Failed to check voting status" },
      { status: 500 }
    );
  }
}

// POST /api/cursor-rules/[slug]/vote - Toggle upvote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log("Cursor rule vote API called");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("Session:", session ? "authenticated" : "not authenticated");

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    console.log("Cursor rule slug:", slug);
    
    const body = await request.json();
    const { type } = body;
    console.log("Vote type:", type);

    if (!type || type !== "upvote") {
      return NextResponse.json(
        { error: "Vote type must be 'upvote'" },
        { status: 400 }
      );
    }

    // Get cursor rule
    const ruleResult = await db
      .select({
        id: cursorRule.id,
        upvotes: cursorRule.upvotes,
      })
      .from(cursorRule)
      .where(eq(cursorRule.slug, slug))
      .limit(1);

    if (ruleResult.length === 0) {
      return NextResponse.json(
        { error: "Cursor rule not found" },
        { status: 404 }
      );
    }

    const rule = ruleResult[0];

    // Check if user has already upvoted
    const existingVote = await db
      .select()
      .from(cursorRuleUpvote)
      .where(
        and(
          eq(cursorRuleUpvote.cursorRuleId, rule.id),
          eq(cursorRuleUpvote.userId, session.user.id)
        )
      )
      .limit(1);

    let upvoted: boolean;
    let newUpvoteCount: number;
    let message: string;

    if (existingVote.length > 0) {
      // Remove upvote
      await db
        .delete(cursorRuleUpvote)
        .where(
          and(
            eq(cursorRuleUpvote.cursorRuleId, rule.id),
            eq(cursorRuleUpvote.userId, session.user.id)
          )
        );

      newUpvoteCount = Math.max(0, (rule.upvotes || 0) - 1);
      upvoted = false;
      message = "Upvote removed";
    } else {
      // Add upvote
      await db.insert(cursorRuleUpvote).values({
        id: crypto.randomUUID(),
        cursorRuleId: rule.id,
        userId: session.user.id,
        createdAt: new Date(),
      });

      newUpvoteCount = (rule.upvotes || 0) + 1;
      upvoted = true;
      message = "Upvote added";
    }

    // Update cursor rule upvote count
    await db
      .update(cursorRule)
      .set({ upvotes: newUpvoteCount })
      .where(eq(cursorRule.id, rule.id));

    console.log(`${message} for cursor rule ${slug}, new count: ${newUpvoteCount}`);

    return NextResponse.json({
      upvoted,
      upvoteCount: newUpvoteCount,
      netScore: newUpvoteCount,
      message,
    });
  } catch (error) {
    console.error("Error toggling cursor rule vote:", error);
    return NextResponse.json(
      { error: "Failed to toggle vote" },
      { status: 500 }
    );
  }
} 