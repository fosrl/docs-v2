'use client';
import { Sparkles } from 'lucide-react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { cn } from '@/lib/cn';
import { useAskAI } from './search';

export function AskAIAboutPage({ title }: { title: string }) {
  const ask = useAskAI();
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ color: 'secondary', size: 'sm' }),
        'gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground',
      )}
      onClick={() => ask(`Summarize the "${title}" page I'm on and what I should do next.`)}
    >
      <Sparkles />
      Ask AI
    </button>
  );
}
