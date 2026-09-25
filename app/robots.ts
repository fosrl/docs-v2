import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';

/**
 * Mintlify's generated robots.txt: AI crawlers may train, search, and answer
 * from the docs, while Next.js build assets stay out of the index.
 * https://www.mintlify.com/docs/optimize/seo
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/_next/image',
      disallow: ['/cdn-cgi/', '/_next/'],
      other: {
        'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
      },
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
