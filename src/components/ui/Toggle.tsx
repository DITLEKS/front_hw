import React from 'react';

interface ToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ theme, onToggle }) => {
  return (
    <button className="theme-toggle" onClick={onToggle} type="button" aria-label="Toggle theme">
      {theme === 'light' ? '🌙 Тёмная тема' : '☀️ Светлая тема'}
    </button>
  );
};

export default Toggle;
