import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cursorRule, category, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendPromptNotification } from "@/lib/discord";

// GET /api/cursor-rules/[slug] - Get single cursor rule with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: ruleSlug } = await params;

    // Get cursor rule with author and category by slug
    const ruleResult = await db
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
        published: cursorRule.published,
        createdAt: cursorRule.createdAt,
        updatedAt: cursorRule.updatedAt,
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
      .from(cursorRule)
      .leftJoin(user, eq(cursorRule.authorId, user.id))
      .leftJoin(category, eq(cursorRule.categoryId, category.id))
      .where(eq(cursorRule.slug, ruleSlug))
      .limit(1);

    if (!ruleResult[0]) {
      return NextResponse.json(
        { error: "Cursor rule not found" },
        { status: 404 }
      );
    }

    const ruleData = ruleResult[0];

    // Check if cursor rule is published or user is author
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!ruleData.published && (!session || session.user.id !== ruleData.author?.id)) {
      return NextResponse.json(
        { error: "Cursor rule not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await db
      .update(cursorRule)
      .set({
        views: sql`${cursorRule.views} + 1`,
        updatedAt: new Date()
      })
      .where(eq(cursorRule.slug, ruleSlug));

    // Update the view count in the returned data
    ruleData.views = (ruleData.views || 0) + 1;

    return NextResponse.json(ruleData);
  } catch (error) {
    console.error("Error fetching cursor rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch cursor rule" },
      { status: 500 }
    );
  }
}

// PUT /api/cursor-rules/[slug] - Update cursor rule
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

    const { slug: ruleSlug } = await params;
    const body = await request.json();
    const { title, description, content, ruleType, globs, categoryId, published } = body;

    // Check if user owns the cursor rule
    const existingRule = await db
      .select({ id: cursorRule.id, authorId: cursorRule.authorId })
      .from(cursorRule)
      .where(eq(cursorRule.slug, ruleSlug))
      .limit(1);

    if (!existingRule[0]) {
      return NextResponse.json(
        { error: "Cursor rule not found" },
        { status: 404 }
      );
    }

    if (existingRule[0].authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Update cursor rule
    const updatedRule = await db
      .update(cursorRule)
      .set({
        title,
        description,
        content,
        ruleType,
        globs: globs || null,
        categoryId,
        published,
        updatedAt: new Date(),
      })
      .where(eq(cursorRule.slug, ruleSlug))
      .returning({
        id: cursorRule.id,
        title: cursorRule.title,
        description: cursorRule.description,
        ruleType: cursorRule.ruleType,
        published: cursorRule.published,
        updatedAt: cursorRule.updatedAt,
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
          id: updatedRule[0].id,
          title: updatedRule[0].title,
          description: description,
          category: categoryName,
          tags: [], // Tags not available in this context
          isPublic: updatedRule[0].published ?? false,
        },
        {
          id: session.user.id,
          name: session.user.name,
          username: username,
          email: userEmail,
          image: session.user.image,
        }
      );

      console.log(`[Cursor Rule API] Edited cursor rule notification sent for: ${updatedRule[0].title}`);
    } catch (error) {
      console.error("[Cursor Rule API] Failed to send Discord notification:", error);
      // Don't fail the request if Discord notification fails
    }

    return NextResponse.json({
      message: "Cursor rule updated successfully",
      cursorRule: updatedRule[0],
    });
  } catch (error) {
    console.error("Error updating cursor rule:", error);
    return NextResponse.json(
      { error: "Failed to update cursor rule" },
      { status: 500 }
    );
  }
}

// DELETE /api/cursor-rules/[slug] - Delete cursor rule
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

    const { slug: ruleSlug } = await params;

    // Check if user owns the cursor rule
    const existingRule = await db
      .select({ 
        id: cursorRule.id, 
        authorId: cursorRule.authorId,
        title: cursorRule.title,
        description: cursorRule.description,
        categoryId: cursorRule.categoryId,
        published: cursorRule.published
      })
      .from(cursorRule)
      .where(eq(cursorRule.slug, ruleSlug))
      .limit(1);

    if (!existingRule[0]) {
      return NextResponse.json(
        { error: "Cursor rule not found" },
        { status: 404 }
      );
    }

    if (existingRule[0].authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      );
    }

    // Get additional data for Discord notification before deletion
    let categoryName = "Uncategorized";
    if (existingRule[0].categoryId) {
      const categoryResult = await db
        .select({ name: category.name })
        .from(category)
        .where(eq(category.id, existingRule[0].categoryId))
        .limit(1);
      if (categoryResult[0]) {
        categoryName = categoryResult[0].name;
      }
    }

    // Delete cursor rule (upvotes will be cascade deleted)
    await db.delete(cursorRule).where(eq(cursorRule.slug, ruleSlug));

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
          id: existingRule[0].id,
          title: existingRule[0].title,
          description: existingRule[0].description,
          category: categoryName,
          tags: [],
          isPublic: existingRule[0].published ?? false,
        },
        {
          id: session.user.id,
          name: session.user.name,
          username: username,
          email: userEmail,
          image: session.user.image,
        }
      );

      console.log(`[Cursor Rule API] Deleted cursor rule notification sent for: ${existingRule[0].title}`);
    } catch (error) {
      console.error("[Cursor Rule API] Failed to send Discord notification:", error);
      // Don't fail the request if Discord notification fails
    }

    return NextResponse.json({
      message: "Cursor rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cursor rule:", error);
    return NextResponse.json(
      { error: "Failed to delete cursor rule" },
      { status: 500 }
    );
  }
} 