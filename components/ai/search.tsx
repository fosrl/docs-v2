'use client';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { ArrowUp, FileText, Loader2, RefreshCw, SearchIcon, Sparkles, Square, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Markdown } from '../markdown';

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;


const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<ChatUIMessage>;
} | null>(null);

export function AISearchPanelHeader({ className, ...props }: ComponentProps<'div'>) {
  const { setOpen } = useAISearchContext();

  return (
    <div
      className={cn(
        'sticky top-0 flex items-start gap-2 border rounded-xl bg-fd-secondary text-fd-secondary-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="px-3 py-2 flex-1">
        <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-fd-primary" />
          Ask Pangolin AI
        </p>
        <p className="text-xs text-fd-muted-foreground">
          Answers are generated from the docs and can be wrong. Check the linked pages.
        </p>
      </div>

      <button
        aria-label="Close"
        tabIndex={-1}
        className={cn(
          buttonVariants({
            size: 'icon-sm',
            variant: 'ghost',
            className: 'text-fd-muted-foreground rounded-full',
          }),
        )}
        onClick={() => setOpen(false)}
      >
        <X />
      </button>
    </div>
  );
}

export function AISearchInputActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === 'streaming';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className={cn(
            buttonVariants({
              variant: 'secondary',
              size: 'sm',
              className: 'rounded-full gap-1.5',
            }),
          )}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          Retry
        </button>
      )}
      <button
        type="button"
        className={cn(
          buttonVariants({
            variant: 'secondary',
            size: 'sm',
            className: 'rounded-full',
          }),
        )}
        onClick={() => setMessages([])}
      >
        Clear Chat
      </button>
    </>
  );
}

const suggestions = [
  'How do I expose a web app running on my home server?',
  'What is the difference between a site and a client?',
  'How do I self-host Pangolin with Docker Compose?',
  'How do I connect Claude Code to the AI Gateway?',
];

function sendText(send: UseChatHelpers<ChatUIMessage>['sendMessage'], text: string) {
  void send({
    role: 'user',
    parts: [
      { type: 'data-client', data: { location: location.href } },
      { type: 'text', text },
    ],
  });
}

/** open the panel and immediately ask `text` */
export function useAskAI() {
  const { setOpen, chat } = useAISearchContext();
  return (text: string) => {
    setOpen(true);
    if (chat.status === 'streaming' || chat.status === 'submitted') return;
    sendText(chat.sendMessage, text);
  };
}

const StorageKeyInput = '__ai_search_input';
export function AISearchInput(props: ComponentProps<'form'>) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState(() => {
    try {
      return localStorage.getItem(StorageKeyInput) ?? '';
    } catch {
      return '';
    }
  });
  const isLoading = status === 'streaming' || status === 'submitted';
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const message = input.trim();
    if (message.length === 0) return;

    sendText(sendMessage, message);
    setInput('');
    try {
      localStorage.removeItem(StorageKeyInput);
    } catch {
      // storage unavailable
    }
  };

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus();
  }, [isLoading]);

  return (
    <form {...props} className={cn('flex items-end gap-2 p-2', props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={isLoading ? 'Pangolin AI is answering…' : 'Ask a question...'}
        autoFocus
        className="px-2 py-1.5 text-sm"
        disabled={status === 'streaming' || status === 'submitted'}
        onChange={(e) => {
          setInput(e.target.value);
          try {
            localStorage.setItem(StorageKeyInput, e.target.value);
          } catch {
            // storage unavailable
          }
        }}
        onKeyDown={(event) => {
          // keyCode 229: Safari fires `compositionend` before this keydown, `isComposing` is already false
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (!event.shiftKey && event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button key="bn" type="button" className="pg-chat-send" aria-label="Stop answering" onClick={stop}>
          <Square className="size-3 fill-current" />
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className="pg-chat-send"
          aria-label="Send"
          disabled={input.trim().length === 0}
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn('fd-scroll-container overflow-y-auto min-w-0 flex flex-col', props.className)}
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<'textarea'>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('pg-chat-field col-start-1 row-start-1', props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          'resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none',
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, 'break-all invisible')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: 'You',
  assistant: 'Pangolin AI',
};

interface ToolPart {
  type: string;
  toolCallId: string;
  state: string;
  input?: { query?: string; path?: string };
  output?: unknown;
  errorText?: string;
}

function ToolActivity({ part }: { part: ToolPart }) {
  const name = part.type.slice('tool-'.length);
  const failed = part.state === 'output-error' || part.state === 'output-denied';
  const done = part.state === 'output-available';

  let label: ReactNode;
  if (name === 'search_docs') {
    const count = Array.isArray(part.output) ? part.output.length : 0;
    label = done ? (
      <>
        Searched <q>{part.input?.query}</q>, {count} {count === 1 ? 'page' : 'pages'}
      </>
    ) : (
      <>Searching <q>{part.input?.query ?? '…'}</q></>
    );
  } else if (name === 'read_page') {
    label = <>{done ? 'Read' : 'Reading'} <code>{part.input?.path ?? '…'}</code></>;
  } else {
    label = name;
  }

  const Icon = name === 'read_page' ? FileText : SearchIcon;
  return (
    <div className="flex flex-row gap-2 items-center rounded-lg border bg-fd-secondary text-fd-muted-foreground text-xs px-2 py-1.5 min-w-0">
      {done || failed ? <Icon className="size-3.5 shrink-0" /> : <Loader2 className="size-3.5 shrink-0 animate-spin" />}
      {failed ? (
        <p className="text-fd-error truncate">{part.errorText ?? 'Tool call failed'}</p>
      ) : (
        <p className="truncate">{label}</p>
      )}
    </div>
  );
}

function Message({ message, ...props }: { message: ChatUIMessage } & ComponentProps<'div'>) {
  let markdown = '';
  const toolCalls: ToolPart[] = [];

  for (const part of message.parts ?? []) {
    if (part.type === 'text') {
      markdown += part.text;
      continue;
    }

    if (part.type.startsWith('tool-')) {
      const p = part as unknown as ToolPart;
      if (p.toolCallId) toolCalls.push(p);
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()} {...props}>
      <p
        className={cn(
          'mb-1 text-sm font-medium text-fd-muted-foreground',
          message.role === 'assistant' && 'text-fd-primary',
        )}
      >
        {roleName[message.role] ?? 'unknown'}
      </p>
      {toolCalls.length > 0 && (
        <div className="flex flex-col gap-1 mb-2">
          {toolCalls.map((call) => (
            <ToolActivity key={call.toolCallId} part={call} />
          ))}
        </div>
      )}
      <div className="prose text-sm">
        <Markdown text={markdown} />
      </div>
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat<ChatUIMessage>({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>{children}</Context>
  );
}

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const { open, setOpen } = useAISearchContext();

  return (
    <button
      data-state={open ? 'open' : 'closed'}
      className={cn(
        position === 'float' && [
          'fixed bottom-4 gap-2 inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] shadow-lg z-20 transition-[translate,opacity]',
          open && 'translate-y-10 opacity-0',
        ],
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext();
  const [actualOpen, setActualOpen] = useState(open);
  useHotKey();

  if (open && !actualOpen) setActualOpen(open);

  // The docs grid reserves a column for the panel while this attribute is set (see
  // `--pg-panel` in app/global.css). It follows `open` directly, so the content moves
  // back as soon as the panel starts closing, whatever happens to the close animation.
  useEffect(() => {
    const layout = document.getElementById('nd-notebook-layout');
    layout?.toggleAttribute('data-ai-open', open);
    return () => layout?.removeAttribute('data-ai-open');
  }, [open]);

  // Unmount after the close animation. `animationend` never fires when animations are
  // skipped (background tab, reduced motion), so also fall back to a timer.
  useEffect(() => {
    if (open || !actualOpen) return;
    const timer = window.setTimeout(() => setActualOpen(false), 300);
    return () => window.clearTimeout(timer);
  }, [open, actualOpen]);

  return (
    <>
      <style>
        {`
        @keyframes ask-ai-open {
          from {
            translate: 100% 0;
          }
          to {
            translate: 0 0;
          }
        }
        @keyframes ask-ai-close {
          from {
            width: var(--ai-chat-width);
          }
          to {
            width: 0px;
          }
        }`}
      </style>
      {actualOpen && (
        <div
          className={cn(
            'fixed inset-0 z-30 backdrop-blur-xs bg-fd-overlay lg:hidden',
            open ? 'animate-fd-fade-in' : 'animate-fd-fade-out',
          )}
          onClick={() => setOpen(false)}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false));
          }}
        />
      )}
      {actualOpen && (
        <div
          className={cn(
            'pg-ai-panel overflow-hidden z-30 bg-fd-card text-fd-card-foreground [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]',
            'max-lg:fixed max-lg:inset-x-2 max-lg:inset-y-4 max-lg:border max-lg:rounded-2xl max-lg:shadow-xl',
            'lg:sticky lg:top-(--fd-docs-row-2) lg:h-[calc(100dvh-var(--fd-docs-row-2))] lg:border-s lg:ms-auto lg:in-[#nd-notebook-layout]:[grid-area:2/5/4/6]',
            open
              ? 'animate-fd-dialog-in lg:animate-[ask-ai-open_200ms]'
              : 'animate-fd-dialog-out lg:animate-[ask-ai-close_200ms]',
          )}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false));
          }}
        >
          <div className="flex flex-col size-full p-2 lg:p-3 lg:w-(--ai-chat-width)">
            <AISearchPanelHeader />
            <AISearchPanelList className="flex-1" />
            <div className="pg-chat-input">
              <AISearchInput />
              <div className="flex items-center gap-1.5 px-2 pb-2 empty:hidden">
                <AISearchInputActions />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AISearchPanelList({ className, style, ...props }: ComponentProps<'div'>) {
  const chat = useChatContext();
  const messages = chat.messages.filter((msg) => msg.role !== 'system');

  return (
    <List
      className={cn('py-4 overscroll-contain', className)}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
        ...style,
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <div
          className="size-full flex flex-col justify-end gap-2 px-1"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm text-fd-muted-foreground mb-1">
            Ask anything about Pangolin. The assistant searches and reads these docs to answer.
          </p>
          {suggestions.map((q) => (
            <button
              key={q}
              type="button"
              className="text-start text-sm rounded-xl border bg-fd-card px-3 py-2 text-fd-foreground transition-colors hover:bg-fd-accent"
              onClick={() => sendText(chat.sendMessage, q)}
            >
              {q}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col px-3 gap-4">
          {messages.map((item) => (
            <Message key={item.id} message={item} />
          ))}
          {chat.error && (
            <div className="p-2 bg-fd-secondary text-fd-secondary-foreground border rounded-lg">
              <p className="text-xs text-fd-muted-foreground mb-1">Request failed</p>
              <p className="text-sm">{errorText(chat.error)}</p>
            </div>
          )}
        </div>
      )}
    </List>
  );
}

/** `/api/chat` returns `{ error }` JSON for config / rate-limit errors */
function errorText(error: Error) {
  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // not JSON
  }
  return error.message;
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if ((e.key === '/' || e.key === 'i') && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, []);
}

export function useAISearchContext() {
  return use(Context)!;
}

function useChatContext() {
  return use(Context)!.chat;
}
