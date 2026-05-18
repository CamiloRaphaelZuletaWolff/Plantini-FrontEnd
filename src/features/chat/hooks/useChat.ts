import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { makeId } from '../utils/uuid';
import ChatApi, { MAX_PROMPT_LENGTH } from '../services/chatApi';
import { useChatStore } from '../store/chatStore';
import type { ChatFile, Message } from '../types/Message';
import { supabase } from '../../../../config/supabase';

const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 700;
// Avoid retrying client-side errors (4xx) — they will not become 2xx on retry.
const isRetriableError = (err: unknown): boolean => {
  if (err && typeof err === 'object') {
    const e = err as { name?: string; status?: number };
    if (e.name === 'AbortError') return false;
    if (typeof e.status === 'number' && e.status >= 400 && e.status < 500) return false;
  }
  return true;
};

export function useChat(initialChatId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const store = useChatStore();

  const chatId = initialChatId ?? store.currentChatId ?? makeId();

  // Always fetches the current session token so the request uses the latest
  // access token (even after a silent refresh).
  const getToken = useCallback(
    () =>
      supabase.auth
        .getSession()
        .then(({ data }) => data.session?.access_token ?? null),
    []
  );

  const api = useMemo(() => new ChatApi(chatId, getToken), [chatId, getToken]);

  useEffect(() => {
    mountedRef.current = true;
    try {
      if (chatId) store.setCurrentChatId(chatId);
    } catch {
      // Persist failures are non-fatal; the in-memory store still works.
    }
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [chatId]);

  const sendMessage = useCallback(
    async (content: string, files?: ChatFile[]) => {
      const trimmed = content?.trim() ?? '';
      if (!trimmed && !files?.length) return;
      if (trimmed.length > MAX_PROMPT_LENGTH) {
        setError(`El mensaje no puede exceder ${MAX_PROMPT_LENGTH} caracteres.`);
        Alert.alert('Mensaje demasiado largo', `Máximo ${MAX_PROMPT_LENGTH} caracteres.`);
        return;
      }

      setError(null);

      // Unique placeholder ID per request so concurrent streams cannot collide
      // when, e.g., a fast user sends a second message before the first
      // response finishes.
      const placeholderId = `pending-${makeId()}`;

      const userMsg: Message = {
        id: makeId(),
        content: trimmed,
        role: 'user',
        timestamp: Date.now(),
        files: files?.map((f) => ({
          name: f.name ?? 'image.jpg',
          uri: f.uri,
          type: f.type ?? 'image/jpeg',
          size: f.size,
        })),
      };
      store.addMessage(chatId, userMsg);

      setIsLoading(true);
      setIsWriting(true);

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      let accumulated = '';
      const placeholderTimestamp = Date.now();

      try {
        let lastError: unknown = null;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            // Reset accumulation between retries so we don't repeat content.
            accumulated = '';
            await api.sendMessageStream(
              trimmed,
              files,
              controller.signal,
              (chunk) => {
                if (!mountedRef.current) return;
                accumulated += chunk;
                const interim: Message = {
                  id: placeholderId,
                  content: accumulated,
                  role: 'model',
                  timestamp: placeholderTimestamp,
                };
                const existing = store.chats[chatId] ?? [];
                const idx = existing.findIndex((m) => m.id === placeholderId);
                if (idx >= 0) {
                  const copy = [...existing];
                  copy[idx] = interim;
                  store.setMessages(chatId, copy);
                } else {
                  store.addMessage(chatId, interim);
                }
              }
            );
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            if (!isRetriableError(err)) throw err;
            if (attempt >= MAX_RETRIES) throw err;
            const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
            await new Promise<void>((resolve, reject) => {
              const t = setTimeout(resolve, delay);
              controller.signal.addEventListener(
                'abort',
                () => {
                  clearTimeout(t);
                  const abortErr = new Error('Aborted') as Error & { name: string };
                  abortErr.name = 'AbortError';
                  reject(abortErr);
                },
                { once: true }
              );
            });
          }
        }
        if (lastError && !accumulated) throw lastError;

        // Replace placeholder with the final message.
        const final: Message = {
          id: makeId(),
          content: accumulated,
          role: 'model',
          timestamp: placeholderTimestamp,
        };
        const current = store.chats[chatId] ?? [];
        const filtered = current.filter((m) => m.id !== placeholderId);
        store.setMessages(chatId, [...filtered, final]);
      } catch (err: any) {
        // Drop the placeholder regardless of outcome.
        const current = store.chats[chatId] ?? [];
        const filtered = current.filter((m) => m.id !== placeholderId);

        if (err?.name === 'AbortError') {
          const abortMsg: Message = {
            id: makeId(),
            content: 'Respuesta cancelada.',
            role: 'model',
            timestamp: Date.now(),
          };
          store.setMessages(chatId, [...filtered, abortMsg]);
        } else {
          store.setMessages(chatId, filtered);
          if (mountedRef.current) {
            const msg = String(err?.message ?? 'Error al comunicarse con Plantini');
            setError(msg);
            Alert.alert('Error', 'No se pudo conectar con Plantini. Puedes reintentar.');
          }
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          setIsWriting(false);
        }
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
    [api, store, chatId]
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    chatId,
    messages: store.chats[chatId] ?? [],
    isLoading,
    isWriting,
    error,
    sendMessage,
    cancel,
    clearError,
    setCurrentChatId: store.setCurrentChatId,
    clearChat: store.clearChat,
  };
}
