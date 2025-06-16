import { Suspense } from "react";
import { db } from "@/lib/db";
import { cursorRule, category, user } from "@/lib/db/schema";
import { eq, desc, sql, ilike, and } from "drizzle-orm";
import { calculatePromptTokens } from "@/lib/token-calculator";
import { CursorRuleFilters } from "@/components/cursor-rule-filters";
import { CursorRulesClientList } from "@/components/cursor-rules-client-list";
import { CursorRuleCard } from "@/components/cursor-rule-card";
import { CursorRuleData } from "@/lib/types";
import type { Metadata } from "next";



async function getCursorRules(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = parseInt((searchParams.page as string) || "1");
  const limit = parseInt((searchParams.limit as string) || "10");
  const type = searchParams.type as string;
  const categorySlug = searchParams.category as string;
  const search = searchParams.search as string;
  const sort = (searchParams.sort as string) || "recent";

  const offset = (page - 1) * limit;

  // Build query conditions
  const conditions = [];
  
  if (type && type !== "all") {
    conditions.push(eq(cursorRule.ruleType, type));
  }
  
  if (categorySlug && categorySlug !== "all") {
    const categoryResult = await db.select().from(category).where(eq(category.slug, categorySlug)).limit(1);
    if (categoryResult[0]) {
      conditions.push(eq(cursorRule.categoryId, categoryResult[0].id));
    }
  }
  
  if (search) {
    conditions.push(
      ilike(cursorRule.title, `%${search}%`)
    );
  }

  // Add published filter
  conditions.push(eq(cursorRule.published, true));

  // Build sort order
  let orderBy;
  switch (sort) {
    case "popular":
      orderBy = desc(cursorRule.views);
      break;
    case "upvotes":
      orderBy = desc(cursorRule.upvotes);
      break;
    default:
      orderBy = desc(cursorRule.createdAt);
  }

  // Execute query
  const cursorRules = await db
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
      createdAt: cursorRule.createdAt,
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql`count(*)` })
    .from(cursorRule)
    .leftJoin(category, eq(cursorRule.categoryId, category.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(totalResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  return {
    cursorRules,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search as string;
  const type = resolvedSearchParams.type as string;
  const category = resolvedSearchParams.category as string;
  const sort = resolvedSearchParams.sort as string;

  let title = "Cursor Rules - Promptu";
  let description = "Discover configuration files and settings for AI-assisted coding environments like Cursor.";

  // Dynamic title and description based on filters
  if (search) {
    title = `"${search}" Cursor Rules - Promptu`;
    description = `Find Cursor rules matching "${search}". Browse our collection of AI coding configurations.`;
  } else if (type && type !== "all") {
    const typeNames = {
      always: "Always Active",
      "auto-attached": "Auto-Attached",
      "agent-requested": "Agent Requested",
      manual: "Manual"
    };
    const typeName = typeNames[type as keyof typeof typeNames] || type;
    title = `${typeName} Cursor Rules - Promptu`;
    description = `Browse ${typeName.toLowerCase()} cursor rules for AI-assisted coding. Optimize your development workflow.`;
  } else if (category && category !== "all") {
    title = `${category} Cursor Rules - Promptu`;
    description = `Browse cursor rules in the ${category} category. Find specialized configurations for your coding needs.`;
  }

  // Add sort context
  if (sort === "popular") {
    title = title.replace(" - Promptu", " (Most Popular) - Promptu");
  } else if (sort === "upvotes") {
    title = title.replace(" - Promptu", " (Top Rated) - Promptu");
  }

  return {
    title,
    description,
    keywords: [
      "cursor rules",
      "AI coding",
      "cursor configuration",
      "coding prompts",
      "development tools",
      search,
      type,
      category
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://promptu.dev/cursor-rules${
        Object.keys(resolvedSearchParams).length > 0 
          ? `?${new URLSearchParams(resolvedSearchParams as Record<string, string>).toString()}`
          : ""
      }`,
    },
  };
}

export default async function CursorRulesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams in Next.js 15
  const resolvedSearchParams = await searchParams;
  
  // Get initial data server-side
  const initialData = await getCursorRules(resolvedSearchParams);
  
  // Process rules with tokens
  const rulesWithTokens: CursorRuleData[] = initialData.cursorRules.map(rule => ({
    ...rule,
    tokens: calculatePromptTokens(rule.title, rule.description, rule.content).tokens,
    category: rule.category?.name || "Uncategorized",
    updatedAt: rule.createdAt, // Add missing updatedAt field
    author: rule.author ? {
      id: rule.author.id,
      name: rule.author.name,
      image: rule.author.image,
      username: rule.author.username,
    } : null,
  }));

  const initialFilters = {
    search: (resolvedSearchParams.search as string) || '',
    type: (resolvedSearchParams.type as string) || 'all',
    sort: (resolvedSearchParams.sort as string) || 'recent',
    category: (resolvedSearchParams.category as string) || 'all',
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cursor Rules
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover configuration files and settings for AI-assisted coding environments like Cursor.
            </p>
          </div>
          
          {/* Filters */}
          <Suspense fallback={
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="relative">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mt-4">
                  <div className="h-10 bg-gray-200 rounded w-full lg:w-auto"></div>
                  <div className="flex gap-3 w-full lg:w-auto">
                    <div className="h-10 bg-gray-200 rounded w-full lg:w-[180px]"></div>
                    <div className="h-10 bg-gray-200 rounded w-full lg:w-[180px]"></div>
                  </div>
                </div>
              </div>
            </div>
          }>
            <CursorRuleFilters 
              initialFilters={initialFilters}
            />
          </Suspense>

          {/* Initial Rules Display */}
          {rulesWithTokens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No cursor rules found matching your criteria.
              </p>
              <p className="text-sm text-gray-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {rulesWithTokens.map((rule) => (
                <CursorRuleCard key={rule.id} rule={rule} />
              ))}
            </div>
          )}

          {/* Client-side Infinite Scroll Component */}
          <Suspense fallback={null}>
            <CursorRulesClientList 
              initialData={rulesWithTokens}
              initialPagination={initialData.pagination}
              initialFilters={initialFilters}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 