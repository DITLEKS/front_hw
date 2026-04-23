import React, { useState, lazy, Suspense } from 'react';

// Загружаем Sidebar только при первом открытии
const Sidebar = lazy(() => import('../sidebar/Sidebar'));

const SidebarLoader = () => (
  <div className="sidebar-loader">
    <div className="sidebar-loader__item" />
    <div className="sidebar-loader__item" />
    <div className="sidebar-loader__item" />
  </div>
);

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="app-layout">
      <button
        className="burger"
        type="button"
        aria-label="Открыть меню"
        onClick={() => setSidebarVisible((v) => !v)}
      >
        ☰
      </button>
      <aside className={`sidebar-container ${sidebarVisible ? 'open' : ''}`}>
        <Suspense fallback={<SidebarLoader />}>
          <Sidebar />
        </Suspense>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
};

export default AppLayout;
