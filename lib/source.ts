import { llms, loader } from 'fumadocs-core/source';
import { docsContentRoute, docsDir, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { transformerMetaHighlight } from '@shikijs/transformers';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';

const docs = defineDocs({
  dir: docsDir,
  docs: {
    schema: pageSchema,
    mdxOptions: applyMdxPreset({
      rehypeCodeOptions: {
        // languages used in the content that Shiki doesn't ship
        langAlias: { env: 'dotenv', dns: 'txt', promql: 'txt' },
        langs: ['dotenv'],
        fallbackLanguage: 'txt',
        themes: {
          light: 'gruvbox-light-hard',
          dark: 'gruvbox-dark-hard',
        },
        transformers: [
          ...(rehypeCodeDefaultOptions.transformers ?? []),
          // Mintlify-style `{1,3-5}` line highlights
          transformerMetaHighlight(),
        ],
      },
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
});

export type Page = ReturnType<typeof source.getPages>[number];

export async function getPageText(page: Page) {
  return `# ${page.data.title} (${page.url})

${page.data.description ? `> ${page.data.description}\n\n` : ''}${await page.data.getText('processed')}`;
}

export const docsLlms = llms(source, {
  renderPage: getPageText,
});

export { docsContentRoute };
