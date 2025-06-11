import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/onboarding/', '/_next/'],
    },
    sitemap: 'https://promptu.dev/sitemap.xml',
  }
} 