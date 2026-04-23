import { Settings } from '../types/settings';

const STORAGE_KEY = 'settings';

export const defaultSettings: Settings = {
  model: 'GigaChat',
  temperature: 1,
  topP: 1,
  maxTokens: 1000,
  repetitionPenalty: 1,
  systemPrompt: '',
  theme: 'light',
};

const parseNumber = (value: unknown, fallback: number) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

export const loadSettings = (): Settings => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...defaultSettings,
      ...parsed,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      temperature: parseNumber(parsed.temperature, defaultSettings.temperature),
      topP: parseNumber(parsed.topP, defaultSettings.topP),
      maxTokens: parseNumber(parsed.maxTokens, defaultSettings.maxTokens),
      repetitionPenalty: parseNumber(parsed.repetitionPenalty, defaultSettings.repetitionPenalty),
      systemPrompt: parsed.systemPrompt || defaultSettings.systemPrompt,
    };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  return settings;
};