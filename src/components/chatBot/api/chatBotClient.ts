import GEMINI_BASE_URL from '../../../config/gemini';
import { appendFormFile } from '../../../utils/formDataFile';
import type { ChatAttachment } from '../types';

export const MAX_PROMPT_LENGTH = 8000;

/** Callback invoked with each streamed text chunk as it arrives. */
export type TokenHandler = (chunk: string) => void;

export interface StreamChatParams {
  chatId: string;
  prompt: string;
  attachments?: ChatAttachment[];
  /** Supabase access token; sent as `Authorization: Bearer <token>`. */
  token: string | null;
  signal?: AbortSignal;
  onToken: TokenHandler;
}

/**
 * Streams a reply from the backend's `POST /api/gemini/chat-stream`.
 *
 * The endpoint returns raw text chunks (not SSE), which we read off the response
 * body reader and forward to `onToken`. Falls back to a single `text()` read when
 * the runtime can't stream the body.
 */
export async function streamChat(params: StreamChatParams): Promise<void> {
  const { chatId, prompt, attachments, token, signal, onToken } = params;

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(`El mensaje supera el límite de ${MAX_PROMPT_LENGTH} caracteres.`);
  }

  const url = `${GEMINI_BASE_URL}/api/gemini/chat-stream`;
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('chatId', chatId);
  // Sequential on purpose: keeps the files[] order and, on web, avoids
  // decoding several images into memory at once.
  for (const file of attachments ?? []) {
    await appendFormFile(form, 'files', {
      uri: file.uri,
      name: file.name ?? 'image.jpg',
      type: file.mimeType ?? 'image/jpeg',
    });
  }

  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: form as unknown as BodyInit,
    signal,
  });

  if (!res.ok) {
    const body = await res.text();
    const error = new Error(`HTTP ${res.status}: ${body}`) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  const body = res.body as
    | (ReadableStream<Uint8Array> & { getReader?: () => ReadableStreamDefaultReader<Uint8Array> })
    | null;

  if (body && typeof body.getReader === 'function') {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        if (signal?.aborted) {
          await reader.cancel().catch(() => undefined);
          const abortErr = new Error('Aborted') as Error & { name: string };
          abortErr.name = 'AbortError';
          throw abortErr;
        }
        const { value, done } = await reader.read();
        if (done) break;
        if (value) onToken(decoder.decode(value, { stream: true }));
      }
      const tail = decoder.decode();
      if (tail) onToken(tail);
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // already released
      }
    }
    return;
  }

  // Fallback for runtimes that can't stream the body.
  const text = await res.text();
  onToken(text);
}
