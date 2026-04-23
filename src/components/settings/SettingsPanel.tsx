import React, { useState, useEffect } from 'react';
import { loadSettings, saveSettings, Settings } from '../../utils/settings';

const SettingsPanel: React.FC = () => {
  const [model, setModel] = useState('GigaChat');
  const [temperature, setTemperature] = useState(1);
  const [topP, setTopP] = useState(1);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [repetitionPenalty, setRepetitionPenalty] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const settings = loadSettings();
    setModel(settings.model);
    setTemperature(settings.temperature);
    setTopP(settings.topP);
    setMaxTokens(settings.maxTokens);
    setRepetitionPenalty(settings.repetitionPenalty);
    setSystemPrompt(settings.systemPrompt);
    setTheme(settings.theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(settings.theme);
  }, []);

  const handleSave = () => {
    const settings: Settings = {
      model,
      temperature,
      topP,
      maxTokens,
      repetitionPenalty,
      systemPrompt,
      theme,
    };
    saveSettings(settings);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    console.log('Настройки сохранены:', settings);
  };

  const handleReset = () => {
    setModel('GigaChat');
    setTemperature(1);
    setTopP(1);
    setMaxTokens(1000);
    setRepetitionPenalty(1);
    setSystemPrompt('');
    setTheme('light');
  };

  return (
    <div className="settings-panel">
      <h3>Настройки</h3>
      <label>
        Модель:
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option>GigaChat</option>
          <option>GigaChat-Plus</option>
          <option>GigaChat-Pro</option>
          <option>GigaChat-Max</option>
        </select>
      </label>
      <label>
        Температура: {temperature.toFixed(2)}
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={temperature}
          onChange={(e) => setTemperature(+e.target.value)}
        />
      </label>
      <label>
        Top-P: {topP.toFixed(2)}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={topP}
          onChange={(e) => setTopP(+e.target.value)}
        />
      </label>
      <label>
        Repetition penalty: {repetitionPenalty.toFixed(2)}
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.01}
          value={repetitionPenalty}
          onChange={(e) => setRepetitionPenalty(+e.target.value)}
        />
      </label>
      <label>
        Макс. токенов:
        <input
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(+e.target.value)}
        />
      </label>
      <label>
        Системный промпт:
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
      </label>
      <label>
        Тема:
        <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
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