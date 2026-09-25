'use client';
import { useState, type FormEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAISearchContext, useAskAI } from './search';

/**
 * Mintlify-style "Ask a question..." bar that sticks to the bottom of the page content.
 * Submitting opens the chat panel with the question; it hides while the panel is open.
 */
export function AskBar() {
  const { open } = useAISearchContext();
  const ask = useAskAI();
  const [value, setValue] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    ask(text);
    setValue('');
  }

  return (
    <div className={cn('pg-askbar-wrap', open && 'pg-askbar-hidden')} aria-hidden={open}>
      <form onSubmit={onSubmit} className="pg-chat-input pg-askbar">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask a question..."
          aria-label="Ask AI about the docs"
          tabIndex={open ? -1 : undefined}
        />
        <kbd className="pg-askbar-kbd">⌘I</kbd>
        <button
          type="submit"
          className="pg-chat-send"
          aria-label="Send"
          disabled={value.trim().length === 0}
          tabIndex={open ? -1 : undefined}
        >
          <ArrowUp className="size-4" />
        </button>
      </form>
    </div>
  );
}
