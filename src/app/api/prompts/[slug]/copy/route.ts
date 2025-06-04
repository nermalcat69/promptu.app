import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// POST /api/prompts/[slug]/copy - Increment copy count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: promptSlug } = await params;

    // Increment copy count
    await db
      .update(prompt)
      .set({
        copyCount: sql`${prompt.copyCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(prompt.slug, promptSlug));

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