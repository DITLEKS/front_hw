import React, { useState, useRef, KeyboardEvent } from 'react';

interface InputAreaProps {
  onSend: (content: string) => Promise<void>;
  onAttachImage: (image: { url: string; alt: string; mimeType: string }) => void;
  isLoading: boolean;
  onStop: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, onAttachImage, isLoading, onStop }) => {
  const [value, setValue] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    resizeTextarea();
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
      setImagePreview(base64);
      onAttachImage({ url: base64, alt: file.name, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleSend = async () => {
    if (value.trim() && !isLoading) {
      try {
        await onSend(value.trim());
        setValue('');
        setImagePreview(null);
      } catch {
        // ошибка обрабатывается в ChatWindow
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
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="preview" className="image-preview__img" />
          <button
            className="image-preview__remove"
            onClick={handleRemoveImage}
            type="button"
            aria-label="Удалить изображение"
          >
            ×
          </button>
        </div>
      )}
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="controls">
        <button
          className="attach"
          aria-label="Прикрепить изображение"
          disabled={isLoading}
          onClick={handleAttach}
          type="button"
        >
          📎
        </button>
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