import { Suspense } from "react";
import { db } from "@/lib/db";
import { prompt, category, user } from "@/lib/db/schema";
import { eq, desc, sql, ilike, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy } from "lucide-react";
import Link from "next/link";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";
import { UpvoteButton } from "@/components/upvote-button";
import { PromptFilters } from "@/components/prompt-filters";
import { PromptsClientList } from "@/components/prompts-client-list";
import type { Metadata } from "next";

interface PromptData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  promptType: string;
  category: string;
  author: {
    id: string;
    name: string;
    image?: string;
    username?: string;
  };
  upvotes: number;
  views: number;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
}

function getPromptTypeColor(type: string) {
  switch (type) {
    case "system":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "user":
      return "bg-green-100 text-green-800 border-green-200";
    case "developer":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

async function getPrompts(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = parseInt((searchParams.page as string) || "1");
  const limit = parseInt((searchParams.limit as string) || "12");
  const type = searchParams.type as string;
  const categorySlug = searchParams.category as string;
  const search = searchParams.search as string;
  const sort = (searchParams.sort as string) || "recent";

  const offset = (page - 1) * limit;

  // Build query conditions
  const conditions = [];
  
  if (type && type !== "all") {
    conditions.push(eq(prompt.promptType, type));
  }
  
  if (categorySlug && categorySlug !== "all") {
    const categoryResult = await db.select().from(category).where(eq(category.slug, categorySlug)).limit(1);
    if (categoryResult[0]) {
      conditions.push(eq(prompt.categoryId, categoryResult[0].id));
    }
  }
  
  if (search) {
    conditions.push(
      ilike(prompt.title, `%${search}%`)
    );
  }

  // Add published filter
  conditions.push(eq(prompt.published, true));

  // Build sort order
  let orderBy;
  switch (sort) {
    case "popular":
      orderBy = desc(prompt.views);
      break;
    case "upvotes":
      orderBy = desc(prompt.upvotes);
      break;
    default:
      orderBy = desc(prompt.createdAt);
  }

  // Execute query
  const prompts = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      slug: prompt.slug,
      excerpt: prompt.excerpt,
      content: prompt.content,
      promptType: prompt.promptType,
      upvotes: prompt.upvotes,
      views: prompt.views,
      copyCount: prompt.copyCount,
      featured: prompt.featured,
      createdAt: prompt.createdAt,
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
    .from(prompt)
    .leftJoin(user, eq(prompt.authorId, user.id))
    .leftJoin(category, eq(prompt.categoryId, category.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql`count(*)` })
    .from(prompt)
    .leftJoin(category, eq(prompt.categoryId, category.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(totalResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  return {
    prompts,
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
  title: "All AI Prompts - Promptu",
  description: "Browse through our complete collection of AI prompts. Use filters to find exactly what you need.",
  keywords: ["AI prompts", "system prompts", "user prompts", "developer prompts", "browse prompts"],
};

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get initial data server-side
  const initialData = await getPrompts(searchParams);
  
  // Process prompts with tokens
  const promptsWithTokens = initialData.prompts.map(prompt => ({
    ...prompt,
    tokens: calculatePromptTokens(prompt.title, prompt.excerpt, prompt.content).tokens,
    category: prompt.category?.name || "Uncategorized",
  }));

  const initialFilters = {
    search: (searchParams.search as string) || '',
    type: (searchParams.type as string) || 'all',
    sort: (searchParams.sort as string) || 'recent',
    category: (searchParams.category as string) || 'all',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              All AI Prompts
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our complete collection of AI prompts. Use filters to find exactly what you need.
            </p>
          </div>
          
          {/* Filters */}
          <Suspense fallback={
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          }>
            <PromptFilters 
              initialFilters={initialFilters}
            />
          </Suspense>

          {/* Initial Prompts Display */}
          {promptsWithTokens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No prompts found matching your criteria.
              </p>
              <p className="text-sm text-gray-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Desktop Table Header - Hidden on mobile/tablet */}
              <div className="hidden lg:block border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-1">Tokens</div>
                  <div className="col-span-2">Votes</div>
                  <div className="col-span-2">Copies</div>
                </div>
              </div>

              {/* Medium Screen Table Header - Hidden on mobile and desktop */}
              <div className="hidden md:block lg:hidden border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-10 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-2">Votes</div>
                  <div className="col-span-2">Copies</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {promptsWithTokens.map((prompt) => (
                  <div key={prompt.id} className="hover:bg-gray-50 transition-colors group">
                    
                    {/* Mobile Layout (< md) */}
                    <div className="block md:hidden p-4 space-y-3">
                      {/* Title */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm leading-tight flex-1">
                          <Link href={`/prompts/${prompt.slug}`}>
                            {prompt.title}
                          </Link>
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${getPromptTypeColor(prompt.promptType)} text-xs whitespace-nowrap ml-2`}
                        >
                          {prompt.promptType}
                        </Badge>
                      </div>
                      
                      {/* Author and Stats Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prompt.author.image || undefined} alt={prompt.author.name} />
                            <AvatarFallback className="text-xs bg-gray-100">
                              {prompt.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{prompt.author.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 font-mono">
                            {formatTokenCount(prompt.tokens)}
                          </span>
                          <UpvoteButton 
                            promptSlug={prompt.slug}
                            initialUpvotes={prompt.upvotes || 0}
                          />
                        </div>
                      </div>
                      
                      {/* Copy Count Row */}
                      <div className="flex items-center justify-end text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Copy className="h-3 w-3" />
                          <span>{prompt.copyCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Medium Screen Layout (md to lg) */}
                    <div className="hidden md:grid lg:hidden grid-cols-10 gap-2 px-4 py-3">
                      {/* Name Column */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                              <Link href={`/prompts/${prompt.slug}`}>
                                {prompt.title}
                              </Link>
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`${getPromptTypeColor(prompt.promptType)} text-xs mt-1`}
                            >
                              {prompt.promptType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Author Column */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prompt.author.image || undefined} alt={prompt.author.name} />
                            <AvatarFallback className="text-xs bg-gray-100">
                              {prompt.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600 truncate">{prompt.author.name}</span>
                        </div>
                      </div>
                      
                      {/* Votes Column */}
                      <div className="col-span-2">
                        <UpvoteButton 
                          promptSlug={prompt.slug}
                          initialUpvotes={prompt.upvotes || 0}
                        />
                      </div>
                      
                      {/* Copies Column */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Copy className="h-3 w-3" />
                          <span>{prompt.copyCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout (lg+) */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3">
                      {/* Name Column */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors text-sm truncate">
                              <Link href={`/prompts/${prompt.slug}`}>
                                {prompt.title}
                              </Link>
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-1">{prompt.excerpt}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${getPromptTypeColor(prompt.promptType)} text-xs whitespace-nowrap`}
                          >
                            {prompt.promptType}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Author Column */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={prompt.author.image || undefined} alt={prompt.author.name} />
                            <AvatarFallback className="text-xs bg-gray-100">
                              {prompt.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm text-gray-600 truncate block">{prompt.author.name}</span>
                            {prompt.author.username && (
                              <Link href={`/profile/${prompt.author.username}`} className="text-xs text-blue-600 hover:text-blue-800">
                                @{prompt.author.username}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tokens Column */}
                      <div className="col-span-1">
                        <span className="text-sm text-gray-500 font-mono">
                          {formatTokenCount(prompt.tokens)}
                        </span>
                      </div>
                      
                      {/* Votes Column */}
                      <div className="col-span-2">
                        <UpvoteButton 
                          promptSlug={prompt.slug}
                          initialUpvotes={prompt.upvotes || 0}
                        />
                      </div>
                      
                      {/* Copies Column */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Copy className="h-3 w-3" />
                          <span>{prompt.copyCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client-side Infinite Scroll Component */}
          <Suspense fallback={null}>
            <PromptsClientList 
              initialData={promptsWithTokens}
              initialPagination={initialData.pagination}
              initialFilters={initialFilters}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}