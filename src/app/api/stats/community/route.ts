import { NextRequest, NextResponse } from "next/server";
import { getCommunityStatsService } from "@/services/ServiceFactory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    const communityStatsService = getCommunityStatsService();

    if (detailed) {
      // Get detailed stats including engagement metrics
      const [communityStats, engagementStats] = await Promise.all([
        communityStatsService.getCommunityStats(),
        communityStatsService.getEngagementStats()
      ]);

      return NextResponse.json({
        success: true,
        data: {
          ...communityStats,
          engagement: engagementStats
        }
      });
    } else {
      // Get basic community stats
      const stats = await communityStatsService.getCommunityStats();
      
      return NextResponse.json({
        success: true,
        data: stats
      });
    }
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json(
      { error: "Failed to fetch community stats" },
      { status: 500 }
    );
  }
} 