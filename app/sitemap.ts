import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { docsDir, siteUrl } from '@/lib/shared';

/**
 * Same shape as a Mintlify docs sitemap (`/docs/sitemap.xml` on Infisical):
 * one `<loc>` and `<lastmod>` per published page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const dates = lastCommitDates();

  return source
    .getPages()
    .map((page) => {
      const file = `${docsDir}/${page.path}`;
      return {
        url: `${siteUrl}${page.url}`,
        lastModified: dates.get(file) ?? mtime(page.absolutePath ?? path.join(process.cwd(), file)),
      };
    })
    .sort((a, b) => a.url.localeCompare(b.url));
}

/** Newest commit that touched each file under content/docs. Empty when git is unavailable. */
function lastCommitDates(): Map<string, Date> {
  const dates = new Map<string, Date>();
  try {
    const out = execFileSync('git', ['log', '--format=COMMIT %cI', '--name-only', '--', docsDir], {
      encoding: 'utf8',
    });
    let current: Date | undefined;
    for (const line of out.split('\n')) {
      if (line.startsWith('COMMIT ')) {
        const date = new Date(line.slice('COMMIT '.length));
        current = Number.isNaN(date.getTime()) ? undefined : date;
      } else if (line && current && !dates.has(line)) {
        dates.set(line, current);
      }
    }
  } catch {
    // Docker builds without git fall back to file mtime.
  }
  return dates;
}

function mtime(file: string): Date {
  try {
    return statSync(file).mtime;
  } catch {
    return new Date();
  }
}
