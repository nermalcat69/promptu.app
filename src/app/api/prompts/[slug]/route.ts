import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt, category, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cacheGet, cacheSet } from "@/lib/redis";

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
      const viewCacheKey = `view:${promptSlug}:${session?.user?.id || request.ip || 'anonymous'}`;
      
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

    // Delete prompt (comments and upvotes will be cascade deleted)
    await db.delete(prompt).where(eq(prompt.slug, promptSlug));

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