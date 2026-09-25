import { createFromSource } from 'fumadocs-core/search/server';
import { source } from './source';

/**
 * One full-text index (Orama) shared by the search dialog (`/api/search`) and the
 * AI assistant's `search_docs` tool.
 */
export const searchServer = createFromSource(source, {
  language: 'english',
});
