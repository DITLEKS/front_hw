import React, { useState, useEffect, useCallback } from 'react';
import { loadSettings, saveSettings } from '../../utils/settings';
import { Settings } from '../../types/settings';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<Settings>({
    model: 'GigaChat',
    temperature: 1,
    topP: 1,
    maxTokens: 1000,
    repetitionPenalty: 1,
    systemPrompt: '',
    theme: 'light',
  });

  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(loadedSettings.theme);
  }, []);

  const handleSave = useCallback(() => {
    saveSettings(settings);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(settings.theme);
    console.log('Настройки сохранены:', settings);
    onClose();
  }, [settings, onClose]);

  const handleReset = useCallback(() => {
    const defaultSettings: Settings = {
      model: 'GigaChat',
      temperature: 1,
      topP: 1,
      maxTokens: 1000,
      repetitionPenalty: 1,
      systemPrompt: '',
      theme: 'light',
    };
    setSettings(defaultSettings);
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="settings-panel">
      <h3>Настройки</h3>
      <label>
        Модель:
        <select value={settings.model} onChange={(e) => updateSetting('model', e.target.value)}>
          <option>GigaChat</option>
          <option>GigaChat-Plus</option>
          <option>GigaChat-Pro</option>
          <option>GigaChat-Max</option>
        </select>
      </label>
      <label>
        Температура: {settings.temperature.toFixed(2)}
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={settings.temperature}
          onChange={(e) => updateSetting('temperature', +e.target.value)}
        />
      </label>
      <label>
        Top-P: {settings.topP.toFixed(2)}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.topP}
          onChange={(e) => updateSetting('topP', +e.target.value)}
        />
      </label>
      <label>
        Repetition penalty: {settings.repetitionPenalty.toFixed(2)}
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.01}
          value={settings.repetitionPenalty}
          onChange={(e) => updateSetting('repetitionPenalty', +e.target.value)}
        />
      </label>
      <label>
        Макс. токенов:
        <input
          type="number"
          min="1"
          max="8192"
          value={settings.maxTokens}
          onChange={(e) => updateSetting('maxTokens', Math.max(1, Math.min(8192, +e.target.value)))}
          aria-label="Максимальное количество токенов"
        />
      </label>
      <label>
        Системный промпт:
        <textarea
          value={settings.systemPrompt}
          onChange={(e) => updateSetting('systemPrompt', e.target.value)}
          placeholder="Введите системный промпт..."
          aria-label="Системный промпт"
        />
      </label>
      <label>
        Тема:
        <select value={settings.theme} onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark')} aria-label="Выбор темы">
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
        </select>
      </label>
      <div className="buttons">
        <button onClick={handleSave}>Сохранить</button>
        <button onClick={handleReset}>Сбросить</button>
      </div>
    </div>
  );
};

export default SettingsPanel;