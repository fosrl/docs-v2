'use client';
import { Sparkles } from 'lucide-react';
import {
  FullSearchTrigger,
  SearchTrigger,
  type FullSearchTriggerProps,
  type SearchTriggerProps,
} from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/button';
import { useAISearchContext } from './ai/search';

/**
 * Header search slot: the normal search bar with an "Ask AI" button to its right, like
 * Mintlify. The layout passes the search bar's sizing classes; they go on the wrapper.
 */
function HeaderSearchFull({ className, ...props }: FullSearchTriggerProps) {
  const { open, setOpen } = useAISearchContext();

  return (
    <div className={cn(className, 'flex items-center gap-2 ps-0 max-w-md')}>
      <FullSearchTrigger {...props} className="ps-2.5 rounded-xl flex-1 min-w-0 h-9" />
      <button
        type="button"
        className="pg-ask-ai-btn"
        data-state={open ? 'open' : 'closed'}
        aria-pressed={open}
        onClick={() => setOpen(!open)}
      >
        <Sparkles />
        Ask AI
      </button>
    </div>
  );
}

function HeaderSearchSm({ className, ...props }: SearchTriggerProps) {
  const { open, setOpen } = useAISearchContext();

  return (
    <>
      <SearchTrigger {...props} className={className} />
      <button
        type="button"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'p-2')}
        aria-label="Ask AI"
        aria-pressed={open}
        data-state={open ? 'open' : 'closed'}
        onClick={() => setOpen(!open)}
      >
        <Sparkles />
      </button>
    </>
  );
}

export const headerSearchSlot = { full: HeaderSearchFull, sm: HeaderSearchSm };
