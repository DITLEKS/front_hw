import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, ChatState } from '../types/chat';
import { Message } from '../types/message';
import { chatReducer, initialState } from './chatReducer';

interface ChatStore extends ChatState {
  createChat: () => string;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  setActiveChat: (id: string | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  generateChatName: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createChat: () => {
        const newChat: Chat = {
          id: crypto.randomUUID(),
          name: 'Новый чат',
          lastMessageDate: new Date().toISOString(),
          lastMessage: '',
          messages: [],
        };
        set((state) => chatReducer(state, { type: 'ADD_CHAT', payload: newChat }));
        return newChat.id;
      },

      updateChat: (id, updates) =>
        set((state) => chatReducer(state, { type: 'UPDATE_CHAT', payload: { id, updates } })),

      deleteChat: (id) =>
        set((state) => chatReducer(state, { type: 'DELETE_CHAT', payload: id })),

      setActiveChat: (id) =>
        set((state) => chatReducer(state, { type: 'SET_ACTIVE_CHAT', payload: id })),

      addMessage: (chatId, message) =>
        set((state) => chatReducer(state, { type: 'ADD_MESSAGE', payload: { chatId, message } })),

      updateMessage: (chatId, messageId, content) =>
        set((state) => chatReducer(state, { type: 'UPDATE_MESSAGE', payload: { chatId, messageId, content } })),

      setLoading: (loading) =>
        set((state) => chatReducer(state, { type: 'SET_LOADING', payload: loading })),

      setError: (error) =>
        set((state) => chatReducer(state, { type: 'SET_ERROR', payload: error })),

      generateChatName: (chatId) => {
        const chat = get().chats.find((c) => c.id === chatId);
        if (chat && chat.messages.length > 0) {
          const firstUserMessage = chat.messages.find((m) => m.role === 'user');
          if (firstUserMessage) {
            const name = firstUserMessage.content.slice(0, 40).trim() || 'Новый чат';
            set((state) => chatReducer(state, { type: 'UPDATE_CHAT', payload: { id: chatId, updates: { name } } }));
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