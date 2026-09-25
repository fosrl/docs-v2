# Pangolin Documentation

The Pangolin docs site, built with [Fumadocs](https://fumadocs.dev) on Next.js and fully self-hostable. It replaces the old Mintlify site (`docs-v2`) and keeps the same URLs.

## Features

- **Same URLs as Mintlify.** Pages are served from the site root (`/manage/sites/install-site`). The old Mintlify redirects are in `lib/redirects.json`.
- **Full-text search** (Orama, runs in-process) with <kbd>⌘</kbd><kbd>K</kbd>, served from `/api/search`.
- **AI assistant**: a sticky "Ask a question…" bar at the bottom of every page (<kbd>⌘</kbd><kbd>I</kbd>) that opens a chat panel. An agent that searches and reads the docs and cites the pages it used. It runs on your own API key with Anthropic, OpenAI, Google, or any OpenAI-compatible endpoint.
- **LLM-friendly output:**
  - `/llms.txt`: an index following the sidebar structure
  - `/llms-full.txt`: every page in one file
  - `/<any-page>.md`: the Markdown for a single page. Requests sent with `Accept: text/markdown` get the same Markdown.
  - Each page has "Copy Markdown" and "Open in ChatGPT / Claude / …" actions.
- Generated Open Graph images for every page (`/og/...`).

## Development

```bash
npm install
cp .env.example .env.local   # optional: add an AI key
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run types:check`.

## Writing docs

- Pages live in `content/docs/**/*.mdx`. The URL is the file path.
- The **sidebar** is defined in `lib/navigation.json`, using the same group/pages shape as Mintlify's `docs.json`. Mintlify groups don't map to folders, so this file replaces per-folder `meta.json`. A page that isn't listed there is still published; it just doesn't appear in the sidebar.
- The Mintlify components used by the content keep working with the same names and props: `Note`, `Info`, `Tip`, `Warning`, `Check`, `Card`, `CardGroup`, `Columns`, `Steps`/`Step`, `Tabs`/`Tab`, `Accordion`/`AccordionGroup`, `Expandable`, `ResponseField`, `Frame`, `Update`. They're implemented in `components/mintlify.tsx`, and the icon names are mapped from Font Awesome in `components/icons.tsx`.
- Code blocks: ` ```yaml title="config.yml" {3-5}` sets a title and highlights lines 3–5. To make tabbed code, put consecutive blocks with `tab="Name"` in a row (this replaces `<CodeGroup>`).
- Shared snippets live in `content/snippets/` and are pulled in with `<include>../../snippets/file.mdx</include>`.
- Images go in `public/images/` and are referenced as `/images/...`.

## AI assistant configuration

Everything is set with server-side environment variables, so keys are never sent to the browser. See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Set one of these to choose that provider |
| `AI_BASE_URL` + `AI_API_KEY` | Any OpenAI-compatible API (OpenRouter, Ollama, vLLM, LiteLLM, a Pangolin AI Gateway resource) |
| `AI_PROVIDER` | Force a provider when more than one key is set |
| `AI_MODEL` | Model ID. Defaults: `gpt-5.6-luna`, `claude-opus-5`, `gemini-2.5-pro`. Required for OpenAI-compatible endpoints |
| `AI_RATE_LIMIT_PER_MINUTE` | Per-IP limit on `/api/chat` (default 10, `0` turns it off). The limit is kept in memory for each server instance |

If no key is set, the rest of the site works normally and the assistant returns a clear "not configured" message.

How it works (`lib/ai/`): the system prompt contains an index of every page, and the model has two tools. `search_docs` queries the same Orama index as the search bar, and `read_page` returns a page's full Markdown. The route is `app/api/chat/route.ts`, and the UI is in `components/ai/`.

## Self-hosting

```bash
docker compose up -d --build        # reads .env if present, serves on :3000
```

or without Compose:

```bash
docker build -t pangolin-docs --build-arg NEXT_PUBLIC_SITE_URL=https://docs.pangolin.net .
docker run -p 3000:3000 -e OPENAI_API_KEY=... pangolin-docs
```

The build uses Next.js `output: 'standalone'`, so the image only needs Node to run. Pages, llms files, and OG images are prerendered. Only `/api/search` and `/api/chat` run at request time.

## Syncing from the Mintlify repo

`scripts/migrate-from-mintlify.py` copies content, images, navigation, and redirects from `docs-v2` and rewrites the Mintlify-only syntax (code fence titles, `highlight=`, `<CodeGroup>`, snippet imports). It overwrites `content/`, `public/images`, `lib/navigation.json`, and `lib/redirects.json`, so only use it while `docs-v2` is still the source of truth:

```bash
npm run migrate    # = python3 scripts/migrate-from-mintlify.py ../docs-v2
```
