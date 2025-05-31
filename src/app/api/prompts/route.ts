import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt, category, user } from "@/lib/db/schema";
import { eq, desc, sql, ilike, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/prompts - List prompts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const type = searchParams.get("type");
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recent";

    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    
    if (type && type !== "all") {
      conditions.push(eq(prompt.promptType, type));
    }
    
    if (categorySlug && categorySlug !== "all") {
      const categoryResult = await db.select().from(category).where(eq(category.slug, categorySlug)).limit(1);
      if (categoryResult[0]) {
        conditions.push(eq(prompt.categoryId, categoryResult[0].id));
      }
    }
    
    if (search) {
      conditions.push(
        sql`(${ilike(prompt.title, `%${search}%`)} OR ${ilike(prompt.excerpt, `%${search}%`)})`
      );
    }

    // Add published filter
    conditions.push(eq(prompt.published, true));

    // Build sort order
    let orderBy;
    switch (sort) {
      case "popular":
        orderBy = desc(prompt.views);
        break;
      case "upvotes":
        orderBy = desc(prompt.upvotes);
        break;
      default:
        orderBy = desc(prompt.createdAt);
    }

    // Execute query
    const prompts = await db
      .select({
        id: prompt.id,
        title: prompt.title,
        excerpt: prompt.excerpt,
        promptType: prompt.promptType,
        upvotes: prompt.upvotes,
        views: prompt.views,
        featured: prompt.featured,
        createdAt: prompt.createdAt,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
      })
      .from(prompt)
      .leftJoin(user, eq(prompt.authorId, user.id))
      .leftJoin(category, eq(prompt.categoryId, category.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(prompt)
      .leftJoin(category, eq(prompt.categoryId, category.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      prompts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create new prompt
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, excerpt, content, promptType, categoryId, tags } = body;

    // Validate required fields
    if (!title || !excerpt || !content || !promptType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create prompt
    const newPrompt = await db
      .insert(prompt)
      .values({
        id: crypto.randomUUID(),
        title,
        excerpt,
        content,
        promptType,
        categoryId,
        authorId: session.user.id,
        upvotes: 0,
        views: 0,
        featured: false,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: prompt.id,
        title: prompt.title,
        excerpt: prompt.excerpt,
        promptType: prompt.promptType,
        createdAt: prompt.createdAt,
      });

    return NextResponse.json(
      { 
        message: "Prompt created successfully",
        prompt: newPrompt[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
} 