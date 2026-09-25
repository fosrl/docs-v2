import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type SystemModelMessage,
} from 'ai';
import type { ChatUIMessage } from '@/components/ai/search';
import { AIConfigError, getModel } from '@/lib/ai/model';
import { getSystemPrompt } from '@/lib/ai/prompt';
import { checkRateLimit, clientKey } from '@/lib/ai/rate-limit';
import { tools } from '@/lib/ai/tools';

export const maxDuration = 120;

const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 8_000;

function json(status: number, message: string, headers?: HeadersInit) {
  return Response.json({ error: message }, { status, headers });
}

export async function POST(req: Request) {
  const limit = checkRateLimit(clientKey(req));
  if (!limit.ok) {
    return json(429, `Too many questions, try again in ${limit.retryAfter}s.`, {
      'Retry-After': String(limit.retryAfter),
    });
  }

  let config;
  try {
    config = getModel();
  } catch (e) {
    if (e instanceof AIConfigError) return json(503, e.message);
    throw e;
  }

  const body = (await req.json().catch(() => null)) as { messages?: ChatUIMessage[] } | null;
  const messages = (body?.messages ?? []).slice(-MAX_MESSAGES);
  const tooLong = messages.some((m) =>
    m.parts.some((p) => p.type === 'text' && p.text.length > MAX_MESSAGE_CHARS),
  );
  if (messages.length === 0 || tooLong) return json(400, 'Invalid or too long message.');

  const instructions: SystemModelMessage = {
    role: 'system',
    content: getSystemPrompt(),
    // the system prompt is large and identical across requests
    providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } },
  };

  const result = streamText({
    model: config.model,
    stopWhen: stepCountIs(8),
    tools,
    toolChoice: 'auto',
    instructions,
    messages: await convertToModelMessages<ChatUIMessage>(messages, {
      convertDataPart(part) {
        if (part.type === 'data-client')
          return {
            type: 'text',
            text: `[Client Context: ${JSON.stringify(part.data)}]`,
          };
      },
    }),
    onError({ error }) {
      console.error('[api/chat]', error);
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: () => 'The assistant hit an error. Please try again.',
    }),
  });
}
