import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../../config/supabase';
import { useChatBotStore } from '../store/chatBotStore';
import { streamChat, MAX_PROMPT_LENGTH } from '../api/chatBotClient';
import { makeId } from '../lib/ids';
import type { ChatAttachment, ChatMessage } from '../types';

const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 700;

// Stable empty reference so the selector below doesn't return a fresh array each
// render (which would thrash re-renders / trip the "uncached snapshot" warning).
const EMPTY: ChatMessage[] = [];

/** 4xx and explicit aborts won't succeed on retry; everything else might. */
function isRetriable(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const e = err as { name?: string; status?: number };
    if (e.name === 'AbortError') return false;
    if (typeof e.status === 'number' && e.status >= 400 && e.status < 500) return false;
  }
  return true;
}

/**
 * Owns a single Plantini conversation: exposes the message list and the actions
 * to send (with streaming), cancel, and clear. All backend access goes through
 * `streamChat`; all persistence through `useChatBotStore`.
 */
export function useChatBot(initialChatId?: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // A chatId generated once per hook instance, used only until the store has one.
  const generatedIdRef = useRef<string | undefined>(undefined);
  if (!generatedIdRef.current) generatedIdRef.current = makeId();

  const storeChatId = useChatBotStore((s) => s.currentChatId);
  const chatId = initialChatId ?? storeChatId ?? generatedIdRef.current!;

  const messages = useChatBotStore((s) => s.messagesByChat[chatId] ?? EMPTY);

  // Always read the freshest session token (covers silent refreshes).
  const getToken = useCallback(
    () => supabase.auth.getSession().then(({ data }) => data.session?.access_token ?? null),
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    try {
      useChatBotStore.getState().setCurrentChatId(chatId);
    } catch {
      // persisting the active chat id is best-effort
    }
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [chatId]);

  const sendMessage = useCallback(
    async (rawText: string, attachments?: ChatAttachment[]) => {
      const text = rawText?.trim() ?? '';
      if (!text && !(attachments && attachments.length)) return;
      if (text.length > MAX_PROMPT_LENGTH) {
        setError(`El mensaje no puede exceder ${MAX_PROMPT_LENGTH} caracteres.`);
        Alert.alert('Mensaje demasiado largo', `Máximo ${MAX_PROMPT_LENGTH} caracteres.`);
        return;
      }

      setError(null);
      const store = useChatBotStore.getState();

      store.addMessage(chatId, {
        id: makeId(),
        role: 'user',
        text,
        createdAt: Date.now(),
        attachments: attachments?.length ? attachments : undefined,
      });

      setIsStreaming(true);
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      // The assistant message is created lazily on the first token so a typing
      // indicator can show in the gap before the stream starts.
      let assistantId: string | null = null;
      let accumulated = '';

      const pushToken = (chunk: string) => {
        if (!mountedRef.current) return;
        accumulated += chunk;
        if (!assistantId) {
          assistantId = makeId();
          useChatBotStore.getState().addMessage(chatId, {
            id: assistantId,
            role: 'assistant',
            text: accumulated,
            createdAt: Date.now(),
          });
        } else {
          useChatBotStore.getState().updateMessage(chatId, assistantId, { text: accumulated });
        }
      };

      const dropAssistant = () => {
        if (assistantId) {
          useChatBotStore.getState().removeMessage(chatId, assistantId);
          assistantId = null;
        }
        accumulated = '';
      };

      try {
        const token = await getToken();
        let lastError: unknown = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            dropAssistant(); // reset any partial output from a failed attempt
            await streamChat({
              chatId,
              prompt: text,
              attachments,
              token,
              signal: controller.signal,
              onToken: pushToken,
            });
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            if (!isRetriable(err) || attempt >= MAX_RETRIES) throw err;
            const delay = BASE_RETRY_DELAY_MS * 2 ** attempt;
            await new Promise<void>((resolve, reject) => {
              const timer = setTimeout(resolve, delay);
              controller.signal.addEventListener(
                'abort',
                () => {
                  clearTimeout(timer);
                  const abortErr = new Error('Aborted') as Error & { name: string };
                  abortErr.name = 'AbortError';
                  reject(abortErr);
                },
                { once: true },
              );
            });
          }
        }

        if (lastError && !accumulated) throw lastError;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // Keep partial output; if nothing arrived, leave a short note.
          if (!assistantId) {
            useChatBotStore.getState().addMessage(chatId, {
              id: makeId(),
              role: 'assistant',
              text: 'Respuesta cancelada.',
              createdAt: Date.now(),
            });
          } else if (!accumulated) {
            useChatBotStore.getState().updateMessage(chatId, assistantId, {
              text: 'Respuesta cancelada.',
            });
          }
        } else {
          dropAssistant();
          if (mountedRef.current) {
            setError(String(err?.message ?? 'Error al comunicarse con Plantini'));
            Alert.alert('Error', 'No se pudo conectar con Plantini. Puedes reintentar.');
          }
        }
      } finally {
        if (mountedRef.current) setIsStreaming(false);
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [chatId, getToken],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const clearChat = useCallback(() => {
    useChatBotStore.getState().clearChat(chatId);
  }, [chatId]);

  return { chatId, messages, isStreaming, error, sendMessage, cancel, clearError, clearChat };
}
