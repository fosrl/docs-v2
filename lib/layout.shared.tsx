import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, enableDarkMode, links } from './shared';

export function Logo() {
  return (
    <>
      <img
        src="/logo/light.png"
        alt={appName}
        width={665}
        height={164}
        className="pg-logo dark:hidden"
      />
      <img
        src="/logo/dark.png"
        alt={appName}
        width={933}
        height={164}
        className="pg-logo hidden dark:block"
      />
    </>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      url: '/',
    },
    themeSwitch: { enabled: enableDarkMode },
    links: [
      // pill buttons styled like the pangolin.net navbar (secondary + primary)
      {
        type: 'custom',
        on: 'nav',
        children: (
          <div className="flex items-center gap-2">
            <a href={links.login} className="pg-btn pg-btn-secondary">
              Log in
            </a>
            <a href={links.signup} className="pg-btn">
              Start for free
            </a>
          </div>
        ),
      },
      {
        type: 'main',
        text: 'Log in',
        url: links.login,
        external: true,
        on: 'menu',
      },
      {
        type: 'main',
        text: 'Start for free',
        url: links.signup,
        external: true,
        on: 'menu',
      },
    ],
  };
}
