import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt, user, category } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cacheGet, cacheSet } from "@/lib/redis";
import { sendPromptNotification } from "@/lib/discord";
import { trackEvent } from "@/lib/redis";

// Simple in-memory cache for view tracking when Redis is not available
const viewCache = new Map<string, number>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

function isRecentlyViewed(key: string): boolean {
  const timestamp = viewCache.get(key);
  if (!timestamp) return false;
  
  const now = Date.now();
  if (now - timestamp > CACHE_DURATION) {
    viewCache.delete(key);
    return false;
  }
  
  return true;
}

function markAsViewed(key: string): void {
  viewCache.set(key, Date.now());
  
  // Clean up old entries periodically
  if (viewCache.size > 1000) {
    const now = Date.now();
    for (const [k, timestamp] of viewCache.entries()) {
      if (now - timestamp > CACHE_DURATION) {
        viewCache.delete(k);
      }
    }
  }
}

// GET /api/prompts/[slug] - Get single prompt with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: promptSlug } = await params;

    // Get prompt with author and category by slug
    const promptResult = await db
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
        published: prompt.published,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
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
      .where(eq(prompt.slug, promptSlug))
      .limit(1);

    if (!promptResult[0]) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    const promptData = promptResult[0];

    // Check if prompt is published or user is author
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!promptData.published && (!session || session.user.id !== promptData.author?.id)) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // Increment view count (only if not the author and not recently viewed)
    if (!session || session.user.id !== promptData.author?.id) {
      // Get client IP from headers
      const headersList = await headers();
      const forwarded = headersList.get('x-forwarded-for');
      const realIp = headersList.get('x-real-ip');
      const clientIp = forwarded?.split(',')[0] || realIp || 'anonymous';
      
      const viewCacheKey = `view:${promptSlug}:${session?.user?.id || clientIp}`;
      
      // Check both Redis cache and in-memory cache
      const [redisRecentlyViewed, memoryRecentlyViewed] = await Promise.all([
        cacheGet(viewCacheKey),
        Promise.resolve(isRecentlyViewed(viewCacheKey))
      ]);
      
      const recentlyViewed = redisRecentlyViewed || memoryRecentlyViewed;
      
      if (!recentlyViewed) {
        try {
          // Increment in database
          await db
            .update(prompt)
            .set({ 
              views: sql`${prompt.views} + 1`,
              updatedAt: new Date()
            })
            .where(eq(prompt.slug, promptSlug));
          
          // Update the returned data
          promptData.views = Number(promptData.views) + 1;
          
          // Set cache to prevent duplicate views for 1 hour
          await Promise.all([
            cacheSet(viewCacheKey, '1', 3600), // Redis cache (may fail silently)
            Promise.resolve(markAsViewed(viewCacheKey)) // In-memory cache (always works)
          ]);
          
          console.log(`View tracked for prompt ${promptSlug}, new count: ${promptData.views}`);
        } catch (dbError) {
          console.error('Error incrementing view count:', dbError);
          // Don't fail the request if view tracking fails
        }
      } else {
        console.log(`View skipped for prompt ${promptSlug} - recently viewed`);
      }
    } else {
      console.log(`View skipped for prompt ${promptSlug} - user is author`);
    }

    return NextResponse.json(promptData);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/[slug] - Update prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug: promptSlug } = await params;
    const body = await request.json();
    const { title, excerpt, content, promptType, categoryId, published } = body;

    // Check if user owns the prompt
    const existingPrompt = await db
      .select({ id: prompt.id, authorId: prompt.authorId })
      .from(prompt)
      .where(eq(prompt.slug, promptSlug))
      .limit(1);

    if (!existingPrompt[0]) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    if (existingPrompt[0].authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Update prompt
    const updatedPrompt = await db
      .update(prompt)
      .set({
        title,
        excerpt,
        content,
        promptType,
        categoryId,
        published,
        updatedAt: new Date(),
      })
      .where(eq(prompt.slug, promptSlug))
      .returning({
        id: prompt.id,
        title: prompt.title,
        excerpt: prompt.excerpt,
        promptType: prompt.promptType,
        published: prompt.published,
        updatedAt: prompt.updatedAt,
      });

    // Send Discord notification and track analytics
    try {
      // Get category name for notification
      let categoryName = "Uncategorized";
      if (categoryId) {
        const categoryResult = await db
          .select({ name: category.name })
          .from(category)
          .where(eq(category.id, categoryId))
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
        'edited',
        {
          id: updatedPrompt[0].id,
          title: updatedPrompt[0].title,
          description: excerpt,
          category: categoryName,
          tags: [], // Tags not available in this context
          isPublic: updatedPrompt[0].published ?? false,
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
      await trackEvent('prompt_edited', {
        userId: session.user.id,
        promptId: updatedPrompt[0].id,
        title: updatedPrompt[0].title,
        slug: promptSlug,
        promptType: updatedPrompt[0].promptType,
        category: categoryName,
        published: updatedPrompt[0].published,
      });

      console.log(`[Prompt API] Edited prompt notification sent for: ${updatedPrompt[0].title}`);
    } catch (error) {
      console.error("[Prompt API] Failed to send Discord notification:", error);
      // Don't fail the request if Discord notification fails
    }

    return NextResponse.json({
      message: "Prompt updated successfully",
      prompt: updatedPrompt[0],
    });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[slug] - Delete prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    const { slug: promptSlug } = await params;

    // Check if user owns the prompt
    const existingPrompt = await db
      .select({ 
        id: prompt.id, 
        authorId: prompt.authorId,
        title: prompt.title,
        excerpt: prompt.excerpt,
        categoryId: prompt.categoryId,
        published: prompt.published
      })
      .from(prompt)
      .where(eq(prompt.slug, promptSlug))
      .limit(1);

    if (!existingPrompt[0]) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    if (existingPrompt[0].authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Get additional data for Discord notification before deletion
    let categoryName = "Uncategorized";
    if (existingPrompt[0].categoryId) {
      const categoryResult = await db
        .select({ name: category.name })
        .from(category)
        .where(eq(category.id, existingPrompt[0].categoryId))
        .limit(1);
      if (categoryResult[0]) {
        categoryName = categoryResult[0].name;
      }
    }

    // Delete prompt (comments and upvotes will be cascade deleted)
    await db.delete(prompt).where(eq(prompt.slug, promptSlug));

    // Send Discord notification and track analytics after successful deletion
    try {
      // Get user's username and email from database
      const userResult = await db
        .select({ username: user.username, email: user.email })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);
      
      const username = userResult[0]?.username || session.user.email.split('@')[0];
      const userEmail = userResult[0]?.email || session.user.email;

      // Send Discord notification
      await sendPromptNotification(
        'deleted',
        {
          id: existingPrompt[0].id,
          title: existingPrompt[0].title,
          description: existingPrompt[0].excerpt,
          category: categoryName,
          tags: [],
          isPublic: existingPrompt[0].published ?? false,
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
      await trackEvent('prompt_deleted', {
        userId: session.user.id,
        promptId: existingPrompt[0].id,
        title: existingPrompt[0].title,
        slug: promptSlug,
        category: categoryName,
      });

      console.log(`[Prompt API] Deleted prompt notification sent for: ${existingPrompt[0].title}`);
    } catch (error) {
      console.error("[Prompt API] Failed to send Discord notification:", error);
      // Don't fail the request if Discord notification fails
    }

    return NextResponse.json({
      message: "Prompt deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    );
  }
} 