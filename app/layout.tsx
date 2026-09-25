import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@/components/analytics';
import { appName, enableDarkMode, siteDescription, siteUrl } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { template: `%s - ${appName}`, default: appName },
  description: siteDescription,
  icons: { icon: '/favicon.png' },
  openGraph: { siteName: appName, images: '/images/home-social-graph.png' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#FAF9F2',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={
            enableDarkMode
              ? { defaultTheme: 'light' }
              : { forcedTheme: 'light', defaultTheme: 'light' }
          }
        >
          {children}
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
