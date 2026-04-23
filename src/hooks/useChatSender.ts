import { useChatStore } from '../stores/chatStore';
import { Message } from '../types/message';
import { useGigaChat } from './useGigaChat';
import { loadSettings } from '../utils/settings';

interface AttachedImage {
  url: string;
  alt: string;
  mimeType: string;
}

export const useChatSender = () => {
  const { addMessage, updateMessage, setLoading, setError, generateChatName } = useChatStore();
  const { sendMessage, stop } = useGigaChat();

  const sendChatMessage = async (
    chatId: string,
    content: string,
    attachedImages?: AttachedImage | AttachedImage[]
  ) => {
    if (!chatId) return;
    setError(null);

    // Нормализуем к массиву
    const images: AttachedImage[] = !attachedImages
      ? []
      : Array.isArray(attachedImages)
        ? attachedImages
        : [attachedImages];

    const messagesBefore = useChatStore.getState().chats.find(c => c.id === chatId)?.messages.length ?? 0;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      ...(images.length > 0 ? {
        image: {
          url: images[0].url,
          alt: images[0].alt,
          mimeType: images[0].mimeType,
        },
        images: images.map(img => ({
          url: img.url,
          alt: img.alt,
          mimeType: img.mimeType,
        })),
      } : {}),
    };
    addMessage(chatId, userMessage);
    setLoading(true);

    const assistantMessageId = `msg-${Date.now() + 1}`;
    addMessage(chatId, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    });

    try {
      const settings = loadSettings();

      const allMessages = useChatStore.getState().chats.find(c => c.id === chatId)?.messages || [];
      const messagesForAPI = allMessages
        .filter(m => m.id !== assistantMessageId && m.content !== '')
        .flatMap((message) => {
          const imgs: AttachedImage[] = (message as any).images ?? (message.image ? [message.image] : []);

          if (imgs.length > 1) {
            return [
              ...imgs.map(img => ({
                role: message.role,
                content: {
                  type: 'image' as const,
                  mime_type: img.mimeType || 'image/png',
                  alt: img.alt || 'image',
                  data: img.url,
                },
              })),
              { role: message.role, content: message.content },
            ];
          }

          if (imgs.length === 1) {
            return [{
              role: message.role,
              content: {
                type: 'image' as const,
                mime_type: imgs[0].mimeType || 'image/png',
                alt: imgs[0].alt || 'image',
                data: imgs[0].url,
              },
            }];
          }

          return [{ role: message.role, content: message.content }];
        });

      if (settings.systemPrompt.trim()) {
        messagesForAPI.unshift({ role: 'system', content: settings.systemPrompt });
      }

      let assistantContent = '';
      await sendMessage(
        {
          model: settings.model,
          messages: messagesForAPI,
          temperature: settings.temperature,
          top_p: settings.topP,
          max_tokens: settings.maxTokens,
          repetition_penalty: settings.repetitionPenalty,
          stream: true,
        },
        (chunk) => {
          assistantContent += chunk;
          updateMessage(chatId, assistantMessageId, assistantContent);
        }
      );

      if (messagesBefore === 0) {
        generateChatName(chatId);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(errMsg);
      updateMessage(chatId, assistantMessageId, 'Извините, произошла ошибка при обработке вашего сообщения.');
    } finally {
      setLoading(false);
    }
  };

  return { sendChatMessage, stop };
};