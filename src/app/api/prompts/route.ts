import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt, category, user } from "@/lib/db/schema";
import { eq, desc, sql, ilike, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { validatePromptContent, formatValidationErrorMessage } from "@/lib/validations/prompt-validation";

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
        slug: prompt.slug,
        excerpt: prompt.excerpt,
        content: prompt.content,
        promptType: prompt.promptType,
        upvotes: prompt.upvotes,
        views: prompt.views,
        copyCount: prompt.copyCount,
        featured: prompt.featured,
        createdAt: prompt.createdAt,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
          username: user.username,
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
    const { title, excerpt, content, promptType, categoryId, slug, tags } = body;

    // Validate content using our validation utility
    const validation = validatePromptContent({
      title: title || '',
      description: excerpt || '',
      content: content || '',
    });

    if (!validation.isValid) {
      const errorMessages = validation.errors.map(formatValidationErrorMessage);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: errorMessages,
          validationErrors: validation.errors
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!title || !excerpt || !content || !promptType || !slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    if (slug.length < 3) {
      return NextResponse.json(
        { error: "Slug must be at least 3 characters long" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPrompt = await db
      .select({ id: prompt.id })
      .from(prompt)
      .where(eq(prompt.slug, slug))
      .limit(1);

    if (existingPrompt.length > 0) {
      return NextResponse.json(
        { error: "This URL slug is already taken. Please choose a different one." },
        { status: 400 }
      );
    }

    // Create prompt
    const newPrompt = await db
      .insert(prompt)
      .values({
        id: crypto.randomUUID(),
        title,
        slug,
        excerpt,
        content,
        promptType,
        categoryId,
        authorId: session.user.id,
        upvotes: 0,
        views: 0,
        copyCount: 0,
        featured: false,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: prompt.id,
        title: prompt.title,
        slug: prompt.slug,
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