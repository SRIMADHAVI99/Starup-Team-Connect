import React from 'react';

/**
 * CustomModal Component
 * Replaces native browser alert() with a clean, professional, accessible modal dialog.
 */
export default function CustomModal({ isOpen, title, message, type = 'info', onClose, confirmText = 'OK' }) {
  if (!isOpen) return null;

  const iconMap = {
    warning: '⚠️',
    error: '❌',
    success: '✓',
    info: 'ℹ️'
  };

  const colorMap = {
    warning: '#F59E0B',
    error: '#DC2626',
    success: '#16A34A',
    info: '#2563EB'
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '440px',
          width: '100%',
          padding: '28px',
          textAlign: 'center',
          animation: 'fadeInUp 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            fontSize: '2.5rem',
            marginBottom: '12px',
            color: colorMap[type] || colorMap.info
          }}
        >
          {iconMap[type] || 'ℹ️'}
        </div>

        <h3 
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#1E1B4B',
            marginBottom: '8px'
          }}
        >
          {title}
        </h3>

        <p 
          style={{
            fontSize: '0.95rem',
            color: '#64748B',
            lineHeight: 1.5,
            marginBottom: '24px'
          }}
        >
          {message}
        </p>

        <button 
          className="btn btn-primary btn-full"
          style={{
            padding: '10px 20px',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
          onClick={onClose}
          autoFocus
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
