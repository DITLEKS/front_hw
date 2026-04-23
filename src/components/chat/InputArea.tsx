import React, { useState, useRef, KeyboardEvent } from 'react';

interface AttachedImage {
  url: string;
  alt: string;
  mimeType: string;
}

interface InputAreaProps {
  onSend: (content: string) => Promise<void>;
  onAttachImage: (image: AttachedImage) => void;
  isLoading: boolean;
  onStop: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, onAttachImage, isLoading, onStop }) => {
  const [value, setValue] = useState('');
  const [imagePreviews, setImagePreviews] = useState<AttachedImage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    resizeTextarea();
  };

  const handleAttach = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const img: AttachedImage = { url: base64, alt: file.name, mimeType: file.type };
        setImagePreviews(prev => [...prev, img]);
        onAttachImage(img);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (value.trim() && !isLoading) {
      try {
        await onSend(value.trim());
        setValue('');
        setImagePreviews([]);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      } catch {
        // Ошибку обрабатывает родительский компонент ChatWindow
      }
    }
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="input-wrapper">
      <div className={`input-box${isLoading ? ' input-box--loading' : ''}`}>

        {/* Показываем превью изображений */}
        {imagePreviews.length > 0 && (
          <div className="input-box__previews">
            {imagePreviews.map((img, index) => (
              <div key={index} className="input-box__preview">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="input-box__preview-img"
                />
                <button
                  className="input-box__preview-remove"
                  onClick={() => handleRemoveImage(index)}
                  type="button"
                  aria-label={`Удалить ${img.alt}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Основное текстовое поле */}
        <textarea
          ref={textareaRef}
          className="input-box__textarea"
          rows={1}
          maxLength={2000}
          placeholder="Введите сообщение..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />

        {/* Панель кнопок и подсказок */}
        <div className="input-box__toolbar">
          <div className="input-box__toolbar-left">
            <button
              className="input-box__icon-btn"
              aria-label="Прикрепить изображение"
              disabled={isLoading}
              onClick={handleAttach}
              type="button"
              title="Прикрепить изображение"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
          </div>

          <div className="input-box__toolbar-right">
            {value.length > 0 && !isLoading && (
              <span className="input-box__hint">Shift+Enter — перенос строки</span>
            )}

            {isLoading ? (
              <button
                className="input-box__stop-btn"
                onClick={onStop}
                type="button"
                aria-label="Остановить генерацию"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                </svg>
                Стоп
              </button>
            ) : (
              <button
                className={`input-box__send-btn${canSend ? ' input-box__send-btn--active' : ''}`}
                disabled={!canSend}
                onClick={handleSend}
                type="button"
                aria-label="Отправить сообщение"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Можно выбрать сразу несколько файлов */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default InputArea;