import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Basic validation
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({
        available: false,
        error: "Username must be between 3 and 20 characters"
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        error: "Username can only contain letters, numbers, hyphens, and underscores"
      });
    }

    // Check if username is available
    const existing = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, username.toLowerCase()))
      .limit(1);

    const available = existing.length === 0;

    return NextResponse.json({
      available,
      username: username.toLowerCase()
    });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
} 