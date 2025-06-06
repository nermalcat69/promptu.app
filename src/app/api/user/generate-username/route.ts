import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateAvailableUsername, suggestUsernames } from "@/lib/username-generator";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
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
    const { mode = "single" } = body; // "single" or "suggestions"

    // Get OAuth provider data from accounts table
    let oauthData = {};
    try {
      const accounts = await db
        .select()
        .from(account)
        .where(eq(account.userId, session.user.id));
      
      // Extract data from OAuth accounts
      for (const acc of accounts) {
        if (acc.providerId === "github" && acc.accessToken) {
          // For GitHub, we might have additional data
          // The username is often stored in the account data
          oauthData = {
            ...oauthData,
            login: acc.accountId, // GitHub username
            provider: "github"
          };
        } else if (acc.providerId === "google") {
          oauthData = {
            ...oauthData,
            provider: "google"
          };
        }
      }
    } catch (error) {
      console.error("Error fetching OAuth data:", error);
    }

    // Prepare user info from session and OAuth data
    const userInfo = {
      name: session.user.name,
      email: session.user.email,
      // Add OAuth specific data
      ...oauthData,
      // Extract first/last name from full name for Google users
      ...(session.user.name && {
        given_name: session.user.name.split(' ')[0],
        family_name: session.user.name.split(' ').slice(1).join(' ')
      })
    };

    if (mode === "suggestions") {
      const suggestions = await suggestUsernames(userInfo, 5);
      return NextResponse.json({ suggestions });
    } else {
      const username = await generateAvailableUsername(userInfo);
      return NextResponse.json({ username });
    }
  } catch (error) {
    console.error("Error generating username:", error);
    return NextResponse.json(
      { error: "Failed to generate username" },
      { status: 500 }
    );
  }
} 