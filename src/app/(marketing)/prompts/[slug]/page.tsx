import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { calculatePromptTokens } from '@/lib/token-calculator'
import { PromptPageClient } from '@/components/prompt-page-client'
import { db } from '@/lib/db'
import { prompt, user, category } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function getPrompt(slug: string) {
  try {
    const promptData = await db
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
        published: prompt.published,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
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
      .where(eq(prompt.slug, slug))
      .limit(1);

    if (!promptData[0] || !promptData[0].published) {
      return null;
    }

    // Increment view count
    await db
      .update(prompt)
      .set({ views: (promptData[0].views || 0) + 1 })
      .where(eq(prompt.id, promptData[0].id));

    return promptData[0];
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const promptData = await getPrompt(slug);
  
  if (!promptData) {
    return {
      title: 'Prompt Not Found - Promptu',
      description: 'The requested prompt could not be found.',
    };
  }

  const tokens = calculatePromptTokens(promptData.title, promptData.excerpt, promptData.content).tokens;
  
  return {
    title: `${promptData.title} - Promptu`,
    description: promptData.excerpt,
    keywords: [
      promptData.promptType + ' prompt',
      'AI prompt',
      promptData.category?.name || 'prompt',
      'artificial intelligence',
      'prompt engineering'
    ],
    authors: [{ name: promptData.author?.name || 'Anonymous' }],
    openGraph: {
      title: promptData.title,
      description: promptData.excerpt,
      type: 'article',
      publishedTime: promptData.createdAt.toISOString(),
      modifiedTime: promptData.updatedAt?.toISOString(),
      authors: [promptData.author?.name || 'Anonymous'],
      tags: [promptData.promptType, promptData.category?.name || 'General'].filter(Boolean),
    },
    twitter: {
      card: 'summary_large_image',
      title: promptData.title,
      description: promptData.excerpt,
      creator: promptData.author?.username ? `@${promptData.author.username}` : undefined,
    },
    alternates: {
      canonical: `https://promptu.dev/prompts/${promptData.slug}`,
    },
  };
}

export default async function PromptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const promptData = await getPrompt(slug);

  if (!promptData) {
    notFound();
  }

  const tokens = calculatePromptTokens(promptData.title, promptData.excerpt, promptData.content).tokens;

  return <PromptPageClient prompt={promptData} tokens={tokens} />;
} 