import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/prompts/check-slug - Check if a slug is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ available: false });
    }

    if (slug.length < 3) {
      return NextResponse.json({ available: false });
    }

    // Check if slug exists
    const existingPrompt = await db
      .select({ id: prompt.id })
      .from(prompt)
      .where(eq(prompt.slug, slug))
      .limit(1);

    return NextResponse.json({
      available: existingPrompt.length === 0
    });
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
} 