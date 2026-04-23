import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Message from './Message';
import { Message as MessageType } from '../../types/message';

// Заменяем внешние модули на простые мок-версии
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
  timestamp: new Date('2024-01-01T10:00:00').toISOString(),
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
    expect(screen.queryByLabelText('Скопировать сообщение')).not.toBeInTheDocument();
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

  it('содержит кнопку «Копировать» (aria-label="Скопировать сообщение")', () => {
    render(<Message message={makeMessage({ role: 'assistant' })} />);
    expect(screen.getByLabelText('Скопировать сообщение')).toBeInTheDocument();
  });

  it('кнопка «Копировать» присутствует только у assistant, не у user', () => {
    const { rerender } = render(<Message message={makeMessage({ role: 'user' })} />);
    expect(screen.queryByLabelText('Скопировать сообщение')).not.toBeInTheDocument();

    rerender(<Message message={makeMessage({ role: 'assistant' })} />);
    expect(screen.getByLabelText('Скопировать сообщение')).toBeInTheDocument();
  });

  it('после клика на «Копировать» показывается «✅ Скопировано»', async () => {
    // Подменяем буфер обмена для теста
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });

    render(<Message message={makeMessage({ role: 'assistant' })} />);
    const btn = screen.getByLabelText('Скопировать сообщение');
    fireEvent.click(btn);
    // Ждём, пока появится надпись о копировании
    expect(await screen.findByText('✅ Скопировано')).toBeInTheDocument();
  });
});
