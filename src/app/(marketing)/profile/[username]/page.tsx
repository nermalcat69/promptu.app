import { db } from "@/lib/db";
import { user, prompt } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CalendarDays, FileText, Eye, ThumbsUp, Copy } from "lucide-react";

interface UserProfilePageProps {
  params: {
    username: string;
  };
}

async function getUserProfile(username: string) {
  const userProfile = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      bio: user.bio,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  return userProfile[0] || null;
}

async function getUserPrompts(userId: string) {
  const userPrompts = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      slug: prompt.slug,
      excerpt: prompt.excerpt,
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

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = params;
  
  const userProfile = await getUserProfile(username);
  
  if (!userProfile) {
    notFound();
  }

  const userPrompts = await getUserPrompts(userProfile.id);

  const totalUpvotes = userPrompts.reduce((sum, prompt) => sum + (prompt.upvotes || 0), 0);
  const totalViews = userPrompts.reduce((sum, prompt) => sum + (prompt.views || 0), 0);
  const totalCopies = userPrompts.reduce((sum, prompt) => sum + (prompt.copyCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <Avatar className="h-24 w-24 mx-auto md:mx-0">
                  <AvatarImage src={userProfile.image || ""} alt={userProfile.name} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {userProfile.name}
                  </h1>
                  <p className="text-gray-600 mb-4">@{userProfile.username}</p>
                  
                  {userProfile.bio && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {userProfile.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>Joined {new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{userPrompts.length} prompt{userPrompts.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{totalUpvotes}</span>
                </div>
                <p className="text-sm text-gray-600">Total Upvotes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{totalViews}</span>
                </div>
                <p className="text-sm text-gray-600">Total Views</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Copy className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">{totalCopies}</span>
                </div>
                <p className="text-sm text-gray-600">Total Copies</p>
              </CardContent>
            </Card>
          </div>

          {/* Prompts Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Published Prompts ({userPrompts.length})
            </h2>
            
            {userPrompts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No prompts yet
                  </h3>
                  <p className="text-gray-600">
                    {userProfile.name} hasn't published any prompts yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userPrompts.map((prompt) => (
                  <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                              <Link 
                                href={`/prompts/${prompt.slug}`}
                                className="hover:text-gray-700 transition-colors"
                              >
                                {prompt.title}
                              </Link>
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`${getPromptTypeColor(prompt.promptType)} text-xs whitespace-nowrap`}
                            >
                              {prompt.promptType}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            {prompt.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{prompt.upvotes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{prompt.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Copy className="h-4 w-4" />
                                <span>{prompt.copyCount}</span>
                              </div>
                            </div>
                            <span>
                              {new Date(prompt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 