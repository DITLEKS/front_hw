import { useChatStore } from '../stores/chatStore';
import { Message } from '../types/message';
import { useGigaChat } from './useGigaChat';
import { loadSettings } from '../utils/settings';

export const useChatSender = () => {
  const { addMessage, updateMessage, setLoading, setError, generateChatName } = useChatStore();
  const { sendMessage, stop } = useGigaChat();

  const sendChatMessage = async (chatId: string, content: string, attachedImage?: { url: string; alt: string; mimeType: string }) => {
    if (!chatId) return;
    setError(null);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      ...(attachedImage ? {
        image: {
          url: attachedImage.url,
          alt: attachedImage.alt,
          mimeType: attachedImage.mimeType,
        },
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
      const messages = useChatStore.getState().chats.find(c => c.id === chatId)?.messages || [];
      const messagesForAPI = [...messages, userMessage].map((message) => {
        if (message.image) {
          return {
            role: message.role,
            content: {
              type: 'image' as const,
              mime_type: message.image.mimeType || 'image/png',
              alt: message.image.alt || 'image',
              data: message.image.url,
            },
          };
        }
        return {
          role: message.role,
          content: message.content,
        };
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

      if (messages.length === 0) {
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