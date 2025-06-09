import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ExternalLink, 
  Globe, 
  User as UserIcon, 
  Eye, 
  ThumbsUp, 
  Copy 
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { prompt, user } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { calculatePromptTokens, formatTokenCount } from "@/lib/token-calculator";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

async function getUserByUsername(username: string) {
  const userData = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      username: user.username,
      createdAt: user.createdAt,
      website: user.website,
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  return userData[0] || null;
}

async function getUserPrompts(userId: string) {
  const userPrompts = await db
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
      createdAt: prompt.createdAt,
    })
    .from(prompt)
    .where(and(eq(prompt.authorId, userId), eq(prompt.published, true)))
    .orderBy(desc(prompt.createdAt));

  return userPrompts;
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

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const userData = await getUserByUsername(username);
  
  if (!userData) {
    return {
      title: 'User Not Found',
    };
  }

  return {
    title: `${userData.name} (@${userData.username}) - Promptu`,
    description: userData.bio || `View ${userData.name}'s AI prompts and profile on Promptu.`,
    openGraph: {
      title: `${userData.name} (@${userData.username})`,
      description: userData.bio || `View ${userData.name}'s AI prompts and profile on Promptu.`,
      images: userData.image ? [userData.image] : [],
    },
    alternates: {
      canonical: `https://promptu.space/profile/${userData.username}`,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  
  const userData = await getUserByUsername(username);
  
  if (!userData) {
    notFound();
  }

  const userPrompts = await getUserPrompts(userData.id);
  
  const totalUpvotes = userPrompts.reduce((sum, prompt) => sum + (prompt.upvotes || 0), 0);
  const totalViews = userPrompts.reduce((sum, prompt) => sum + (prompt.views || 0), 0);
  const totalCopies = userPrompts.reduce((sum, prompt) => sum + (prompt.copyCount || 0), 0);

  // Add token calculations for each prompt
  const promptsWithTokens = userPrompts.map(prompt => ({
    ...prompt,
    tokens: calculatePromptTokens(prompt.title, prompt.excerpt, prompt.content).tokens
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Profile Card */}
              <div className="bg-card text-card-foreground rounded-xl border p-4">
                <div className="text-center space-y-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={userData.image || ""} alt={userData.name} />
                    <AvatarFallback className="bg-gray-100 text-2xl">
                      {userData.image ? (
                        userData.name.split(' ').map(n => n[0]).join('')
                      ) : (
                        <UserIcon className="h-12 w-12 text-gray-600" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{userData.name}</h1>
                    <p className="text-sm text-gray-600">@{userData.username}</p>
                  </div>
                  
                  {userData.bio && (
                    <p className="text-sm text-gray-700 leading-relaxed">{userData.bio}</p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    
                    {userData.website && (
                      <div className="flex items-center justify-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {userData.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-card text-card-foreground rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prompts</span>
                    <span className="font-semibold text-gray-900">{userPrompts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Upvotes</span>
                    <span className="font-semibold text-gray-900">{totalUpvotes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Views</span>
                    <span className="font-semibold text-gray-900">{totalViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Copies</span>
                    <span className="font-semibold text-gray-900">{totalCopies}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {userData.name}'s Prompts
                </h2>
                <p className="text-gray-600">
                  {userPrompts.length} prompt{userPrompts.length !== 1 ? 's' : ''} published
                </p>
              </div>

              {/* Prompts Grid */}
              {userPrompts.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No prompts yet
                  </h3>
                  <p className="text-gray-600">
                    {userData.name} hasn't published any prompts yet.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Desktop Table Header - Hidden on mobile/tablet */}
                  <div className="hidden lg:block border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-1">Tokens</div>
                      <div className="col-span-2">Stats</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-1">Action</div>
                    </div>
                  </div>

                  {/* Medium Screen Table Header - Hidden on mobile and desktop */}
                  <div className="hidden md:block lg:hidden border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-10 gap-4 px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-2">Stats</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-1">Action</div>
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
                          
                          {/* Stats Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{prompt.upvotes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{prompt.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Copy className="h-3 w-3" />
                                <span>{prompt.copyCount}</span>
                              </div>
                            </div>
                            
                            <span className="text-xs text-gray-500 font-mono">
                              {formatTokenCount(prompt.tokens)}
                            </span>
                          </div>
                          
                          {/* Date and Action Row */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(prompt.createdAt).toLocaleDateString()}
                            </span>
                            <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                              <Link href={`/prompts/${prompt.slug}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {/* Medium Screen Layout (md to lg) */}
                        <div className="hidden md:grid lg:hidden grid-cols-10 gap-2 px-4 py-3">
                          {/* Name Column */}
                          <div className="col-span-5">
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
                          
                          {/* Stats Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{prompt.upvotes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Copy className="h-3 w-3" />
                                <span>{prompt.copyCount}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Date Column */}
                          <div className="col-span-2">
                            <span className="text-sm text-gray-500">
                              {new Date(prompt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Action Column */}
                          <div className="col-span-1">
                            <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                              <Link href={`/prompts/${prompt.slug}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {/* Desktop Layout (lg+) */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3">
                          {/* Name Column */}
                          <div className="col-span-6">
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
                          
                          {/* Tokens Column */}
                          <div className="col-span-1">
                            <span className="text-sm text-gray-500 font-mono">
                              {formatTokenCount(prompt.tokens)}
                            </span>
                          </div>
                          
                          {/* Stats Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{prompt.upvotes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{prompt.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Copy className="h-3 w-3" />
                                <span>{prompt.copyCount}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Date Column */}
                          <div className="col-span-2">
                            <span className="text-sm text-gray-500">
                              {new Date(prompt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Action Column */}
                          <div className="col-span-1">
                            <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                              <Link href={`/prompts/${prompt.slug}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 