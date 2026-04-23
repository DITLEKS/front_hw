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

// Вспомогательная функция — безопасная комбинация AbortSignal
function combineSignals(signals: AbortSignal[]): AbortSignal {
  if (typeof (AbortSignal as any).any === 'function') {
    return (AbortSignal as any).any(signals) as AbortSignal;
  }
  // Fallback для старых браузеров: используем первый сигнал (обычно пользовательский)
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}

export const sendChatRequest = async (
  body: GigaChatRequestBody,
  signal?: AbortSignal,
  retries = 3
): Promise<Response> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeoutSignal = AbortSignal.timeout(30000);
      const combinedSignal = signal
        ? combineSignals([signal, timeoutSignal])
        : timeoutSignal;

      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify(body),
        signal: combinedSignal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Запрос к GigaChat завершился с ошибкой: ${response.status} ${response.statusText}: ${text}`
        );
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Не удалось выполнить запрос после всех попыток');
};

export const fetchModels = async (): Promise<string[]> => {
  const response = await fetch(`${apiBaseUrl}/api/models`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Не удалось получить список моделей: ${response.status}`);
  }

  const data = await response.json();
  // GigaChat возвращает { data: [{ id: 'GigaChat', object: 'model', ... }] }
  return data.data?.map((m: { id: string }) => m.id) ?? [];
};