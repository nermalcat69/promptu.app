import { getUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { prompt, category } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { EditPromptForm } from "@/components/edit-prompt-form";

async function getPromptForEdit(slug: string, userId: string) {
  const result = await db
    .select({
      id: prompt.id,
      title: prompt.title,
      slug: prompt.slug,
      excerpt: prompt.excerpt,
      content: prompt.content,
      promptType: prompt.promptType,
      categoryId: prompt.categoryId,
      published: prompt.published,
      authorId: prompt.authorId,
    })
    .from(prompt)
    .where(eq(prompt.slug, slug))
    .limit(1);

  if (!result[0] || result[0].authorId !== userId) {
    return null;
  }

  return result[0];
}

async function getCategories() {
  return await db
    .select({
      id: category.id,
      name: category.name,
    })
    .from(category)
    .orderBy(category.name);
}

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getUser();
  if (!user) {
    notFound();
  }

  const { slug } = await params;
  
  const [promptData, categories] = await Promise.all([
    getPromptForEdit(slug, user.id),
    getCategories(),
  ]);

  if (!promptData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Edit Prompt
          </h1>
          <p className="text-gray-600">
            Update your prompt details and settings.
          </p>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Prompt Details</CardTitle>
          </CardHeader>
          <CardContent>
            <EditPromptForm 
              promptData={promptData}
              categories={categories}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 