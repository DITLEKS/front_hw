import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="app-layout">
      <button
        className="burger"
        onClick={() => setSidebarVisible((v) => !v)}
      >
        ☰
      </button>
      <aside className={`sidebar-container ${sidebarVisible ? 'open' : ''}`}>
        <Sidebar />
      </aside>
      <main className="content">{children}</main>
    </div>
  );
};

export default AppLayout;