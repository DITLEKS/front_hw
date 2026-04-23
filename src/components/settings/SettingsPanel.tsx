import React, { useState, useEffect, useCallback } from 'react';
import { loadSettings, saveSettings } from '../../utils/settings';
import { Settings } from '../../types/settings';
import { fetchModels } from '../../api/chatApi';

interface SettingsPanelProps {
  onClose: () => void;
}

const FALLBACK_MODELS = ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max'];

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
  const [models, setModels] = useState<string[]>(FALLBACK_MODELS);
  const [modelsLoading, setModelsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
  }, []);

  useEffect(() => {
    fetchModels()
      .then(setModels)
      .catch(() => setModels(FALLBACK_MODELS))
      .finally(() => setModelsLoading(false));
  }, []);

  const handleSave = useCallback(() => {
    saveSettings(settings);
    onClose();
  }, [settings, onClose]);

  const handleReset = useCallback(() => {
    setSettings({
      model: 'GigaChat',
      temperature: 1,
      topP: 1,
      maxTokens: 1000,
      repetitionPenalty: 1,
      systemPrompt: '',
      theme: loadSettings().theme,
    });
  }, []);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="settings-panel">
      <div className="settings-panel__group">
        <label className="settings-panel__label">Модель</label>
        <select
          className="settings-panel__select"
          value={settings.model}
          onChange={(e) => update('model', e.target.value)}
          disabled={modelsLoading}
        >
          {modelsLoading
            ? <option>Загрузка...</option>
            : models.map(m => <option key={m} value={m}>{m}</option>)
          }
        </select>
      </div>

      <div className="settings-panel__group">
        <div className="settings-panel__row">
          <label className="settings-panel__label">Температура</label>
          <span className="settings-panel__value">{settings.temperature.toFixed(2)}</span>
        </div>
        <input type="range" min={0} max={2} step={0.01} value={settings.temperature}
          onChange={(e) => update('temperature', +e.target.value)} />
      </div>

      <div className="settings-panel__group">
        <div className="settings-panel__row">
          <label className="settings-panel__label">Top-P</label>
          <span className="settings-panel__value">{settings.topP.toFixed(2)}</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={settings.topP}
          onChange={(e) => update('topP', +e.target.value)} />
      </div>

      <div className="settings-panel__group">
        <div className="settings-panel__row">
          <label className="settings-panel__label">Repetition penalty</label>
          <span className="settings-panel__value">{settings.repetitionPenalty.toFixed(2)}</span>
        </div>
        <input type="range" min={0.1} max={2} step={0.01} value={settings.repetitionPenalty}
          onChange={(e) => update('repetitionPenalty', +e.target.value)} />
      </div>

      <div className="settings-panel__group">
        <label className="settings-panel__label">Макс. токенов</label>
        <input
          className="settings-panel__input"
          type="number" min="1" max="8192"
          value={settings.maxTokens}
          onChange={(e) => update('maxTokens', Math.max(1, Math.min(8192, +e.target.value)))}
        />
      </div>

      <div className="settings-panel__group">
        <label className="settings-panel__label">Системный промпт</label>
        <textarea
          className="settings-panel__textarea"
          value={settings.systemPrompt}
          onChange={(e) => update('systemPrompt', e.target.value)}
          placeholder="Введите системный промпт..."
          rows={3}
        />
      </div>

      <div className="settings-panel__actions">
        <button className="settings-panel__btn settings-panel__btn--primary" onClick={handleSave}>
          Сохранить
        </button>
        <button className="settings-panel__btn settings-panel__btn--ghost" onClick={handleReset}>
          Сбросить
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;