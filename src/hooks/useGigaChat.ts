import { useCallback, useRef } from 'react';
import { sendChatRequest, GigaChatRequestBody } from '../api/chatApi';
import { parseSseEvents } from '../utils/sse';

export type ChatStreamCallback = (chunk: string) => void;

export const useGigaChat = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const sendMessage = async (body: GigaChatRequestBody, onChunk: ChatStreamCallback) => {
      stop();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await sendChatRequest(body, controller.signal);
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Не удалось получить поток ответа от сервера.');
        }

        let buffer = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const parsed = parseSseEvents(chunkText, buffer);
          buffer = parsed.remainder;

          for (const event of parsed.events) {
            if (event.data === '[DONE]') {
              return;
            }

            try {
              const data = JSON.parse(event.data);
              const delta = data.choices?.[0]?.delta;
              const message = data.choices?.[0]?.message;
              const content = delta?.content || message?.content;
              if (content) {
                onChunk(content);
              }
            } catch {
              // Не вызывать onChunk(event.data) — просто пропускаем служебные SSE-события
            }
          }
        }

        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            const content = data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content;
            if (content) {
              onChunk(content);
            }
          } catch {
            // ничего не делать — это не валидный JSON-chunk
          }
        }
      } else {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          onChunk(content);
        }
      }
    };

  return { sendMessage, stop };
};