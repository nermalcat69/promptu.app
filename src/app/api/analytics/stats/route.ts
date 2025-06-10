import { NextResponse } from "next/server";
import { getTotalRegistrations, getDailyRegistrations } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Only allow authenticated users (could add admin check here)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get stats
    const totalRegistrations = await getTotalRegistrations();
    const todayRegistrations = await getDailyRegistrations();
    const yesterdayRegistrations = await getDailyRegistrations(
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    const stats = {
      totalRegistrations,
      todayRegistrations,
      yesterdayRegistrations,
      growthRate: yesterdayRegistrations > 0 
        ? ((todayRegistrations - yesterdayRegistrations) / yesterdayRegistrations * 100).toFixed(1)
        : todayRegistrations > 0 ? "100.0" : "0.0",
      timestamp: new Date().toISOString(),
    };

    console.log("[Analytics Stats]", stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Analytics stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics stats" },
      { status: 500 }
    );
  }
} 