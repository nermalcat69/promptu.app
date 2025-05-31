import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt, upvote } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/prompts/[id]/upvote - Toggle upvote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const promptId = params.id;
    const userId = session.user.id;

    // Check if user already upvoted
    const existingUpvote = await db
      .select()
      .from(upvote)
      .where(and(eq(upvote.promptId, promptId), eq(upvote.userId, userId)))
      .limit(1);

    if (existingUpvote[0]) {
      // Remove upvote
      await db
        .delete(upvote)
        .where(and(eq(upvote.promptId, promptId), eq(upvote.userId, userId)));

      // Decrease prompt upvote count
      await db
        .update(prompt)
        .set({ 
          upvotes: sql`${prompt.upvotes} - 1`,
          updatedAt: new Date()
        })
        .where(eq(prompt.id, promptId));

      return NextResponse.json({
        message: "Upvote removed",
        upvoted: false,
      });
    } else {
      // Add upvote
      await db.insert(upvote).values({
        id: crypto.randomUUID(),
        promptId,
        userId,
        createdAt: new Date(),
      });

      // Increase prompt upvote count
      await db
        .update(prompt)
        .set({ 
          upvotes: sql`${prompt.upvotes} + 1`,
          updatedAt: new Date()
        })
        .where(eq(prompt.id, promptId));

      return NextResponse.json({
        message: "Upvote added",
        upvoted: true,
      });
    }
  } catch (error) {
    console.error("Error toggling upvote:", error);
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 }
    );
  }
}

// GET /api/prompts/[id]/upvote - Check if user upvoted
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ upvoted: false });
    }

    const promptId = params.id;
    const userId = session.user.id;

    const existingUpvote = await db
      .select()
      .from(upvote)
      .where(and(eq(upvote.promptId, promptId), eq(upvote.userId, userId)))
      .limit(1);

    return NextResponse.json({
      upvoted: !!existingUpvote[0],
    });
  } catch (error) {
    console.error("Error checking upvote status:", error);
    return NextResponse.json(
      { error: "Failed to check upvote status" },
      { status: 500 }
    );
  }
} 