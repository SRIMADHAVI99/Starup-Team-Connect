import React from 'react';
import Navbar from './Navbar';
import Chatbot from './Chatbot';

/**
 * ProtectedLayout Component
 * Wraps dashboard views with top navigation bar and floating chatbot.
 */
export default function ProtectedLayout({ 
  children, 
  currentUser, 
  currentRole, 
  currentPage, 
  onNavigate, 
  onLogout,
  theme = 'light',
  onToggleTheme
}) {
  return (
    <div className="layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        currentUser={currentUser}
        currentRole={currentRole}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="container page-container" style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '20px 0', 
        background: 'var(--bg-card)', 
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        textAlign: 'center',
        transition: 'background-color 0.2s ease, border-color 0.2s ease'
      }}>
        <div className="container">
          Startup Team Connect &bull; Technical PBL Collaboration Platform
        </div>
      </footer>

      {/* Floating rule-based assistant */}
      <Chatbot />
    </div>
  );
}
