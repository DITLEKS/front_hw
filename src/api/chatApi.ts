export interface ImageContent {
  type: 'image';
  mime_type: string;
  alt: string;
  data: string;
}

export interface GigaChatRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ImageContent;
}

export interface GigaChatRequestBody {
  model: string;
  messages: GigaChatRequestMessage[];
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty?: number;
  stream: boolean;
}

export interface GigaChatResponseChoice {
  message: {
    role: string;
    content: string;
  };
}

export interface GigaChatResponse {
  choices: GigaChatResponseChoice[];
}

export const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

export const sendChatRequest = async (body: GigaChatRequestBody, signal?: AbortSignal, retries = 3): Promise<Response> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify(body),
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Запрос к GigaChat завершился с ошибкой: ${response.status} ${response.statusText}: ${text}`);
      }

      return response;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Не удалось выполнить запрос после всех попыток');
};