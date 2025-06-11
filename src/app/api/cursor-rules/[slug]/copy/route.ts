import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cursorRule } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// POST /api/cursor-rules/[slug]/copy - Increment copy count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: ruleSlug } = await params;

    // Increment copy count
    await db
      .update(cursorRule)
      .set({
        copyCount: sql`${cursorRule.copyCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(cursorRule.slug, ruleSlug));

    return NextResponse.json({
      message: "Copy count incremented",
    });
  } catch (error) {
    console.error("Error incrementing copy count:", error);
    return NextResponse.json(
      { error: "Failed to increment copy count" },
      { status: 500 }
    );
  }
} 