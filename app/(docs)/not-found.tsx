import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import { NotFoundPage, type NotFoundLink } from '@/components/not-found';
import { getNavigationTree } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

function label(name: ReactNode) {
  return typeof name === 'string' ? name : null;
}

function flatten(nodes: PageTree.Node[]): NotFoundLink[] {
  const links: NotFoundLink[] = [];
  for (const node of nodes) {
    if (node.type === 'page') {
      const title = label(node.name);
      if (title && node.url) links.push({ title, url: node.url });
      continue;
    }
    if (node.type === 'folder') links.push(...flatten(node.children));
  }
  return links;
}

export default function NotFound() {
  return <NotFoundPage pages={flatten(getNavigationTree().children)} />;
}
