import React, { ChangeEvent } from 'react';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value = '', onChange }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(e.target.value);
  };

  return (
    <input
      className="search-input"
      type="text"
      placeholder="Поиск..."
      value={value}
      onChange={handleChange}
    />
  );
};

export default SearchInput;