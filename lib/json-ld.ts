import navigation from '@/lib/navigation.json';
import { pageLastModified } from '@/lib/last-modified';
import type { Page } from '@/lib/source';
import { appName, siteUrl } from '@/lib/shared';

type NavItem = string | { group: string; pages: NavItem[] };
type Crumb = { name: string; url: string };
type IdRef = { '@id': string };

/**
 * Mintlify's per-page graph: Organization, WebSite, WebPage, BreadcrumbList,
 * and TechArticle. `dateModified` is the same git date the sitemap uses.
 */
export function pageJsonLd(page: Page): string {
  const url = absoluteUrl(page.url);
  const dateModified = pageLastModified(page).toISOString();
  const description = page.data.description || undefined;
  const orgId = `${siteUrl}/#organization`;
  const siteId = `${siteUrl}/#website`;
  const pageId = `${url}#webpage`;
  const crumbs = breadcrumb(page.slugs.length === 0 ? 'index' : page.slugs.join('/'), url, page.data.title);

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: appName,
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo/light.png` },
    },
    {
      '@type': 'WebSite',
      '@id': siteId,
      name: appName,
      url: siteUrl,
      publisher: { '@id': orgId } satisfies IdRef,
    },
    {
      '@type': 'WebPage',
      '@id': pageId,
      url,
      name: page.data.title,
      description,
      dateModified,
      isPartOf: { '@id': siteId } satisfies IdRef,
      breadcrumb: crumbs ? { '@id': `${url}#breadcrumb` } : undefined,
    },
  ];

  if (crumbs) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  graph.push({
    '@type': ['Article', 'TechArticle'],
    '@id': `${url}#article`,
    headline: page.data.title,
    name: page.data.title,
    description,
    url,
    mainEntityOfPage: { '@id': pageId } satisfies IdRef,
    dateModified,
    publisher: { '@id': orgId } satisfies IdRef,
    isPartOf: { '@id': siteId } satisfies IdRef,
  });

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

function absoluteUrl(url: string) {
  return `${siteUrl}${url}`;
}

/**
 * Two crumbs, same as Mintlify: the nearest nav group whose first page is not
 * this one, then the page. The home page has no trail.
 */
function breadcrumb(navPath: string, url: string, title: string): Crumb[] | undefined {
  const ancestors = findAncestors(navigation.groups as NavItem[], navPath) ?? [];

  for (let i = ancestors.length - 1; i >= 0; i--) {
    const group = ancestors[i];
    if (!group) continue;
    const leaf = firstLeaf(group.pages);
    const parentUrl = leaf ? urlForNavPath(leaf) : undefined;
    if (parentUrl && parentUrl !== url) {
      return [
        { name: group.group, url: parentUrl },
        { name: title, url },
      ];
    }
  }

  if (url === absoluteUrl('/')) return undefined;
  return [
    { name: appName, url: absoluteUrl('/') },
    { name: title, url },
  ];
}

function urlForNavPath(navPath: string) {
  const slugs = navPath === 'index' ? [] : navPath.split('/');
  return absoluteUrl(slugs.length === 0 ? '/' : `/${slugs.join('/')}`);
}

function firstLeaf(items: NavItem[]): string | undefined {
  for (const item of items) {
    if (typeof item === 'string') return item;
    const found = firstLeaf(item.pages);
    if (found) return found;
  }
}

function findAncestors(
  items: NavItem[],
  target: string,
  trail: Extract<NavItem, { group: string }>[] = [],
): Extract<NavItem, { group: string }>[] | undefined {
  for (const item of items) {
    if (typeof item === 'string') {
      if (item === target) return trail;
      continue;
    }
    const found = findAncestors(item.pages, target, [...trail, item]);
    if (found) return found;
  }
}
