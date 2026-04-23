import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../utils/settings', () => ({
  loadSettings: jest.fn(() => ({ theme: 'light' })),
  saveSettings: jest.fn(),
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

  it('поиск работает по lastMessage', async () => {
    render(<Sidebar />);
    await userEvent.type(screen.getByPlaceholderText('Поиск...'), 'Привет');
    expect(screen.getByText('Первый чат')).toBeInTheDocument();
    expect(screen.queryByText('Второй чат')).not.toBeInTheDocument();
  });
});

describe('Sidebar – удаление', () => {
  it('при клике на кнопку удаления открывается диалог подтверждения', () => {
    render(<Sidebar />);
    const deleteBtns = screen.getAllByLabelText('Удалить чат');
    fireEvent.click(deleteBtns[0]);
    // Dialog показывает заголовок "Удалить чат?"
    expect(screen.getByText('Удалить чат?')).toBeInTheDocument();
  });

  it('при подтверждении в диалоге вызывается deleteChat', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getAllByLabelText('Удалить чат')[0]);
    // Нажимаем кнопку "Удалить" в Dialog
    fireEvent.click(screen.getByText('Удалить'));
    expect(mockDeleteChat).toHaveBeenCalledWith('chat-1');
  });

  it('при отмене в диалоге deleteChat не вызывается', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getAllByLabelText('Удалить чат')[0]);
    fireEvent.click(screen.getByText('Отмена'));
    expect(mockDeleteChat).not.toHaveBeenCalled();
  });
});

describe('Sidebar – переименование', () => {
  it('при клике на кнопку редактирования открывается диалог переименования', () => {
    render(<Sidebar />);
    const editBtns = screen.getAllByLabelText('Переименовать чат');
    fireEvent.click(editBtns[0]);
    expect(screen.getByText('Переименовать чат')).toBeInTheDocument();
  });

  it('при сохранении нового имени вызывается updateChat', () => {
    render(<Sidebar />);
    fireEvent.click(screen.getAllByLabelText('Переименовать чат')[0]);
    const input = screen.getByDisplayValue('Первый чат');
    fireEvent.change(input, { target: { value: 'Обновлённый чат' } });
    fireEvent.click(screen.getByText('Сохранить'));
    expect(mockUpdateChat).toHaveBeenCalledWith('chat-1', { name: 'Обновлённый чат' });
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
