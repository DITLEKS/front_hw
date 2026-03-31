import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, ChatState } from '../types/chat';
import { Message } from '../types/message';

interface ChatStore extends ChatState {
  createChat: () => string;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  setActiveChat: (id: string | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  generateChatName: (chatId: string) => void;
}

const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  isLoading: false,
  error: null,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createChat: () => {
        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          name: 'Новый чат',
          lastMessageDate: new Date().toISOString(),
          lastMessage: '',
          messages: [],
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
        }));
        return newChat.id;
      },

      updateChat: (id, updates) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, ...updates } : chat
          ),
        })),

      deleteChat: (id) =>
        set((state) => {
          const newChats = state.chats.filter((chat) => chat.id !== id);
          const newActiveId = state.activeChatId === id ? null : state.activeChatId;
          return {
            chats: newChats,
            activeChatId: newActiveId,
          };
        }),

      setActiveChat: (id) => set({ activeChatId: id }),

      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  lastMessage: message.content.slice(0, 50),
                  lastMessageDate: message.timestamp.toISOString(),
                }
              : chat
          ),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      generateChatName: (chatId) => {
        const state = get();
        const chat = state.chats.find((c) => c.id === chatId);
        if (chat && chat.messages.length > 0) {
          const firstUserMessage = chat.messages.find((m) => m.role === 'user');
          if (firstUserMessage) {
            const name = firstUserMessage.content.slice(0, 40);
            get().updateChat(chatId, { name: name || 'Новый чат' });
          }
        }
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        chats: state.chats,
        activeChatId: state.activeChatId,
      }),
    }
  )
);