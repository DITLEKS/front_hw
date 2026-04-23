import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPanel from './SettingsPanel';

const mockOnClose = jest.fn();

describe('SettingsPanel', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders settings form', () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Модель:')).toBeInTheDocument();
    expect(screen.getByText('Сохранить')).toBeInTheDocument();
  });

  it('calls onClose when save button is clicked', async () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    const saveButton = screen.getByText('Сохранить');
    await userEvent.click(saveButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates model selection', async () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    const select = screen.getByDisplayValue('GigaChat');
    await userEvent.selectOptions(select, 'GigaChat-Pro');
    expect(select).toHaveValue('GigaChat-Pro');
  });

  it('resets settings on reset button click', async () => {
    render(<SettingsPanel onClose={mockOnClose} />);
    const resetButton = screen.getByText('Сбросить');
    await userEvent.click(resetButton);
    const select = screen.getByDisplayValue('GigaChat');
    expect(select).toHaveValue('GigaChat');
  });
});