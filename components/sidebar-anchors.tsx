'use client';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import navigation from '@/lib/navigation.json';
import { Icon } from './icons';

/**
 * Sidebar header with the global anchors (Discord, Slack) from `lib/navigation.json`,
 * styled like Mintlify's anchors. Rendered through the sidebar `banner` slot as a
 * component so it owns the header padding; the bottom spacing matches the gap between
 * sidebar groups.
 */
export function SidebarAnchors({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('flex flex-col px-4 pt-4', className)}>
      {children}
      <ul className="flex flex-col gap-1 max-lg:mt-4">
        {navigation.anchors.map((anchor) => (
          <li key={anchor.href}>
            <a
              href={anchor.href}
              target="_blank"
              rel="noreferrer noopener"
              className="pg-anchor"
            >
              <span className="pg-anchor-icon">
                <Icon name={anchor.icon ?? undefined} />
              </span>
              {anchor.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
