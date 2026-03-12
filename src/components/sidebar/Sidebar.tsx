import React, { useState } from 'react';
import SearchInput from './SearchInput';
import ChatList from './ChatList';

const Sidebar: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="sidebar">
      <button
        className="new-chat"
        onClick={() => console.log('create new chat')}
      >
        + Новый чат
      </button>
      <SearchInput value={search} onChange={setSearch} />
      <ChatList />
    </div>
  );
};

export default Sidebar;