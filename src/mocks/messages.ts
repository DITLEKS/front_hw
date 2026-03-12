import { ChatMessage } from '../types/chat';

export const messages: ChatMessage[] = [
  { id: 'm1', role: 'assistant', content: 'Привет! **Чем** могу помочь сегодня?' },
  { id: 'm2', role: 'user', content: 'Хочу узнать больше о новой функции.' },
  { id: 'm3', role: 'assistant', content: 'Конечно! Вот список:\n- Функция A\n- Функция B\n- Функция C' },
  { id: 'm4', role: 'user', content: 'Отлично, спасибо! Можешь показать код?' },
  { id: 'm5', role: 'assistant', content: '```js\nconsole.log("Привет, мир");\n```' },
  { id: 'm6', role: 'user', content: 'Выглядит круто 👍' },
];