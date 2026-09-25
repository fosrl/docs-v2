import type { MetadataRoute } from 'next';
import { pageLastModified } from '@/lib/last-modified';
import { source } from '@/lib/source';
import { siteUrl } from '@/lib/shared';

/**
 * Same shape as a Mintlify docs sitemap (`/docs/sitemap.xml` on Infisical):
 * one `<loc>` and `<lastmod>` per published page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return source
    .getPages()
    .map((page) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: pageLastModified(page),
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}
