import React, { useState, useRef, KeyboardEvent } from 'react';

interface InputAreaProps {
  onSend: (content: string) => Promise<void>;
  onAttachImage: (image: { url: string; alt: string; mimeType: string }) => void;
  isLoading: boolean;
  onStop: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, onAttachImage, isLoading, onStop }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const markdown = `![${file.name}](${base64})`;
      setValue((prev) => `${prev}${prev ? '\n\n' : ''}${markdown}`);
      onAttachImage({ url: base64, alt: file.name, mimeType: file.type });
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (value.trim() && !isLoading) {
      try {
        await onSend(value.trim());
        setValue('');
      } catch (error) {
        // Ошибка уже обработана выше
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
        disabled={isLoading}
      />
      <div className="controls">
        <label htmlFor="file-input">
          <button className="attach" aria-label="Attach image" disabled={isLoading} type="button">
            📎
          </button>
        </label>
        <input
          id="file-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {isLoading ? (
          <button className="stop" onClick={onStop} type="button">
            Стоп
          </button>
        ) : (
          <button
            className="send"
            disabled={!value.trim() || isLoading}
            onClick={handleSend}
            type="button"
          >
            Отправить
          </button>
        )}
      </div>
    </div>
  );
};

export default InputArea;