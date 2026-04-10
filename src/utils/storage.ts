import { ChatState } from '../types/chat';

const STORAGE_KEY = 'chat-store';

export function saveState(state: Partial<ChatState>): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function loadState(): Partial<ChatState> | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized) as Partial<ChatState>;
  } catch (e) {
    console.error('Failed to load state', e);
    return null;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear state', e);
  }
}
