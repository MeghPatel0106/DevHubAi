import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';

export default function AppLayout({ activePage, setActivePage, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main App Workspace */}
      <div className="main-wrapper">
        <TopBar
          activePage={activePage}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onQuickAction={(page) => setActivePage(page)}
        />

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
