import React from 'react';

/**
 * LoginTabs Component
 * Provides a clean role-switcher between USER and FOUNDER
 * along with clear role purpose descriptions.
 */
export default function LoginTabs({ activeRole, onRoleChange }) {
  return (
    <div className="login-tabs-container">
      {/* Role Selection Switcher */}
      <div className="role-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeRole === 'user'}
          className={`role-tab-btn ${activeRole === 'user' ? 'active' : ''}`}
          onClick={() => onRoleChange('user')}
        >
          <span>👤</span> User
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeRole === 'founder'}
          className={`role-tab-btn ${activeRole === 'founder' ? 'active' : ''}`}
          onClick={() => onRoleChange('founder')}
        >
          <span>🚀</span> Founder
        </button>
      </div>

      {/* Role Tagline Description */}
      <div className="role-tagline">
        {activeRole === 'user' ? (
          <div>
            <strong>User Account:</strong> Find startup opportunities, showcase your skills, and join ambitious teams.
          </div>
        ) : (
          <div>
            <strong>Founder Account:</strong> Post your startup idea, review applicants, and build your dream team with skilled people.
          </div>
        )}
      </div>
    </div>
  );
}
