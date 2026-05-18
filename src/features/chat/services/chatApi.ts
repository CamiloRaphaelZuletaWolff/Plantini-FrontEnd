import { makeId } from '../utils/uuid';
import GEMINI_BASE_URL from '../../../config/gemini';
import type { ChatFile } from '../types/Message';

const BASE_URL = GEMINI_BASE_URL;

const MAX_PROMPT_LENGTH = 8000;

export type ChunkHandler = (chunk: string) => void;

/** Returns the current Supabase access token, or null if not signed in. */
export type TokenGetter = () => Promise<string | null>;

/**
 * React Native's `FormData` accepts a `{ uri, type, name }` blob descriptor
 * for file uploads — a shape that the DOM lib types don't model. This type
 * documents what we're actually appending and centralises the unavoidable
 * cast to `any` at the FormData boundary.
 */
type RNFileBlobDescriptor = {
  uri: string;
  type: string;
  name: string;
};

function toRNBlob(file: ChatFile, fallbackName: string, fallbackMime: string): RNFileBlobDescriptor {
  return {
    uri: file.uri,
    name: file.name ?? fallbackName,
    type: file.type ?? fallbackMime,
  };
}

export default class ChatApi {
  readonly chatId: string;
  private readonly getToken: TokenGetter;

  constructor(chatId?: string, getToken?: TokenGetter) {
    this.chatId = chatId ?? makeId();
    this.getToken = getToken ?? (() => Promise.resolve(null));
  }

  /** Builds the Authorization header for a single request. */
  private async authHeader(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async sendMessageStream(
    prompt: string,
    files: ChatFile[] | undefined,
    signal: AbortSignal | undefined,
    onChunk?: ChunkHandler
  ): Promise<void> {
    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(`El mensaje supera el límite de ${MAX_PROMPT_LENGTH} caracteres.`);
    }

    const url = `${BASE_URL}/api/gemini/chat-stream`;
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('chatId', this.chatId);

    files?.forEach((f) => {
      // React Native FormData accepts the file blob descriptor object; the
      // DOM `Blob` types don't represent this shape, hence the cast.
      form.append('files', toRNBlob(f, 'image.jpg', 'image/jpeg') as unknown as Blob);
    });

    const headers = await this.authHeader();
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

    // Streaming path: pump chunks as they arrive, bailing out the moment the
    // caller aborts so we don't keep draining a cancelled stream.
    const body = res.body as (ReadableStream<Uint8Array> & { getReader?: () => ReadableStreamDefaultReader<Uint8Array> }) | null;
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
          if (value) onChunk?.(decoder.decode(value, { stream: true }));
        }
        // Flush any remaining buffered bytes.
        const tail = decoder.decode();
        if (tail) onChunk?.(tail);
      } finally {
        try {
          reader.releaseLock();
        } catch {
          // already released
        }
      }
      return;
    }

    // Fallback when the response cannot be streamed (e.g. polyfills).
    const text = await res.text();
    if (onChunk) onChunk(text);
  }

  async sendBasicPrompt(prompt: string, files?: ChatFile[]) {
    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(`El mensaje supera el límite de ${MAX_PROMPT_LENGTH} caracteres.`);
    }

    const url = `${BASE_URL}/api/gemini/basic-prompt`;
    const form = new FormData();
    form.append('prompt', prompt);
    files?.forEach((f) => {
      form.append('files', toRNBlob(f, 'file', 'application/octet-stream') as unknown as Blob);
    });

    const headers = await this.authHeader();
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: form as unknown as BodyInit,
    });

    if (!res.ok) {
      const body = await res.text();
      const error = new Error(`HTTP ${res.status}: ${body}`) as Error & { status?: number };
      error.status = res.status;
      throw error;
    }
    return res.json();
  }
}

export { MAX_PROMPT_LENGTH };
