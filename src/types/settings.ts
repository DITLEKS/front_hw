export interface Settings {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  repetitionPenalty: number;
  systemPrompt: string;
  theme: 'light' | 'dark';
}
