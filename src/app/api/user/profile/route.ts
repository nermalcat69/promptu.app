import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendRegistrationNotification } from "@/lib/discord";
import { incrementRegistrationCount, incrementDailyRegistrations, trackEvent } from "@/lib/redis";

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
    console.log("[Profile API] PUT request started");
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("[Profile API] Session:", session ? { 
      userId: session.user.id, 
      userName: session.user.name, 
      userEmail: session.user.email 
    } : null);

    if (!session) {
      console.log("[Profile API] No session found, returning 401");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("[Profile API] Request body:", body);
    
    const { name, username, bio, website } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      console.log("[Profile API] Validation failed: Name is required");
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate username if provided
    if (username) {
      if (username.length < 3) {
        console.log("[Profile API] Validation failed: Username too short");
        return NextResponse.json(
          { error: "Username must be at least 3 characters" },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        console.log("[Profile API] Validation failed: Invalid username characters");
        return NextResponse.json(
          { error: "Username can only contain letters, numbers, hyphens, and underscores" },
          { status: 400 }
        );
      }

      // Check if username is already taken by another user
      console.log("[Profile API] Checking if username is already taken");
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.username, username), sql`${user.id} != ${session.user.id}`))
        .limit(1);

      if (existingUser.length > 0) {
        console.log("[Profile API] Username already taken");
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
        console.log("[Profile API] Validation failed: Invalid website URL");
        return NextResponse.json(
          { error: "Please enter a valid website URL" },
          { status: 400 }
        );
      }
    }

    console.log("[Profile API] All validations passed, updating user profile");

    // First, check if user exists in database
    const existingUserRecord = await db
      .select({ id: user.id, name: user.name, email: user.email, username: user.username })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    console.log("[Profile API] Existing user record:", existingUserRecord[0] || "Not found");

    if (!existingUserRecord[0]) {
      console.log("[Profile API] User not found in database, this shouldn't happen after OAuth");
      return NextResponse.json(
        { error: "User record not found" },
        { status: 404 }
      );
    }

    // Check if this is the first time setting a username (completing onboarding)
    const isFirstTimeOnboarding = !existingUserRecord[0].username && username;

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

    console.log("[Profile API] Profile updated successfully:", updatedUser[0]);

    // Verify the update actually saved by querying the database
    const verificationQuery = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        website: user.website,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    console.log("[Profile API] Verification query result:", verificationQuery[0]);

    if (!verificationQuery[0] || verificationQuery[0].username !== username) {
      console.error("[Profile API] WARNING: Database update verification failed!");
      console.error("[Profile API] Expected username:", username);
      console.error("[Profile API] Actual username in DB:", verificationQuery[0]?.username);
      
      return NextResponse.json(
        { error: "Profile update failed to save to database" },
        { status: 500 }
      );
    }

    // Send Discord notification for new user registration (first-time onboarding completion)
    if (isFirstTimeOnboarding && updatedUser[0].username) {
      console.log("[Profile API] Sending Discord registration notification");
      try {
        // Increment total registration count
        const totalRegistrations = await incrementRegistrationCount();
        
        // Track daily registrations
        await incrementDailyRegistrations();
        
        // Track analytics event
        await trackEvent('user_registration_completed', {
          userId: updatedUser[0].id,
          username: updatedUser[0].username,
          registrationNumber: totalRegistrations,
        });

        // Send Discord notification with total count
        await sendRegistrationNotification({
          id: updatedUser[0].id,
          name: updatedUser[0].name,
          email: existingUserRecord[0].email,
          username: updatedUser[0].username,
          image: session.user.image,
        }, totalRegistrations);
        
        console.log(`[Profile API] Registration #${totalRegistrations} notification sent successfully`);
      } catch (error) {
        console.error("[Profile API] Failed to send Discord notification:", error);
        // Don't fail the request if Discord notification fails
      }
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser[0]
    });
  } catch (error) {
    console.error("[Profile API] Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/profile - Delete current user's account
export async function DELETE(request: NextRequest) {
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

    // Delete user account (cascade will handle related data)
    await db
      .delete(user)
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
} 