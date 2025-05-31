import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prompt, category, user, comment } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/prompts/[id] - Get single prompt with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id;

    // Get prompt with author and category
    const promptResult = await db
      .select({
        id: prompt.id,
        title: prompt.title,
        excerpt: prompt.excerpt,
        content: prompt.content,
        promptType: prompt.promptType,
        upvotes: prompt.upvotes,
        views: prompt.views,
        featured: prompt.featured,
        published: prompt.published,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
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
      .where(eq(prompt.id, promptId))
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

    if (!promptData.published && (!session || session.user.id !== promptData.author.id)) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // Increment view count (only if not the author)
    if (!session || session.user.id !== promptData.author.id) {
      await db
        .update(prompt)
        .set({ 
          views: sql`${prompt.views} + 1`,
          updatedAt: new Date()
        })
        .where(eq(prompt.id, promptId));
      
      promptData.views = Number(promptData.views) + 1;
    }

    // Get comments count
    const commentsCount = await db
      .select({ count: sql`count(*)` })
      .from(comment)
      .where(eq(comment.promptId, promptId));

    return NextResponse.json({
      prompt: {
        ...promptData,
        commentsCount: Number(commentsCount[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    );
  }
}

// PUT /api/prompts/[id] - Update prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const promptId = params.id;
    const body = await request.json();
    const { title, excerpt, content, promptType, categoryId, published } = body;

    // Check if user owns the prompt
    const existingPrompt = await db
      .select({ authorId: prompt.authorId })
      .from(prompt)
      .where(eq(prompt.id, promptId))
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
      .where(eq(prompt.id, promptId))
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

// DELETE /api/prompts/[id] - Delete prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const promptId = params.id;

    // Check if user owns the prompt
    const existingPrompt = await db
      .select({ authorId: prompt.authorId })
      .from(prompt)
      .where(eq(prompt.id, promptId))
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
    await db.delete(prompt).where(eq(prompt.id, promptId));

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