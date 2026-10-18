import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '../types';

interface ChatBotState {
  messagesByChat: Record<string, ChatMessage[]>;
  currentChatId?: string;
  setCurrentChatId: (id: string) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  replaceMessages: (chatId: string, messages: ChatMessage[]) => void;
  updateMessage: (chatId: string, id: string, patch: Partial<ChatMessage>) => void;
  removeMessage: (chatId: string, id: string) => void;
  clearChat: (chatId: string) => void;
}

/**
 * Local chat history, persisted with AsyncStorage. Independent from the old
 * `chat_store_v1` (new key) so the two never collide during the migration.
 */
export const useChatBotStore = create<ChatBotState>()(
  persist(
    (set) => ({
      messagesByChat: {},
      currentChatId: undefined,
      setCurrentChatId: (id) => set({ currentChatId: id }),
      addMessage: (chatId, message) =>
        set((state) => ({
          messagesByChat: {
            ...state.messagesByChat,
            [chatId]: [...(state.messagesByChat[chatId] ?? []), message],
          },
        })),
      replaceMessages: (chatId, messages) =>
        set((state) => ({
          messagesByChat: { ...state.messagesByChat, [chatId]: messages },
        })),
      updateMessage: (chatId, id, patch) =>
        set((state) => {
          const list = state.messagesByChat[chatId] ?? [];
          return {
            messagesByChat: {
              ...state.messagesByChat,
              [chatId]: list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
            },
          };
        }),
      removeMessage: (chatId, id) =>
        set((state) => {
          const list = state.messagesByChat[chatId] ?? [];
          return {
            messagesByChat: {
              ...state.messagesByChat,
              [chatId]: list.filter((m) => m.id !== id),
            },
          };
        }),
      clearChat: (chatId) =>
        set((state) => ({
          messagesByChat: { ...state.messagesByChat, [chatId]: [] },
        })),
    }),
    {
      name: 'chatbot_store_v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
