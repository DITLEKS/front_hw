import React, { useState, useRef, KeyboardEvent } from 'react';

const InputArea: React.FC = () => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        console.log('send', value);
        setValue('');
      }
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
      />
      <div className="controls">
        <button className="attach" aria-label="Attach image">
          📎
        </button>
        <button className="stop" disabled>
          Остановить
        </button>
        <button className="send" disabled={!value.trim()}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default InputArea;