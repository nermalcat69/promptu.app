import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { prompt, user } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://promptu.app'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  try {
    // Get all published prompts
    const prompts = await db
      .select({
        slug: prompt.slug,
        updatedAt: prompt.updatedAt,
      })
      .from(prompt)
      .where(eq(prompt.published, true))

    const promptPages = prompts.map((promptItem) => ({
      url: `${baseUrl}/prompts/${promptItem.slug}`,
      lastModified: new Date(promptItem.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Get all users with usernames (public profiles)
    const users = await db
      .select({
        username: user.username,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(and(
        eq(user.username, user.username), // Filter out null usernames
      ))

    const userPages = users
      .filter(userItem => userItem.username) // Additional filter for TypeScript
      .map((userItem) => ({
        url: `${baseUrl}/profile/${userItem.username}`,
        lastModified: new Date(userItem.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))

    return [...staticPages, ...promptPages, ...userPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages if dynamic generation fails
    return staticPages
  }
} 