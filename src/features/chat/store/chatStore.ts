import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Message } from '../types/Message';

interface ChatState {
  chats: Record<string, Message[]>;
  currentChatId?: string;
  isLoading: boolean;
  error?: string | null;
  setCurrentChatId: (id: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  clearChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: {},
      currentChatId: undefined,
      isLoading: false,
      error: null,
      setCurrentChatId: (id: string) => set({ currentChatId: id }),
      addMessage: (chatId: string, message: Message) =>
        set((state) => ({
          chats: { ...state.chats, [chatId]: [...(state.chats[chatId] ?? []), message] },
        })),
      setMessages: (chatId: string, messages: Message[]) =>
        set((state) => ({ chats: { ...state.chats, [chatId]: messages } })),
      clearChat: (chatId: string) => set((state) => ({ chats: { ...state.chats, [chatId]: [] } })),
      deleteChat: (chatId: string) => set((state) => {
        const next = { ...state.chats };
        delete next[chatId];
        return { chats: next };
      }),
    }),
    {
      name: 'chat_store_v1',
      getStorage: () => AsyncStorage,
    }
  )
);
