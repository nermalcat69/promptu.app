import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cursorRule, category, user, cursorRuleUpvote } from "@/lib/db/schema";
import { eq, desc, ilike, and, or, sql, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendPromptNotification } from "@/lib/discord";
import { generateSlug } from "@/lib/utils";

// GET /api/cursor-rules - Get cursor rules with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const ruleType = searchParams.get("type") || "";
    const categoryFilter = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "recent";

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    // Only show published cursor rules
    whereConditions.push(eq(cursorRule.published, true));

    // Search in title only
    if (search) {
      whereConditions.push(
        ilike(cursorRule.title, `%${search}%`)
      );
    }

    // Filter by rule type
    if (ruleType) {
      whereConditions.push(eq(cursorRule.ruleType, ruleType));
    }

    // Filter by category
    if (categoryFilter) {
      // For now, let's handle category filtering by name/slug when we implement categories
      // Since categories aren't fully implemented yet, we'll skip this filter
      // whereConditions.push(eq(category.slug, categoryFilter));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Determine sort order
    let orderBy;
    switch (sort) {
      case "popular":
        orderBy = desc(cursorRule.upvotes);
        break;
      case "upvotes":
        orderBy = desc(cursorRule.upvotes);
        break;
      case "views":
        orderBy = desc(cursorRule.views);
        break;
      case "copies":
        orderBy = desc(cursorRule.copyCount);
        break;
      case "recent":
      default:
        orderBy = desc(cursorRule.createdAt);
        break;
    }

    // Get cursor rules with pagination
    const cursorRules = await db
      .select({
        id: cursorRule.id,
        title: cursorRule.title,
        slug: cursorRule.slug,
        description: cursorRule.description,
        content: cursorRule.content,
        ruleType: cursorRule.ruleType,
        globs: cursorRule.globs,
        upvotes: cursorRule.upvotes,
        views: cursorRule.views,
        copyCount: cursorRule.copyCount,
        featured: cursorRule.featured,
        createdAt: cursorRule.createdAt,
        updatedAt: cursorRule.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
          username: user.username,
        },
        category: category.name,
      })
      .from(cursorRule)
      .leftJoin(user, eq(cursorRule.authorId, user.id))
      .leftJoin(category, eq(cursorRule.categoryId, category.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(cursorRule)
      .leftJoin(category, eq(cursorRule.categoryId, category.id))
      .where(whereClause);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      cursorRules,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching cursor rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch cursor rules" },
      { status: 500 }
    );
  }
}

// POST /api/cursor-rules - Create new cursor rule
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
    const {
      title,
      description,
      content,
      ruleType,
      globs,
      categoryId,
      published = true,
      tags = [],
    } = body;

    // Validate required fields
    if (!title || !description || !content || !ruleType) {
      return NextResponse.json(
        { error: "Title, description, content, and rule type are required" },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = generateSlug(title);
    
    // Ensure slug is unique
    let slugSuffix = 0;
    let finalSlug = slug;
    
    while (true) {
      const existingRule = await db
        .select({ id: cursorRule.id })
        .from(cursorRule)
        .where(eq(cursorRule.slug, finalSlug))
        .limit(1);
      
      if (existingRule.length === 0) break;
      
      slugSuffix++;
      finalSlug = `${slug}-${slugSuffix}`;
    }

    // Handle category
    let finalCategoryId = categoryId;
    if (!finalCategoryId && ruleType) {
      // Create or get category for rule type
      const existingCategory = await db
        .select({ id: category.id })
        .from(category)
        .where(eq(category.name, ruleType))
        .limit(1);

      if (existingCategory[0]) {
        finalCategoryId = existingCategory[0].id;
      }
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    if (finalSlug.length < 3) {
      return NextResponse.json(
        { error: "Slug must be at least 3 characters long" },
        { status: 400 }
      );
    }

    // Create cursor rule
    const newCursorRule = await db
      .insert(cursorRule)
      .values({
        id: crypto.randomUUID(),
        title,
        slug: finalSlug,
        description,
        content,
        ruleType,
        globs: globs || null,
        categoryId: finalCategoryId,
        authorId: session.user.id,
        upvotes: 0,
        views: 0,
        copyCount: 0,
        featured: false,
        published: published,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: cursorRule.id,
        title: cursorRule.title,
        slug: cursorRule.slug,
        description: cursorRule.description,
        ruleType: cursorRule.ruleType,
        createdAt: cursorRule.createdAt,
      });

    // Send Discord notification and track analytics only if published
    if (published) {
      try {
        // Get category name for notification
        let categoryName = "Uncategorized";
        if (finalCategoryId) {
          const categoryResult = await db
            .select({ name: category.name })
            .from(category)
            .where(eq(category.id, finalCategoryId))
            .limit(1);
          if (categoryResult[0]) {
            categoryName = categoryResult[0].name;
          }
        }

        // Get user's username from database
        const userResult = await db
          .select({ username: user.username, email: user.email })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);
        
        const username = userResult[0]?.username || session.user.email.split('@')[0];
        const userEmail = userResult[0]?.email || session.user.email;

        // Send Discord notification
        await sendPromptNotification(
          'published',
          {
            id: newCursorRule[0].id,
            title: newCursorRule[0].title,
            description: description,
            category: categoryName,
            tags: tags || [],
            isPublic: true,
          },
          {
            id: session.user.id,
            name: session.user.name,
            username: username,
            email: userEmail,
            image: session.user.image,
          }
        );

        console.log(`[Cursor Rule API] Published cursor rule notification sent for: ${newCursorRule[0].title}`);
      } catch (error) {
        console.error("[Cursor Rule API] Failed to send Discord notification:", error);
        // Don't fail the request if Discord notification fails
      }
    }

    return NextResponse.json({
      message: "Cursor rule created successfully",
      cursorRule: newCursorRule[0],
    });
  } catch (error) {
    console.error("Error creating cursor rule:", error);
    return NextResponse.json(
      { error: "Failed to create cursor rule" },
      { status: 500 }
    );
  }
} 