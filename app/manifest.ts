import type { MetadataRoute } from 'next';
import { appName, siteDescription } from '@/lib/shared';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: appName,
    description: siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF9F2',
    theme_color: '#FAF9F2',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
