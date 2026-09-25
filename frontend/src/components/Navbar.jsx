import React from 'react';

/**
 * Navbar Component
 * Displays role-specific navigation links and user status.
 */
export default function Navbar({ currentUser, currentRole, currentPage, onNavigate, onLogout }) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand / Logo */}
        <div 
          className="navbar-brand" 
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate(currentRole === 'founder' ? 'founder-dashboard' : 'user-dashboard')}
        >
          <div className="brand-icon">ST</div>
          <span>Startup Team Connect</span>
        </div>

        {/* Dynamic Navigation Links based on Role */}
        <nav className="navbar-links">
          {currentRole === 'user' ? (
            <>
              <button
                className={`nav-link ${currentPage === 'user-dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('user-dashboard')}
              >
                Home
              </button>
              <button
                className={`nav-link ${currentPage === 'startups' ? 'active' : ''}`}
                onClick={() => onNavigate('startups')}
              >
                Startups
              </button>
              <button
                className={`nav-link ${currentPage === 'my-applications' ? 'active' : ''}`}
                onClick={() => onNavigate('my-applications')}
              >
                My Applications
              </button>
              <button
                className={`nav-link ${currentPage === 'saved-startups' ? 'active' : ''}`}
                onClick={() => onNavigate('saved-startups')}
              >
                Saved
              </button>
              <button
                className={`nav-link ${currentPage === 'team' ? 'active' : ''}`}
                onClick={() => onNavigate('team')}
              >
                My Team
              </button>
              <button
                className={`nav-link ${currentPage === 'user-profile' ? 'active' : ''}`}
                onClick={() => onNavigate('user-profile')}
              >
                Profile
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-link ${currentPage === 'founder-dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('founder-dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${currentPage === 'create-startup' ? 'active' : ''}`}
                onClick={() => onNavigate('create-startup')}
              >
                + Create Startup
              </button>
              <button
                className={`nav-link ${currentPage === 'applications' ? 'active' : ''}`}
                onClick={() => onNavigate('applications')}
              >
                Applications
              </button>
              <button
                className={`nav-link ${currentPage === 'team' ? 'active' : ''}`}
                onClick={() => onNavigate('team')}
              >
                My Team
              </button>
              <button
                className={`nav-link ${currentPage === 'founder-profile' ? 'active' : ''}`}
                onClick={() => onNavigate('founder-profile')}
              >
                Profile
              </button>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="navbar-user">
          <div className="user-chip">
            <span>{currentUser?.name || (currentRole === 'founder' ? 'Founder' : 'User')}</span>
            <span className="role-pill">{currentRole}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
