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
  onLogout 
}) {
  return (
    <div className="layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        currentUser={currentUser}
        currentRole={currentRole}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="container page-container" style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{ 
        borderTop: '1px solid var(--border-light)', 
        padding: '20px 0', 
        background: 'var(--card-white)', 
        color: 'var(--secondary-text)',
        fontSize: '0.85rem',
        textAlign: 'center'
      }}>
        <div className="container">
          Startup Team Connect &bull; Semester Project Prototype &bull; Java Spring Boot & MySQL + React
        </div>
      </footer>

      {/* Floating rule-based assistant */}
      <Chatbot />
    </div>
  );
}
