import { source } from '@/lib/source';
import { getNavigationTree } from '@/lib/navigation';
import { appName, siteDescription, siteUrl } from '@/lib/shared';
import type * as PageTree from 'fumadocs-core/page-tree';

export const revalidate = false;

/** https://llmstxt.org — follows the sidebar structure, plus pages not listed in it */
export async function GET() {
  const tree = getNavigationTree();
  const lines: string[] = [
    `# ${appName}`,
    '',
    `> ${siteDescription}`,
    '',
    `The full documentation as a single file is available at ${siteUrl}/llms-full.txt. Append \`.md\` to any page URL to get its Markdown source.`,
    `An MCP server for searching and reading this documentation is available at ${siteUrl}/mcp.`,
    '',
  ];
  const listed = new Set<string>();

  function descriptionOf(url: string) {
    const page = source.getPages().find((p) => p.url === url);
    return page?.data.description;
  }

  function item(node: PageTree.Item, depth: number) {
    listed.add(node.url);
    const description = descriptionOf(node.url);
    lines.push(
      `${'  '.repeat(depth)}- [${String(node.name)}](${siteUrl}${node.url}.md)${description ? `: ${description}` : ''}`,
    );
  }

  function walk(nodes: PageTree.Node[], depth: number) {
    for (const node of nodes) {
      if (node.type === 'separator') {
        lines.push('', `## ${String(node.name)}`, '');
      } else if (node.type === 'page') {
        item(node, depth);
      } else {
        lines.push(`${'  '.repeat(depth)}- ${String(node.name)}`);
        if (node.index) item(node.index, depth + 1);
        walk(node.children, depth + 1);
      }
    }
  }
  walk(tree.children, 0);

  const optional = source.getPages().filter((page) => !listed.has(page.url));
  if (optional.length > 0) {
    lines.push('', '## Optional', '');
    for (const page of optional) {
      lines.push(
        `- [${page.data.title}](${siteUrl}${page.url}.md)${page.data.description ? `: ${page.data.description}` : ''}`,
      );
    }
  }

  return new Response(lines.join('\n').replace(/\/\.md\)/g, '/index.md)') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
