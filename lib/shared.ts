import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Pangolin Docs';
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.pangolin.net';
export const siteDescription =
  'Modern networking and security platform providing secure access and connectivity to apps, infrastructure, and AI workloads. Connect and protect your users.';

/** docs are served from the site root, same URLs as the old Mintlify site */
export const docsRoute = '/';
export const docsContentRoute = '/llms.mdx';

export const gitConfig = {
  user: 'fosrl',
  repo: 'docs',
  branch: 'main',
};

/** collection directory; `page.path` is relative to this */
export const docsDir = 'content/docs';

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

/**
 * The Mintlify site was light-only (`appearance.strict`). Flip this to enable the
 * theme switch; the dark palette in `app/global.css` is ready for it.
 */
export const enableDarkMode = false;

export const links = {
  login: 'https://app.pangolin.net/auth/login',
  signup: 'https://app.pangolin.net/auth/signup',
  github: 'https://github.com/fosrl/pangolin',
  featureRequest: 'https://github.com/fosrl/pangolin/discussions',
};

/** top banner (text lives in `app/(docs)/layout.tsx`) */
export const banner = {
  /** change the id whenever the text changes so dismissed banners show again */
  id: 'ai-gateway-launch',
  link: { label: 'Get started', href: '/manage/ai/overview' },
};
