import { createMDX } from 'fumadocs-mdx/next';
import { readFileSync } from 'node:fs';

const withMDX = createMDX();

/** ported from Mintlify docs.json `redirects` (regenerate with scripts/migrate-from-mintlify.py) */
const redirects = JSON.parse(readFileSync(new URL('./lib/redirects.json', import.meta.url), 'utf8'));

/** @type {import('next').NextConfig} */
const config = {
  allowedDevOrigins: ['fuma-docs-dev.int.fossorial.io'],
  reactStrictMode: true,
  // self-contained server bundle for the Docker image
  output: 'standalone',
  async redirects() {
    return redirects;
  },
};

export default withMDX(config);
