import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await db
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        promptType: category.promptType,
        promptCount: sql`count(*)`.as('promptCount'),
      })
      .from(category)
      .groupBy(category.id)
      .orderBy(category.name);

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
} 