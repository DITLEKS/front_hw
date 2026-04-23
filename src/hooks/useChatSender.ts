import { useChatStore } from '../stores/chatStore';
import { Message } from '../types/message';
import { useGigaChat } from './useGigaChat';
import { loadSettings } from '../utils/settings';
import { GigaChatRequestMessage } from '../api/chatApi';
import { uploadFile } from '../api/fileApi';

interface AttachedImage {
  url: string;
  alt: string;
  mimeType: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const images: AttachedImage[] = !attachedImages
      ? []
      : Array.isArray(attachedImages)
        ? attachedImages
        : [attachedImages];

    const messagesBefore =
      useChatStore.getState().chats.find((c) => c.id === chatId)?.messages.length ?? 0;

    setLoading(true);

    let uploadedFileIds: string[] = [];

    if (images.length > 0) {
      try {
        for (const img of images) {
          const fileId = await uploadFile(img.url, img.mimeType);
          uploadedFileIds.push(fileId);
          await sleep(400);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Ошибка загрузки изображения';
        setError(errMsg);
        setLoading(false);
        return;
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      ...(images.length > 0
        ? {
            image: {
              url: images[0].url,
              alt: images[0].alt,
              mimeType: images[0].mimeType,
            },
            images: images.map((img) => ({
              url: img.url,
              alt: img.alt,
              mimeType: img.mimeType,
            })),
          }
        : {}),
    };

    addMessage(chatId, userMessage);

    const assistantMessageId = crypto.randomUUID();
    addMessage(chatId, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    });

    try {
      const settings = loadSettings();

      const allMessages =
        useChatStore.getState().chats.find((c) => c.id === chatId)?.messages || [];

      const historyMessages: GigaChatRequestMessage[] = allMessages
        .filter(
          (m) =>
            m.id !== assistantMessageId &&
            m.id !== userMessage.id &&
            typeof m.content === 'string' &&
            m.content.trim() !== ''
        )
        .map((m): GigaChatRequestMessage => ({
          role: m.role,
          content: m.content.trim(),
        }));

      const currentMessageForApi: GigaChatRequestMessage = {
        role: 'user',
        content: content.trim(),
        ...(uploadedFileIds.length > 0 ? { attachments: uploadedFileIds } : {}),
      };

      const messagesForAPI: GigaChatRequestMessage[] = [
        ...historyMessages,
        currentMessageForApi,
      ];

      if (settings.systemPrompt.trim()) {
        messagesForAPI.unshift({
          role: 'system',
          content: settings.systemPrompt.trim(),
        });
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
      updateMessage(
        chatId,
        assistantMessageId,
        'Извините, произошла ошибка при обработке вашего сообщения.'
      );
    } finally {
      setLoading(false);
    }
  };

  return { sendChatMessage, stop };
};