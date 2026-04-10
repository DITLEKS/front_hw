import { saveState, loadState, clearState } from './storage';

const STORAGE_KEY = 'chat-store';

let store: Record<string, string> = {};

beforeEach(() => {
  store = {};
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key: string) => store[key] ?? null
  );
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => { store[key] = value; }
  );
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(
    (key: string) => { delete store[key]; }
  );
  jest.spyOn(Storage.prototype, 'clear').mockImplementation(
    () => { store = {}; }
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('saveState', () => {
  it('сохраняет данные под ключом chat-store', () => {
    const data = { chats: [], activeChatId: null };
    saveState(data);
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(data));
  });

  it('корректно сериализует непустые данные', () => {
    const data = {
      chats: [{ id: 'c1', name: 'Chat 1', lastMessage: 'Hi', lastMessageDate: '2024-01-01', messages: [] }],
      activeChatId: 'c1',
    };
    saveState(data);
    const stored = (localStorage.setItem as jest.Mock).mock.calls[0][1];
    expect(JSON.parse(stored)).toEqual(data);
  });

  it('после saveState данные доступны через loadState', () => {
    const data = { chats: [], activeChatId: 'c1' };
    saveState(data);
    expect(loadState()).toEqual(data);
  });
});

describe('loadState', () => {
  it('возвращает null, если ключ отсутствует', () => {
    expect(loadState()).toBeNull();
  });

  it('восстанавливает данные из localStorage', () => {
    const data = { chats: [], activeChatId: 'c1' };
    store[STORAGE_KEY] = JSON.stringify(data);
    expect(loadState()).toEqual(data);
  });

  it('возвращает null при невалидном JSON — не падает', () => {
    store[STORAGE_KEY] = '{broken json:::';
    expect(() => loadState()).not.toThrow();
    expect(loadState()).toBeNull();
  });

  it('возвращает null при пустой строке — не падает', () => {
    store[STORAGE_KEY] = '';
    expect(() => loadState()).not.toThrow();
  });
});

describe('clearState', () => {
  it('удаляет ключ из localStorage', () => {
    store[STORAGE_KEY] = JSON.stringify({ chats: [] });
    clearState();
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(loadState()).toBeNull();
  });
});
