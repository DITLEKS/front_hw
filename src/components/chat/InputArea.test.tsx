import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InputArea from './InputArea';

const noop = () => Promise.resolve();

describe('InputArea', () => {
  // Базовый рендер
  it('рендерится без ошибок', () => {
    render(<InputArea onSend={noop} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    expect(screen.getByPlaceholderText('Введите сообщение...')).toBeInTheDocument();
  });

  // Кнопка «Отправить» заблокирована при пустом поле
  it('кнопка «Отправить» disabled при пустом поле ввода', () => {
    render(<InputArea onSend={noop} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const btn = screen.getByText('Отправить');
    expect(btn).toBeDisabled();
  });

  it('кнопка «Отправить» активна при непустом вводе', async () => {
    render(<InputArea onSend={noop} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Привет');
    const btn = screen.getByText('Отправить');
    expect(btn).not.toBeDisabled();
  });

  // Клик на кнопку «Отправить» вызывает onSend с текстом
  it('при клике на «Отправить» вызывается onSend с текстом сообщения', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    render(<InputArea onSend={onSend} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Тестовое сообщение');
    await userEvent.click(screen.getByText('Отправить'));
    expect(onSend).toHaveBeenCalledWith('Тестовое сообщение');
  });

  it('поле очищается после отправки', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined);
    render(<InputArea onSend={onSend} isLoading={false} onStop={noop} onAttachImage={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Введите сообщение...');
    await userEvent.type(textarea, 'Текст');
    await userEvent.click(screen.getByText('Отправить'));
    expect(textarea).toHaveValue('');
  });

  // Enter отправляет сообщение
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

  // Состояние загрузки
  it('в режиме isLoading показывается кнопка «Стоп»', () => {
    render(<InputArea onSend={noop} isLoading={true} onStop={noop} onAttachImage={jest.fn()} />);
    expect(screen.getByText('Стоп')).toBeInTheDocument();
    expect(screen.queryByText('Отправить')).not.toBeInTheDocument();
  });

  it('клик по «Стоп» вызывает onStop', async () => {
    const onStop = jest.fn();
    render(<InputArea onSend={noop} isLoading={true} onStop={onStop} onAttachImage={jest.fn()} />);
    await userEvent.click(screen.getByText('Стоп'));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
