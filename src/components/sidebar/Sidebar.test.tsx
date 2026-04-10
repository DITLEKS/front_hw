import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Моки

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockCreateChat = jest.fn();
const mockUpdateChat = jest.fn();
const mockDeleteChat = jest.fn();
const mockSetActiveChat = jest.fn();

const MOCK_CHATS = [
  { id: 'chat-1', name: 'Первый чат',  lastMessage: 'Привет', lastMessageDate: '2024-01-01', messages: [] },
  { id: 'chat-2', name: 'Второй чат',  lastMessage: 'Пока',   lastMessageDate: '2024-01-02', messages: [] },
  { id: 'chat-3', name: 'Рабочий чат', lastMessage: 'OK',     lastMessageDate: '2024-01-03', messages: [] },
];

jest.mock('../../stores/chatStore', () => ({
  useChatStore: () => ({
    chats: MOCK_CHATS,
    activeChatId: null,
    createChat: mockCreateChat,
    updateChat: mockUpdateChat,
    deleteChat: mockDeleteChat,
    setActiveChat: mockSetActiveChat,
  }),
}));

import Sidebar from './Sidebar';


beforeEach(() => {
  mockCreateChat.mockReturnValue('new-chat-id');
  mockNavigate.mockReset();
  mockDeleteChat.mockReset();
  mockUpdateChat.mockReset();
  mockSetActiveChat.mockReset();
  window.confirm = jest.fn(() => true);
  window.prompt  = jest.fn(() => 'Новое имя');
});

describe('Sidebar – рендер', () => {
  it('отображает все чаты по умолчанию', () => {
    render(<Sidebar />);
    expect(screen.getByText('Первый чат')).toBeInTheDocument();
    expect(screen.getByText('Второй чат')).toBeInTheDocument();
    expect(screen.getByText('Рабочий чат')).toBeInTheDocument();
  });

  it('содержит поле поиска и кнопку «+ Новый чат»', () => {
    render(<Sidebar />);
    expect(screen.getByPlaceholderText('Поиск...')).toBeInTheDocument();
    expect(screen.getByText('+ Новый чат')).toBeInTheDocument();
  });
});

describe('Sidebar – поиск', () => {
  it('при вводе текста фильтрует список чатов по названию', async () => {
    render(<Sidebar />);
    await userEvent.type(screen.getByPlaceholderText('Поиск...'), 'Рабочий');
    expect(screen.getByText('Рабочий чат')).toBeInTheDocument();
    expect(screen.queryByText('Первый чат')).not.toBeInTheDocument();
    expect(screen.queryByText('Второй чат')).not.toBeInTheDocument();
  });

  it('поиск регистронезависимый', async () => {
    render(<Sidebar />);
    await userEvent.type(screen.getByPlaceholderText('Поиск...'), 'первый');
    expect(screen.getByText('Первый чат')).toBeInTheDocument();
    expect(screen.queryByText('Второй чат')).not.toBeInTheDocument();
  });

  it('при пустом запросе отображаются все чаты', async () => {
    render(<Sidebar />);
    const input = screen.getByPlaceholderText('Поиск...');
    await userEvent.type(input, 'abc');
    await userEvent.clear(input);
    expect(screen.getByText('Первый чат')).toBeInTheDocument();
    expect(screen.getByText('Второй чат')).toBeInTheDocument();
    expect(screen.getByText('Рабочий чат')).toBeInTheDocument();
  });

  it('при запросе без совпадений список пуст', async () => {
    render(<Sidebar />);
    await userEvent.type(screen.getByPlaceholderText('Поиск...'), 'xyzНеСуществует');
    expect(screen.queryByText('Первый чат')).not.toBeInTheDocument();
    expect(screen.queryByText('Второй чат')).not.toBeInTheDocument();
    expect(screen.queryByText('Рабочий чат')).not.toBeInTheDocument();
  });

  it('поиск также работает по lastMessage', async () => {
    render(<Sidebar />);
    await userEvent.type(screen.getByPlaceholderText('Поиск...'), 'Привет');
    expect(screen.getByText('Первый чат')).toBeInTheDocument();
    expect(screen.queryByText('Второй чат')).not.toBeInTheDocument();
  });
});

describe('Sidebar – удаление', () => {
  it('при клике на «Удалить» появляется window.confirm', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getAllByLabelText('Delete chat')[0]);
    expect(window.confirm).toHaveBeenCalledWith('Удалить чат?');
  });

  it('при подтверждении вызывается deleteChat', () => {
    window.confirm = jest.fn(() => true);
    render(<Sidebar />);
    fireEvent.click(screen.getAllByLabelText('Delete chat')[0]);
    expect(mockDeleteChat).toHaveBeenCalled();
  });

  it('при отмене deleteChat не вызывается', () => {
    window.confirm = jest.fn(() => false);
    render(<Sidebar />);
    fireEvent.click(screen.getAllByLabelText('Delete chat')[0]);
    expect(mockDeleteChat).not.toHaveBeenCalled();
  });
});

describe('Sidebar – создание чата', () => {
  it('при клике «+ Новый чат» вызывается createChat и navigate', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByText('+ Новый чат'));
    expect(mockCreateChat).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/chat/new-chat-id');
  });
});
