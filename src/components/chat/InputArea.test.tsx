import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InputArea from './InputArea';

const noop = () => Promise.resolve();

describe('InputArea', () => {
  it('рендерится без ошибок', () => {
    render(<InputArea onSend={noop} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    expect(screen.getByPlaceholderText('Введите сообщение...')).toBeInTheDocument();
  });

  it('кнопка отправки disabled при пустом поле ввода', () => {
    render(<InputArea onSend={noop} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const btn = screen.getByLabelText('Отправить сообщение');
    expect(btn).toBeDisabled();
  });

  it('кнопка отправки активна при непустом вводе', async () => {
    render(<InputArea onSend={noop} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Привет');
    const btn = screen.getByLabelText('Отправить сообщение');
    expect(btn).not.toBeDisabled();
  });

  it('при клике на кнопку отправки вызывается onSend с текстом сообщения', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    render(<InputArea onSend={onSend} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Тестовое сообщение');
    await userEvent.click(screen.getByLabelText('Отправить сообщение'));
    expect(onSend).toHaveBeenCalledWith('Тестовое сообщение');
  });

  it('поле очищается после отправки', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    render(<InputArea onSend={onSend} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Текст');
    await userEvent.click(screen.getByLabelText('Отправить сообщение'));
    expect(textarea).toHaveValue('');
  });

  it('при нажатии Enter с непустым вводом вызывается onSend', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    render(<InputArea onSend={onSend} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Текст{Enter}');
    expect(onSend).toHaveBeenCalledWith('Текст');
  });

  it('Shift+Enter не отправляет, а добавляет перевод строки', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    render(<InputArea onSend={onSend} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Текст{Shift>}{Enter}{/Shift}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('в режиме isLoading показывается кнопка «Стоп»', () => {
    render(<InputArea onSend={noop} isLoading={true} onStop={noop} onAttachImage={jest.fn()} />);
    expect(screen.getByLabelText('Остановить генерацию')).toBeInTheDocument();
    expect(screen.queryByLabelText('Отправить сообщение')).not.toBeInTheDocument();
  });

  it('клик по «Стоп» вызывает onStop', async () => {
    const onStop = jest.fn();
    render(<InputArea onSend={noop} isLoading={true} onStop={onStop} onAttachImage={jest.fn()} />);
    await userEvent.click(screen.getByLabelText('Остановить генерацию'));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
