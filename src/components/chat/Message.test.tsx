import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Message from './Message';
import { Message as MessageType } from '../../types/message';

// Мокируем react-markdown и react-syntax-highlighter для изоляции теста
jest.mock('react-markdown', () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="markdown">{children}</div>
));
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <pre>{children}</pre>,
}));
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneDark: {},
}));

const makeMessage = (overrides: Partial<MessageType> = {}): MessageType => ({
  id: 'msg-1',
  role: 'user',
  content: 'Привет, мир!',
  timestamp: new Date('2024-01-01T10:00:00'),
  ...overrides,
});

describe('Message – variant="user"', () => {
  it('содержит текст сообщения', () => {
    render(<Message message={makeMessage({ content: 'Привет от пользователя' })} />);
    expect(screen.getByText('Привет от пользователя')).toBeInTheDocument();
  });

  it('содержит CSS-класс "user"', () => {
    const { container } = render(<Message message={makeMessage({ role: 'user' })} />);
    expect(container.firstChild).toHaveClass('user');
  });

  it('НЕ содержит CSS-класс "assistant"', () => {
    const { container } = render(<Message message={makeMessage({ role: 'user' })} />);
    expect(container.firstChild).not.toHaveClass('assistant');
  });

  it('показывает метку отправителя "Вы"', () => {
    render(<Message message={makeMessage({ role: 'user' })} />);
    expect(screen.getByText('Вы')).toBeInTheDocument();
  });

  it('НЕ содержит кнопку «Копировать»', () => {
    render(<Message message={makeMessage({ role: 'user' })} />);
    expect(screen.queryByLabelText('Copy message')).not.toBeInTheDocument();
  });
});

describe('Message – variant="assistant"', () => {
  it('содержит текст сообщения', () => {
    render(<Message message={makeMessage({ role: 'assistant', content: 'Ответ ассистента' })} />);
    expect(screen.getByText('Ответ ассистента')).toBeInTheDocument();
  });

  it('содержит CSS-класс "assistant"', () => {
    const { container } = render(
      <Message message={makeMessage({ role: 'assistant' })} />
    );
    expect(container.firstChild).toHaveClass('assistant');
  });

  it('НЕ содержит CSS-класс "user"', () => {
    const { container } = render(
      <Message message={makeMessage({ role: 'assistant' })} />
    );
    expect(container.firstChild).not.toHaveClass('user');
  });

  it('показывает метку отправителя "GigaChat"', () => {
    render(<Message message={makeMessage({ role: 'assistant' })} />);
    expect(screen.getByText('GigaChat')).toBeInTheDocument();
  });

  it('содержит кнопку «Копировать» (aria-label="Copy message")', () => {
    render(<Message message={makeMessage({ role: 'assistant' })} />);
    expect(screen.getByLabelText('Copy message')).toBeInTheDocument();
  });

  it('кнопка «Копировать» присутствует только у assistant, не у user', () => {
    const { rerender } = render(<Message message={makeMessage({ role: 'user' })} />);
    expect(screen.queryByLabelText('Copy message')).not.toBeInTheDocument();

    rerender(<Message message={makeMessage({ role: 'assistant' })} />);
    expect(screen.getByLabelText('Copy message')).toBeInTheDocument();
  });

  it('после клика на «Копировать» показывается «✅ Скопировано»', async () => {
    // Мок navigator.clipboard
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });

    render(<Message message={makeMessage({ role: 'assistant' })} />);
    const btn = screen.getByLabelText('Copy message');
    fireEvent.click(btn);
    // Ждём обновления состояния
    expect(await screen.findByText('✅ Скопировано')).toBeInTheDocument();
  });
});
