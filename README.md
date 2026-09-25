# Pangolin Documentation

The Pangolin docs site, built with [Fumadocs](https://fumadocs.dev) on Next.js.

## Development

```bash
npm install
cp .env.example .env.local   # optional: add an AI key
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run types:check`.

The site works without an AI key. To enable the assistant, set one provider key in `.env.local` (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GOOGLE_GENERATIVE_AI_API_KEY`). See `.env.example` for model, OpenAI-compatible endpoint, and rate-limit options.

## Writing docs

- Pages live in `content/docs/**/*.mdx`. The URL is the file path.
- The sidebar is defined in `lib/navigation.json`. A page that isn't listed there is still published; it just doesn't appear in the sidebar.
- Callouts and layout components (`Note`, `Info`, `Tip`, `Warning`, `Check`, `Card`, `CardGroup`, `Columns`, `Steps`/`Step`, `Tabs`/`Tab`, `Accordion`/`AccordionGroup`, `Expandable`, `ResponseField`, `Frame`, `Update`) are implemented in `components/mintlify.tsx`. Icon names are mapped in `components/icons.tsx`.
- Code blocks: ` ```yaml title="config.yml" {3-5}` sets a title and highlights lines 3–5. To make tabbed code, put consecutive blocks with `tab="Name"` in a row.
- Shared snippets live in `content/snippets/` and are pulled in with `<include>../../snippets/file.mdx</include>`.
- Images go in `public/images/` and are referenced as `/images/...`.
