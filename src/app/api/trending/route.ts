import { NextRequest, NextResponse } from "next/server";
import { getTrendingService } from "@/services/ServiceFactory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const timeframe = (searchParams.get('timeframe') as 'daily' | 'weekly' | 'monthly' | 'all-time') || 'weekly';
    const type = searchParams.get('type') as 'system' | 'user' | 'developer' | null;
    const category = searchParams.get('category');

    const trendingService = getTrendingService();

    let trendingPrompts;
    if (type) {
      trendingPrompts = await trendingService.getTrendingByType(type, limit);
    } else if (category) {
      trendingPrompts = await trendingService.getTrendingByCategory(category, limit);
    } else {
      trendingPrompts = await trendingService.getTrendingPrompts(limit, timeframe);
    }

    return NextResponse.json({
      success: true,
      data: trendingPrompts,
      meta: {
        limit,
        timeframe,
        type,
        category
      }
    });
  } catch (error) {
    console.error('Error fetching trending prompts:', error);
    return NextResponse.json(
      { error: "Failed to fetch trending prompts" },
      { status: 500 }
    );
  }
} 