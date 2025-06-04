import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/user/profile - Get current user's profile
export async function GET(request: NextRequest) {
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

    const userProfile = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        bio: user.bio,
        website: user.website,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userProfile[0]) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update current user's profile
export async function PUT(request: NextRequest) {
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
    const { name, username, bio, website } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate username if provided
    if (username) {
      if (username.length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters" },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return NextResponse.json(
          { error: "Username can only contain letters, numbers, hyphens, and underscores" },
          { status: 400 }
        );
      }

      // Check if username is already taken by another user
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.username, username), sql`${user.id} != ${session.user.id}`))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Validate website URL if provided
    if (website && website.trim()) {
      try {
        const url = website.startsWith('http') ? website : `https://${website}`;
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: "Please enter a valid website URL" },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await db
      .update(user)
      .set({
        name: name.trim(),
        username: username || null,
        bio: bio || null,
        website: website || null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        website: user.website,
      });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser[0]
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 