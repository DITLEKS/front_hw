import React, { useState, useRef, KeyboardEvent } from 'react';

interface InputAreaProps {
  onSend: (content: string) => Promise<void>;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleSend = async () => {
    if (value.trim() && !isLoading) {
      await onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        rows={1}
        maxLength={2000}
        placeholder="Введите сообщение..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{ resize: 'none', overflow: 'hidden' }}
        disabled={isLoading}
      />
      <div className="controls">
        <button className="attach" aria-label="Attach image" disabled={isLoading}>
          📎
        </button>
        <button className="stop" disabled>
          Остановить
        </button>
        <button className="send" disabled={!value.trim() || isLoading} onClick={handleSend}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default InputArea;