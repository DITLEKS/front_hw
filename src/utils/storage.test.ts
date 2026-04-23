import { loadSettings, saveSettings, defaultSettings } from './settings';
import { Settings } from '../types/settings';

const STORAGE_KEY = 'settings';

beforeEach(() => {
  localStorage.clear();
});

describe('saveSettings / loadSettings', () => {
  it('сохраняет и восстанавливает настройки из localStorage', () => {
    const s: Settings = { ...defaultSettings, model: 'GigaChat-Pro', temperature: 0.5 };
    saveSettings(s);
    const loaded = loadSettings();
    expect(loaded.model).toBe('GigaChat-Pro');
    expect(loaded.temperature).toBe(0.5);
  });

  it('возвращает defaultSettings если localStorage пуст', () => {
    const loaded = loadSettings();
    expect(loaded).toEqual(defaultSettings);
  });

  it('не падает при битых данных в localStorage (невалидный JSON)', () => {
    localStorage.setItem(STORAGE_KEY, '{INVALID JSON}}}');
    expect(() => loadSettings()).not.toThrow();
    const loaded = loadSettings();
    expect(loaded).toEqual(defaultSettings);
  });

  it('корректно обрабатывает отсутствие отдельных полей (использует fallback)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ model: 'GigaChat-Max' }));
    const loaded = loadSettings();
    expect(loaded.model).toBe('GigaChat-Max');
    expect(loaded.temperature).toBe(defaultSettings.temperature);
    expect(loaded.maxTokens).toBe(defaultSettings.maxTokens);
  });
});