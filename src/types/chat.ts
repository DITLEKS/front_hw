import { Message } from './message';

export interface Chat {
  id: string;
  name: string;
  lastMessageDate: string;
  lastMessage: string;
  messages: Message[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

export type ChatAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: { id: string; updates: Partial<Chat> } }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
