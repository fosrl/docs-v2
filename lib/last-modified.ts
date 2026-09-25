import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';
import { docsDir } from './shared';

type ContentFile = { path: string; absolutePath?: string };

let cached: Map<string, Date> | undefined;

/** Newest commit that touched each file under content/docs. Empty when git is unavailable. */
function commitDates(): Map<string, Date> {
  if (cached) return cached;

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

  cached = dates;
  return dates;
}

function mtime(file: string): Date {
  try {
    return statSync(file).mtime;
  } catch {
    return new Date();
  }
}

/** Last time this page's MDX changed: newest commit, then file mtime. */
export function pageLastModified(page: ContentFile): Date {
  const file = `${docsDir}/${page.path}`;
  return commitDates().get(file) ?? mtime(page.absolutePath ?? path.join(process.cwd(), file));
}
