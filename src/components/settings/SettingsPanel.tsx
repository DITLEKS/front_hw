import React, { useState, useEffect } from 'react';
import { Settings } from '../../types/settings';

const defaultSettings: Settings = {
  theme: 'light',
};

const SettingsPanel: React.FC = () => {
  const [model, setModel] = useState('GigaChat');
  const [temperature, setTemperature] = useState(1);
  const [topP, setTopP] = useState(1);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify({
      model,
      temperature,
      topP,
      maxTokens,
      systemPrompt,
      theme,
    }));
    console.log('save', {
      model,
      temperature,
      topP,
      maxTokens,
      systemPrompt,
      theme,
    });
  };

  const handleReset = () => {
    setModel('GigaChat');
    setTemperature(1);
    setTopP(1);
    setMaxTokens(1000);
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