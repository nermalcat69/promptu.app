import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt, upvote } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/prompts/[slug]/upvote - Check if user has upvoted
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ upvoted: false });
    }

    const promptSlug = params.slug;

    // Get prompt ID from slug
    const promptResult = await db
      .select({ id: prompt.id })
      .from(prompt)
      .where(eq(prompt.slug, promptSlug))
      .limit(1);

    if (!promptResult[0]) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    const promptId = promptResult[0].id;

    // Check if user has upvoted this prompt
    const existingUpvote = await db
      .select({ id: upvote.id })
      .from(upvote)
      .where(and(
        eq(upvote.promptId, promptId),
        eq(upvote.userId, session.user.id)
      ))
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

// POST /api/prompts/[slug]/upvote - Toggle upvote
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
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

    const promptSlug = params.slug;

    // Get prompt ID from slug
    const promptResult = await db
      .select({ id: prompt.id, authorId: prompt.authorId })
      .from(prompt)
      .where(eq(prompt.slug, promptSlug))
      .limit(1);

    if (!promptResult[0]) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    const promptId = promptResult[0].id;
    const authorId = promptResult[0].authorId;

    // Prevent users from upvoting their own prompts
    if (authorId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot upvote your own prompt" },
        { status: 400 }
      );
    }

    // Check if user has already upvoted
    const existingUpvote = await db
      .select({ id: upvote.id })
      .from(upvote)
      .where(and(
        eq(upvote.promptId, promptId),
        eq(upvote.userId, session.user.id)
      ))
      .limit(1);

    if (existingUpvote[0]) {
      // Remove upvote
      await db
        .delete(upvote)
        .where(eq(upvote.id, existingUpvote[0].id));

      // Decrement upvote count
      await db
        .update(prompt)
        .set({
          upvotes: sql`${prompt.upvotes} - 1`,
          updatedAt: new Date()
        })
        .where(eq(prompt.id, promptId));

      return NextResponse.json({
        upvoted: false,
        message: "Upvote removed",
      });
    } else {
      // Add upvote
      await db
        .insert(upvote)
        .values({
          id: crypto.randomUUID(),
          promptId,
          userId: session.user.id,
          createdAt: new Date(),
        });

      // Increment upvote count
      await db
        .update(prompt)
        .set({
          upvotes: sql`${prompt.upvotes} + 1`,
          updatedAt: new Date()
        })
        .where(eq(prompt.id, promptId));

      return NextResponse.json({
        upvoted: true,
        message: "Prompt upvoted",
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