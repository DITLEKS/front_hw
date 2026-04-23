export interface MessageImage {
  url: string;
  alt?: string;
  mimeType?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  image?: MessageImage;
  images?: MessageImage[];
}