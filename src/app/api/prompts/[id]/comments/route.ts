import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comment, user } from "@/lib/db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/prompts/[id]/comments - Get comments for a prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id;

    // Get all comments with their authors and replies
    const comments = await db
      .select({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        parentId: comment.parentId,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(comment)
      .leftJoin(user, eq(comment.authorId, user.id))
      .where(eq(comment.promptId, promptId))
      .orderBy(desc(comment.createdAt));

    // Organize comments into threads (parent comments with their replies)
    const parentComments = comments.filter(c => !c.parentId);
    const commentsWithReplies = parentComments.map(parent => ({
      ...parent,
      replies: comments
        .filter(c => c.parentId === parent.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }));

    return NextResponse.json({
      comments: commentsWithReplies,
      total: comments.length,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/prompts/[id]/comments - Create new comment
export async function POST(
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
    const { content, parentId } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Create comment
    const newComment = await db
      .insert(comment)
      .values({
        id: crypto.randomUUID(),
        content: content.trim(),
        promptId,
        authorId: session.user.id,
        parentId: parentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        parentId: comment.parentId,
      });

    // Get the comment with author info
    const commentWithAuthor = await db
      .select({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        parentId: comment.parentId,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(comment)
      .leftJoin(user, eq(comment.authorId, user.id))
      .where(eq(comment.id, newComment[0].id))
      .limit(1);

    return NextResponse.json(
      {
        message: "Comment created successfully",
        comment: commentWithAuthor[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
} 