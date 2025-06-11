import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt, category, user } from "@/lib/db/schema";
import { eq, desc, sql, ilike, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { validatePromptContent, formatValidationErrorMessage } from "@/lib/validations/prompt-validation";
import { sendPromptNotification } from "@/lib/discord";
import { trackEvent } from "@/lib/redis";

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
        ilike(prompt.title, `%${search}%`)
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
    const { title, excerpt, content, promptType, categoryId, slug, tags, published = true } = body;

    // Handle category lookup if category name is provided instead of ID
    let finalCategoryId = categoryId;
    if (typeof categoryId === 'string' && categoryId && !/^[0-9a-f-]+$/.test(categoryId)) {
      // If categoryId looks like a name/slug, try to find the category
      const categoryResult = await db
        .select({ id: category.id })
        .from(category)
        .where(eq(category.name, categoryId))
        .limit(1);
      
      if (categoryResult[0]) {
        finalCategoryId = categoryResult[0].id;
      } else {
        finalCategoryId = null; // Category not found, set to null
      }
    }

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
        id: prompt.id,
        title: prompt.title,
        slug: prompt.slug,
        excerpt: prompt.excerpt,
        promptType: prompt.promptType,
        createdAt: prompt.createdAt,
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
            id: newPrompt[0].id,
            title: newPrompt[0].title,
            description: excerpt,
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

        // Track analytics event
        await trackEvent('prompt_published', {
          userId: session.user.id,
          promptId: newPrompt[0].id,
          title: newPrompt[0].title,
          slug: newPrompt[0].slug,
          promptType: newPrompt[0].promptType,
          category: categoryName,
        });

        console.log(`[Prompt API] Published prompt notification sent for: ${newPrompt[0].title}`);
      } catch (error) {
        console.error("[Prompt API] Failed to send Discord notification:", error);
        // Don't fail the request if Discord notification fails
      }
    }

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