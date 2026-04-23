import { chatReducer, initialState } from './chatReducer';
import { Chat } from '../types/chat';
import { Message } from '../types/message';

const makeChat = (overrides: Partial<Chat> = {}): Chat => ({
  id: 'chat-1',
  name: 'Test Chat',
  lastMessage: '',
  lastMessageDate: new Date().toISOString(),
  messages: [],
  ...overrides,
});

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  role: 'user',
  content: 'Hello',
  timestamp: new Date('2024-01-01T10:00:00').toISOString(),
  ...overrides,
});

// ADD_CHAT
describe('ADD_CHAT', () => {
  it('добавляет чат в начало массива chats', () => {
    const chat = makeChat();
    const state = chatReducer(initialState, { type: 'ADD_CHAT', payload: chat });
    expect(state.chats).toHaveLength(1);
    expect(state.chats[0]).toEqual(chat);
  });

  it('новый чат становится активным (activeChatId)', () => {
    const chat = makeChat({ id: 'new-chat' });
    const state = chatReducer(initialState, { type: 'ADD_CHAT', payload: chat });
    expect(state.activeChatId).toBe('new-chat');
  });

  it('новый чат добавляется в начало, а не в конец', () => {
    const existing = makeChat({ id: 'old' });
    const stateWithOne = chatReducer(initialState, {
      type: 'ADD_CHAT',
      payload: existing,
    });
    const newChat = makeChat({ id: 'new' });
    const finalState = chatReducer(stateWithOne, {
      type: 'ADD_CHAT',
      payload: newChat,
    });
    expect(finalState.chats[0].id).toBe('new');
    expect(finalState.chats[1].id).toBe('old');
  });
});

// ADD_MESSAGE
describe('ADD_MESSAGE', () => {
  it('увеличивает массив messages на 1', () => {
    const chat = makeChat({ id: 'chat-1' });
    const stateWithChat = chatReducer(initialState, {
      type: 'ADD_CHAT',
      payload: chat,
    });
    const message = makeMessage();
    const nextState = chatReducer(stateWithChat, {
      type: 'ADD_MESSAGE',
      payload: { chatId: 'chat-1', message },
    });
    expect(nextState.chats[0].messages).toHaveLength(1);
  });

  it('новое сообщение находится в конце массива', () => {
    const chat = makeChat({ id: 'chat-1', messages: [makeMessage({ id: 'msg-1' })] });
    const stateWithChat = chatReducer(initialState, { type: 'ADD_CHAT', payload: chat });
    const newMsg = makeMessage({ id: 'msg-2', content: 'World' });
    const nextState = chatReducer(stateWithChat, {
      type: 'ADD_MESSAGE',
      payload: { chatId: 'chat-1', message: newMsg },
    });
    const messages = nextState.chats[0].messages;
    expect(messages[messages.length - 1].id).toBe('msg-2');
  });

  it('обновляет lastMessage из content сообщения', () => {
    const chat = makeChat({ id: 'chat-1' });
    const stateWithChat = chatReducer(initialState, { type: 'ADD_CHAT', payload: chat });
    const message = makeMessage({ content: 'Привет, мир!' });
    const nextState = chatReducer(stateWithChat, {
      type: 'ADD_MESSAGE',
      payload: { chatId: 'chat-1', message },
    });
    expect(nextState.chats[0].lastMessage).toBe('Привет, мир!');
  });
});

// DELETE_CHAT
describe('DELETE_CHAT', () => {
  it('удаляет чат из массива chats', () => {
    const chat1 = makeChat({ id: 'chat-1' });
    const chat2 = makeChat({ id: 'chat-2' });
    let state = chatReducer(initialState, { type: 'ADD_CHAT', payload: chat1 });
    state = chatReducer(state, { type: 'ADD_CHAT', payload: chat2 });

    const nextState = chatReducer(state, { type: 'DELETE_CHAT', payload: 'chat-1' });
    expect(nextState.chats.find((c) => c.id === 'chat-1')).toBeUndefined();
    expect(nextState.chats).toHaveLength(1);
  });

  it('при удалении активного чата activeChatId сбрасывается в null', () => {
    const chat = makeChat({ id: 'chat-1' });
    const state = chatReducer(
      { ...initialState, chats: [chat], activeChatId: 'chat-1' },
      { type: 'DELETE_CHAT', payload: 'chat-1' }
    );
    expect(state.activeChatId).toBeNull();
  });

  it('при удалении неактивного чата activeChatId остаётся прежним', () => {
    const chat1 = makeChat({ id: 'chat-1' });
    const chat2 = makeChat({ id: 'chat-2' });
    const state = chatReducer(
      { ...initialState, chats: [chat1, chat2], activeChatId: 'chat-2' },
      { type: 'DELETE_CHAT', payload: 'chat-1' }
    );
    expect(state.activeChatId).toBe('chat-2');
  });
});

// UPDATE_CHAT (RENAME_CHAT)
describe('UPDATE_CHAT (rename)', () => {
  it('корректно обновляет название чата по id', () => {
    const chat = makeChat({ id: 'chat-1', name: 'Старое имя' });
    const state = chatReducer(
      { ...initialState, chats: [chat] },
      { type: 'UPDATE_CHAT', payload: { id: 'chat-1', updates: { name: 'Новое имя' } } }
    );
    expect(state.chats[0].name).toBe('Новое имя');
  });

  it('не изменяет другие чаты при переименовании', () => {
    const chat1 = makeChat({ id: 'chat-1', name: 'Один' });
    const chat2 = makeChat({ id: 'chat-2', name: 'Два' });
    const state = chatReducer(
      { ...initialState, chats: [chat1, chat2] },
      { type: 'UPDATE_CHAT', payload: { id: 'chat-1', updates: { name: 'Один (обновлён)' } } }
    );
    expect(state.chats[1].name).toBe('Два');
  });
});

// SET_ACTIVE_CHAT
describe('SET_ACTIVE_CHAT', () => {
  it('устанавливает activeChatId', () => {
    const state = chatReducer(initialState, { type: 'SET_ACTIVE_CHAT', payload: 'chat-42' });
    expect(state.activeChatId).toBe('chat-42');
  });

  it('позволяет сбросить activeChatId в null', () => {
    const state = chatReducer(
      { ...initialState, activeChatId: 'chat-1' },
      { type: 'SET_ACTIVE_CHAT', payload: null }
    );
    expect(state.activeChatId).toBeNull();
  });
});
