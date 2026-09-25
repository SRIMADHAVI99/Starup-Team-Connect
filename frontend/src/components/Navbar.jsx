import React, { useState } from 'react';
import StartupTeamLogo from './StartupTeamLogo';

/**
 * Navbar Component
 * Displays role-specific navigation links, theme toggle, and user status.
 */
export default function Navbar({ 
  currentUser, 
  currentRole, 
  currentPage, 
  onNavigate, 
  onLogout,
  theme = 'light',
  onToggleTheme
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  const handleNavClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand / Logo */}
        <div 
          className="navbar-brand" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => handleNavClick(currentRole === 'founder' ? 'founder-dashboard' : 'user-dashboard')}
        >
          <StartupTeamLogo size={28} isDark={isDark} />
        </div>

        {/* Dynamic Navigation Links based on Role */}
        <nav className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {currentRole === 'user' ? (
            <>
              <button
                className={`nav-link ${currentPage === 'user-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('user-dashboard')}
              >
                Home
              </button>
              <button
                className={`nav-link ${currentPage === 'startups' ? 'active' : ''}`}
                onClick={() => handleNavClick('startups')}
              >
                Startups
              </button>
              <button
                className={`nav-link ${currentPage === 'my-applications' ? 'active' : ''}`}
                onClick={() => handleNavClick('my-applications')}
              >
                My Applications
              </button>
              <button
                className={`nav-link ${currentPage === 'saved-startups' ? 'active' : ''}`}
                onClick={() => handleNavClick('saved-startups')}
              >
                Saved
              </button>
              <button
                className={`nav-link ${currentPage === 'team' ? 'active' : ''}`}
                onClick={() => handleNavClick('team')}
              >
                My Team
              </button>
              <button
                className={`nav-link ${currentPage === 'user-profile' ? 'active' : ''}`}
                onClick={() => handleNavClick('user-profile')}
              >
                Profile
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-link ${currentPage === 'founder-dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('founder-dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${currentPage === 'create-startup' ? 'active' : ''}`}
                onClick={() => handleNavClick('create-startup')}
              >
                + Create Startup
              </button>
              <button
                className={`nav-link ${currentPage === 'applications' ? 'active' : ''}`}
                onClick={() => handleNavClick('applications')}
              >
                Applications
              </button>
              <button
                className={`nav-link ${currentPage === 'team' ? 'active' : ''}`}
                onClick={() => handleNavClick('team')}
              >
                My Team
              </button>
              <button
                className={`nav-link ${currentPage === 'founder-profile' ? 'active' : ''}`}
                onClick={() => handleNavClick('founder-profile')}
              >
                Profile
              </button>
            </>
          )}
        </nav>

        {/* Right Section: Theme Toggle, User Info & Logout */}
        <div className="navbar-user">
          <button 
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? '☀' : '☾'}
          </button>

          <div className="user-chip">
            <span>{currentUser?.name || (currentRole === 'founder' ? 'Founder' : 'User')}</span>
            <span className="role-pill">{currentRole}</span>
          </div>

          <button className="btn btn-outline btn-sm" onClick={onLogout}>
            Logout
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
