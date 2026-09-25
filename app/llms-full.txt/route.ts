import { getPageText, source } from '@/lib/source';
import { getOrderedPagePaths } from '@/lib/navigation';

export const revalidate = false;

export async function GET() {
  const pages = source.getPages();
  const byPath = new Map(pages.map((page) => [page.slugs.join('/') || 'index', page]));

  // sidebar order first, then everything that isn't listed in the sidebar
  const ordered = getOrderedPagePaths()
    .map((path) => byPath.get(path))
    .filter((page) => page !== undefined);
  const rest = pages.filter((page) => !ordered.includes(page));

  const texts = await Promise.all([...ordered, ...rest].map(getPageText));
  return new Response(texts.join('\n\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
