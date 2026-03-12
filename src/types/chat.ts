export interface Chat {
  id: string;
  name: string;
  lastMessageDate: string;
  lastMessage: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
