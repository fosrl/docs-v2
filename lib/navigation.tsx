import type * as PageTree from 'fumadocs-core/page-tree';
import { Icon } from '@/components/icons';
import { source } from './source';
import navigation from './navigation.json';

/**
 * The sidebar is defined in `lib/navigation.json` (same shape as Mintlify's `docs.json`
 * groups), because the groups do not map 1:1 to folders on disk. Pages that exist in
 * `content/docs` but are not listed here are still published, just hidden from the sidebar.
 */
type NavItem = string | NavGroup;
interface NavGroup {
  group: string;
  icon?: string;
  pages: NavItem[];
}

export interface NavLink {
  label: string;
  href: string;
  icon?: string | null;
}

export const navTabs: NavLink[] = navigation.tabs;
export const navAnchors: NavLink[] = navigation.anchors;

function pageNode(path: string): PageTree.Item | null {
  const slugs = path === 'index' ? [] : path.split('/');
  const page = source.getPage(slugs);
  if (!page) {
    console.warn(`[navigation] page not found: ${path}`);
    return null;
  }

  return {
    $id: `page:${path}`,
    type: 'page',
    name: page.data.title,
    url: page.url,
    icon: page.data.icon ? <Icon name={page.data.icon} /> : undefined,
  };
}

function buildItems(items: NavItem[], idPrefix: string): PageTree.Node[] {
  const out: PageTree.Node[] = [];
  for (const item of items) {
    if (typeof item === 'string') {
      const node = pageNode(item);
      if (node) out.push(node);
      continue;
    }

    const id = `${idPrefix}/${item.group}`;
    out.push({
      $id: id,
      type: 'folder',
      name: item.group,
      icon: item.icon ? <Icon name={item.icon} /> : undefined,
      children: buildItems(item.pages, id),
    });
  }
  return out;
}

let cached: PageTree.Root | undefined;

export function getNavigationTree(): PageTree.Root {
  if (cached) return cached;

  const children: PageTree.Node[] = [];
  for (const group of navigation.groups as NavGroup[]) {
    // top-level groups render as sidebar section headings
    children.push({ $id: `sep:${group.group}`, type: 'separator', name: group.group });
    children.push(...buildItems(group.pages, group.group));
  }

  cached = { $id: 'root', name: 'Docs', children };
  return cached;
}

/** Page paths in sidebar order (first occurrence wins), used for llms-full.txt */
export function getOrderedPagePaths(): string[] {
  const seen = new Set<string>();
  function walk(items: NavItem[]) {
    for (const item of items) {
      if (typeof item === 'string') seen.add(item);
      else walk(item.pages);
    }
  }
  walk(navigation.groups as NavGroup[]);
  return [...seen];
}
