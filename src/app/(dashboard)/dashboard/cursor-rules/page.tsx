import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { cursorRule } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Eye, ThumbsUp, Copy, Plus, Edit, Terminal } from "lucide-react";
import Link from "next/link";

async function getUserCursorRules(userId: string) {
  const userCursorRules = await db
    .select({
      id: cursorRule.id,
      title: cursorRule.title,
      slug: cursorRule.slug,
      description: cursorRule.description,
      ruleType: cursorRule.ruleType,
      globs: cursorRule.globs,
      upvotes: cursorRule.upvotes,
      views: cursorRule.views,
      copyCount: cursorRule.copyCount,
      published: cursorRule.published,
      createdAt: cursorRule.createdAt,
    })
    .from(cursorRule)
    .where(eq(cursorRule.authorId, userId))
    .orderBy(desc(cursorRule.createdAt));

  return userCursorRules;
}

// Helper function for rule type colors
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

export default async function DashboardCursorRulesPage() {
  const user = await getUser();
  
  if (!user) {
    notFound();
  }

  if (!user.username) {
    redirect("/onboarding");
  }

  const userCursorRules = await getUserCursorRules(user.id);
  
  // Calculate stats
  const publishedRules = userCursorRules.filter(r => r.published);
  const draftRules = userCursorRules.filter(r => !r.published);
  const totalUpvotes = userCursorRules.reduce((sum, rule) => sum + (rule.upvotes || 0), 0);
  const totalViews = userCursorRules.reduce((sum, rule) => sum + (rule.views || 0), 0);
  const totalCopies = userCursorRules.reduce((sum, rule) => sum + (rule.copyCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Cursor Rules</h1>
            <p className="text-gray-600">
              Manage your Cursor configuration rules and track their performance
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/create-cursor-rule" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Rule
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{userCursorRules.length}</div>
              <div className="text-sm text-gray-600">Total Rules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{publishedRules.length}</div>
              <div className="text-sm text-gray-600">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{draftRules.length}</div>
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

        {/* Cursor Rules List */}
        {userCursorRules.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
                <Terminal className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                No cursor rules yet
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Get started by creating your first Cursor configuration rule.
              </p>
              <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
                <Link href="/dashboard/create-cursor-rule">
                  Create your first rule
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userCursorRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          <Link 
                            href={`/cursor-rules/${rule.slug}`}
                            className="hover:text-gray-700 transition-colors"
                          >
                            {rule.title}
                          </Link>
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={getRuleTypeColor(rule.ruleType)}
                        >
                          {rule.ruleType.replace('-', ' ')}
                        </Badge>
                        {rule.globs && (
                          <Badge variant="outline" className="text-xs">
                            Files: {rule.globs}
                          </Badge>
                        )}
                        {!rule.published && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                            Draft
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {rule.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(rule.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{rule.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{rule.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Copy className="h-4 w-4" />
                          <span>{rule.copyCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/edit-cursor-rule/${rule.slug}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/cursor-rules/${rule.slug}`}>
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