import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('../../api/chatApi', () => ({
  fetchModels: jest.fn(() => Promise.resolve(['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max'])),
}));

jest.mock('../../utils/settings', () => ({
  loadSettings: jest.fn(() => ({
    model: 'GigaChat',
    temperature: 1,
    topP: 1,
    maxTokens: 1000,
    repetitionPenalty: 1,
    systemPrompt: '',
    theme: 'light',
  })),
  saveSettings: jest.fn(),
}));

import SettingsPanel from './SettingsPanel';

const mockOnClose = jest.fn();

beforeEach(() => {
  mockOnClose.mockClear();
});

describe('SettingsPanel', () => {
  it('рендерится и отображает элементы управления', async () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    expect(screen.getByText('Температура')).toBeInTheDocument();
    expect(screen.getByText('Сохранить')).toBeInTheDocument();
    expect(screen.getByText('Сбросить')).toBeInTheDocument();
  });

  it('вызывает onClose при нажатии «Сохранить»', async () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    await userEvent.click(screen.getByText('Сохранить'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('после загрузки моделей отображает select с GigaChat', async () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    // Ждём загрузки списка моделей
    await waitFor(() => {
      expect(screen.getByDisplayValue('GigaChat')).toBeInTheDocument();
    });
  });

  it('смена модели обновляет select', async () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    await waitFor(() => screen.getByDisplayValue('GigaChat'));
    const select = screen.getByDisplayValue('GigaChat');
    await userEvent.selectOptions(select, 'GigaChat-Pro');
    expect(select).toHaveValue('GigaChat-Pro');
  });

  it('сброс возвращает модель к «GigaChat»', async () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    await waitFor(() => screen.getByDisplayValue('GigaChat'));
    const select = screen.getByDisplayValue('GigaChat');
    await userEvent.selectOptions(select, 'GigaChat-Pro');
    await userEvent.click(screen.getByText('Сбросить'));
    expect(select).toHaveValue('GigaChat');
  });
});