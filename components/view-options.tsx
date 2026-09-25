'use client';

import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { ChevronDown, ExternalLink, Text } from 'lucide-react';
import { useMemo, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { GitHubIcon } from './icons';

type ViewOptionsPopoverProps = ComponentProps<typeof PopoverTrigger> & {
  markdownUrl?: string;
  githubUrl?: string;
  /** Canonical page URL the AI prompts ask to read. */
  pageUrl: string;
};

type Option = {
  title: string;
  href: string;
  icon: ReactNode;
};

export function ViewOptionsPopover({
  markdownUrl,
  githubUrl,
  pageUrl,
  children,
  className,
  ...props
}: ViewOptionsPopoverProps) {
  const items = useMemo(() => {
    const prompt = `Read ${pageUrl}, I want to ask questions about it.`;
    const options: Option[] = [];

    if (githubUrl) {
      options.push({
        title: 'Open in GitHub',
        href: githubUrl,
        icon: <GitHubIcon />,
      });
    }

    if (markdownUrl) {
      options.push({
        title: 'View as Markdown',
        href: markdownUrl,
        icon: <Text />,
      });
    }

    options.push(
      {
        title: 'Open in ChatGPT',
        href: `https://chatgpt.com/?${new URLSearchParams({ prompt, hints: 'search' })}`,
        icon: <OpenAIIcon />,
      },
      {
        title: 'Open in Claude',
        href: `https://claude.ai/new?${new URLSearchParams({ q: prompt })}`,
        icon: <ClaudeIcon />,
      },
      {
        title: 'Open in Gemini',
        // gemini.google.com ignores prompt query params; AI Mode is Gemini and reads `q`
        href: `https://www.google.com/search?${new URLSearchParams({ udm: '50', q: prompt })}`,
        icon: <GeminiIcon />,
      },
    );

    return options;
  }, [githubUrl, markdownUrl, pageUrl]);

  return (
    <Popover>
      <PopoverTrigger
        {...props}
        className={(state) =>
          cn(
            buttonVariants({ variant: 'secondary', size: 'sm' }),
            'gap-2 data-[popup-open]:bg-fd-accent data-[popup-open]:text-fd-accent-foreground',
            typeof className === 'function' ? className(state) : className,
          )
        }
      >
        {children ?? 'Open'}
        <ChevronDown className="size-3.5 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            className="text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:text-fd-accent-foreground hover:bg-fd-accent [&_svg]:size-4"
          >
            {item.icon}
            {item.title}
            <ExternalLink className="text-fd-muted-foreground size-3.5 ms-auto" />
          </a>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function OpenAIIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.062l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.074a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg fill="currentColor" role="img" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.304 3.541h-3.672l6.696 16.918H24zm-10.608 0L0 20.459h3.744l1.369-3.553h7.005l1.37 3.553h3.744L10.536 3.541zm-.372 10.223 2.292-5.946 2.291 5.946z" />
    </svg>
  );
}

function GeminiIcon() {
  return (
    <svg fill="currentColor" role="img" viewBox="0 0 24 24" aria-hidden>
      <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
    </svg>
  );
}
