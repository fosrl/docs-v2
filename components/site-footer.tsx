import {
  AndroidIcon,
  AppleIcon,
  GitHubIcon,
  LinuxIcon,
  LinkedInIcon,
  WindowsIcon,
  YouTubeIcon,
} from './icons';
import { Logo } from '@/lib/layout.shared';

const downloads = [
  { label: 'macOS', href: 'https://pangolin.net/downloads/mac', icon: AppleIcon },
  { label: 'iOS', href: 'https://pangolin.net/downloads/ios', icon: AppleIcon },
  { label: 'Windows', href: 'https://pangolin.net/downloads/windows', icon: WindowsIcon },
  { label: 'Android', href: 'https://pangolin.net/downloads/android', icon: AndroidIcon },
  { label: 'Linux', href: 'https://pangolin.net/downloads/linux', icon: LinuxIcon },
];

const socials = [
  { label: 'GitHub', href: 'https://github.com/fosrl/pangolin', icon: GitHubIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/pangolin-net', icon: LinkedInIcon },
  { label: 'YouTube', href: 'https://youtube.com/@pangolin-net', icon: YouTubeIcon },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="pg-footer">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="h-6 w-px bg-fd-border" aria-hidden />
          <div className="flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer noopener"
                className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              >
                <Icon className="size-4.5" />
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {downloads.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} className="pg-download">
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-fd-muted-foreground">
        <a
          href="https://status.pangolin.net"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground"
        >
          <span className="size-2 shrink-0 rounded-full bg-[#2d8a4e]" aria-hidden />
          All systems operational
        </a>
        <p>© {year} Fossorial Inc.</p>
      </div>
    </footer>
  );
}
