import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { prompt } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Eye, ThumbsUp, Copy, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

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
      published: prompt.published,
      createdAt: prompt.createdAt,
    })
    .from(prompt)
    .where(eq(prompt.authorId, userId))
    .orderBy(desc(prompt.createdAt));

  return userPrompts;
}

// Helper function for prompt type colors
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

export default async function DashboardPromptsPage() {
  const user = await getUser();
  
  if (!user) {
    notFound();
  }

  if (!user.username) {
    redirect("/onboarding");
  }

  const userPrompts = await getUserPrompts(user.id);
  
  // Calculate stats
  const publishedPrompts = userPrompts.filter(p => p.published);
  const draftPrompts = userPrompts.filter(p => !p.published);
  const totalUpvotes = userPrompts.reduce((sum, prompt) => sum + (prompt.upvotes || 0), 0);
  const totalViews = userPrompts.reduce((sum, prompt) => sum + (prompt.views || 0), 0);
  const totalCopies = userPrompts.reduce((sum, prompt) => sum + (prompt.copyCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Prompts</h1>
            <p className="text-gray-600">
              Manage your AI prompts and track their performance
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Prompt
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{userPrompts.length}</div>
              <div className="text-sm text-gray-600">Total Prompts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{publishedPrompts.length}</div>
              <div className="text-sm text-gray-600">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{draftPrompts.length}</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{totalUpvotes}</div>
              <div className="text-sm text-gray-600">Total Upvotes</div>
            </CardContent>
          </Card>
        </div>

        {/* Prompts List */}
        {userPrompts.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                No prompts yet
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Get started by creating your first AI prompt.
              </p>
              <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
                <Link href="/dashboard/create">
                  Create your first prompt
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          <Link 
                            href={`/prompts/${prompt.slug}`}
                            className="hover:text-gray-700 transition-colors"
                          >
                            {prompt.title}
                          </Link>
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={getPromptTypeColor(prompt.promptType)}
                        >
                          {prompt.promptType}
                        </Badge>
                        {!prompt.published && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                            Draft
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {prompt.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{prompt.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{prompt.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Copy className="h-4 w-4" />
                          <span>{prompt.copyCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/edit/${prompt.slug}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/prompts/${prompt.slug}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 