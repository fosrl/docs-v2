import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { Banner } from 'fumadocs-ui/components/banner';
import Link from 'fumadocs-core/link';
import { baseOptions } from '@/lib/layout.shared';
import { getNavigationTree, navTabs } from '@/lib/navigation';
import { banner } from '@/lib/shared';
import { source } from '@/lib/source';
import type { CSSProperties } from 'react';
import { AISearch, AISearchPanel } from '@/components/ai/search';
import { headerSearchSlot } from '@/components/header-search';
import { SidebarAnchors } from '@/components/sidebar-anchors';

const tabs: LayoutTab[] = [
  // every docs page counts as the "Documentation" tab
  { title: 'Documentation', url: '/', urls: new Set(source.getPages().map((page) => page.url)) },
  ...navTabs.map((tab) => ({
    title: tab.label,
    url: tab.href,
    props: { target: '_blank', rel: 'noreferrer noopener' },
  })),
];

/** Mintlify-style grid, defined as `--pg-grid` in app/global.css (responsive) */
const containerStyle = { gridTemplate: 'var(--pg-grid)' } as CSSProperties;

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Banner id={banner.id} className="pg-banner">
        <p>
          <strong>AI Gateway</strong> is now available
          <span className="max-md:hidden">
            : identity-aware access to any AI provider, eliminate API keys, and tunnel to
            self-hosted models
          </span>
          .{' '}
          <Link href={banner.link.href} className="underline underline-offset-2 font-medium">
            {banner.link.label}
          </Link>
        </p>
      </Banner>
      {/* chat state wraps the whole layout so the header "Ask AI" button can open it */}
      <AISearch>
        <DocsLayout
          {...baseOptions()}
          slots={{ searchTrigger: headerSearchSlot }}
          tree={getNavigationTree()}
          nav={{ ...baseOptions().nav, mode: 'top' }}
          tabMode="navbar"
          tabs={tabs}
          sidebar={{
            defaultOpenLevel: 0,
            collapsible: false,
            banner: SidebarAnchors,
          }}
          containerProps={{ style: containerStyle }}
        >
          <AISearchPanel />
          {children}
        </DocsLayout>
      </AISearch>
    </>
  );
}
