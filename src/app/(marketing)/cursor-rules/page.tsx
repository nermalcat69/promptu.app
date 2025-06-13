import { Suspense } from "react";
import { db } from "@/lib/db";
import { cursorRule, category, user } from "@/lib/db/schema";
import { eq, desc, sql, ilike, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy } from "lucide-react";
import Link from "next/link";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { UpvoteButton } from "@/components/upvote-button";
import { CursorRuleFilters } from "@/components/cursor-rule-filters";
import { CursorRulesClientList } from "@/components/cursor-rules-client-list";
import { CursorRuleData } from "@/lib/types";
import type { Metadata } from "next";

function getRuleTypeColor(type: string) {
  switch (type) {
    case "always":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "auto-attached":
      return "bg-green-100 text-green-800 border-green-200";
    case "agent-requested":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "manual":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

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

export const metadata: Metadata = {
  title: "Cursor Rules - Promptu",
  description: "Discover configuration files and settings for AI-assisted coding environments like Cursor.",
  keywords: ["cursor rules", "AI coding", "cursor configuration", "coding prompts", "development tools"],
};

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

  const handleCopyRule = async (rule: CursorRuleData) => {
    try {
      await navigator.clipboard.writeText(rule.content);
      // Increment copy count
      await fetch(`/api/cursor-rules/${rule.slug}/copy`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
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
                <div
                  key={rule.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link href={`/cursor-rules/${rule.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors mb-1">
                          {rule.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {rule.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge 
                        variant="outline" 
                        className={`${getRuleTypeColor(rule.ruleType)} text-xs whitespace-nowrap`}
                      >
                        {rule.ruleType}
                      </Badge>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={rule.author?.image || undefined} alt={rule.author?.name || 'Anonymous'} />
                          <AvatarFallback className="text-xs bg-gray-100">
                            {rule.author?.name.split(' ').map(n => n[0]).join('') || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{rule.author?.name || 'Anonymous'}</span>
                      </div>
                      <span className="font-mono">
                        {formatTokenCount(rule.tokens || 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <UpvoteButton 
                        promptSlug={rule.slug}
                        initialUpvotes={rule.upvotes || 0}
                      />
                      <div className="flex items-center gap-1">
                        <Copy className="h-3 w-3" />
                        <span>{rule.copyCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Globs info if present */}
                  {rule.globs && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">File patterns:</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {rule.globs}
                      </code>
                    </div>
                  )}

                  {/* Content Preview */}
                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4 overflow-hidden">
                      {rule.content}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/cursor-rules/${rule.slug}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                    <button
                      onClick={() => handleCopyRule(rule)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Rule
                    </button>
                  </div>
                </div>
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