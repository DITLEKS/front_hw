import { Chat, ChatState, ChatAction } from '../types/chat';
import { Message } from '../types/message';

export const initialState: ChatState = {
  chats: [],
  activeChatId: null,
  isLoading: false,
  error: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };

    case 'ADD_CHAT':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        activeChatId: action.payload.id,
      };

    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.id
            ? { ...chat, ...action.payload.updates }
            : chat
        ),
      };

    case 'DELETE_CHAT': {
      const newChats = state.chats.filter((chat) => chat.id !== action.payload);
      const newActiveId =
        state.activeChatId === action.payload ? null : state.activeChatId;
      return { ...state, chats: newChats, activeChatId: newActiveId };
    }

    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChatId: action.payload };

    case 'ADD_MESSAGE':
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: [...chat.messages, action.payload.message],
                lastMessage: action.payload.message.content.slice(0, 50),
                lastMessageDate: action.payload.message.timestamp,
              }
            : chat
        ),
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}
