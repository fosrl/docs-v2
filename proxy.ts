import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute } from '@/lib/shared';

// `/some/page.md` (and `.mdx`) -> raw Markdown of the page, like Mintlify
const { rewrite: rewriteSuffix } = rewritePath(
  '{/*path}.md',
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffixMdx } = rewritePath(
  '{/*path}.mdx',
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteDocs } = rewritePath('{/*path}', `${docsContentRoute}{/*path}/content.md`);

function normalize(result: string) {
  // `/index.md` is the home page
  return result.replace(new RegExp(`^${docsContentRoute}/index/content\\.md$`), `${docsContentRoute}/content.md`);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const suffix = rewriteSuffix(pathname) || rewriteSuffixMdx(pathname);
  if (suffix) {
    return NextResponse.rewrite(new URL(normalize(suffix), request.nextUrl));
  }

  // agents asking for `Accept: text/markdown` get Markdown on the normal URL
  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(pathname === '/' ? '' : pathname);
    if (result) {
      return NextResponse.rewrite(new URL(normalize(result), request.nextUrl), {
        headers: { Vary: 'Accept' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  // skip Next internals, API routes, generated files and static assets
  matcher: [
    '/((?!_next/|api/|og/|llms|images/|logo/|favicon|icon|apple-icon|manifest|web-app-manifest|sitemap\\.xml|robots\\.txt).*)',
  ],
};
