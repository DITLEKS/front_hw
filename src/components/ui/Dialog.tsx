import React from 'react';

interface DialogProps {
  isOpen: boolean;
  title: string;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">{title}</h3>
        {children && <div className="dialog-body">{children}</div>}
        <div className="dialog-actions">
          <button className="dialog-btn cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`dialog-btn confirm${danger ? ' danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
