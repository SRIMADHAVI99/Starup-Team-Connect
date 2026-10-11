import { renderStartupTeamLogo } from './logo.js';

/**
 * Navbar Component (Vanilla JS)
 * Role-based navigation bar, theme toggle, user status chip, and mobile menu.
 */
export function renderNavbar({ currentUser, currentRole, currentPage, theme = 'light' }) {
  const isDark = theme === 'dark';
  const userName = currentUser?.name || (currentRole === 'founder' ? 'Founder' : 'User');

  return `
    <header class="navbar">
      <div class="container navbar-inner">
        <div class="navbar-brand" id="navbar-brand" style="cursor:pointer;display:flex;align-items:center;">
          ${renderStartupTeamLogo({ size: 28, showText: true, isDark })}
        </div>

        <nav class="navbar-links" id="navbar-links">
          ${currentRole === 'user' ? `
            <button class="nav-link ${currentPage === 'user-dashboard' ? 'active' : ''}" data-nav="user-dashboard">
              Home
            </button>
            <button class="nav-link ${currentPage === 'startups' ? 'active' : ''}" data-nav="startups">
              Startups
            </button>
            <button class="nav-link ${currentPage === 'my-applications' ? 'active' : ''}" data-nav="my-applications">
              My Applications
            </button>
            <button class="nav-link ${currentPage === 'saved-startups' ? 'active' : ''}" data-nav="saved-startups">
              Saved
            </button>
            <button class="nav-link ${currentPage === 'team' ? 'active' : ''}" data-nav="team">
              My Team
            </button>
            <button class="nav-link ${currentPage === 'user-profile' ? 'active' : ''}" data-nav="user-profile">
              Profile
            </button>
          ` : `
            <button class="nav-link ${currentPage === 'founder-dashboard' ? 'active' : ''}" data-nav="founder-dashboard">
              Dashboard
            </button>
            <button class="nav-link ${currentPage === 'create-startup' ? 'active' : ''}" data-nav="create-startup">
              + Create Startup
            </button>
            <button class="nav-link ${currentPage === 'applications' ? 'active' : ''}" data-nav="applications">
              Applications
            </button>
            <button class="nav-link ${currentPage === 'team' ? 'active' : ''}" data-nav="team">
              My Team
            </button>
            <button class="nav-link ${currentPage === 'founder-profile' ? 'active' : ''}" data-nav="founder-profile">
              Profile
            </button>
          `}
        </nav>

        <div class="navbar-user">
          <button 
            id="theme-toggle-btn"
            class="theme-toggle-btn"
            title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}"
          >
            ${isDark ? '☀' : '☾'}
          </button>

          <div class="user-chip">
            <span>${userName}</span>
            <span class="role-pill">${currentRole}</span>
          </div>

          <button id="logout-btn" class="btn btn-outline btn-sm">
            Logout
          </button>

          <button id="mobile-menu-btn" class="mobile-menu-btn" aria-label="Toggle menu">
            ☰
          </button>
        </div>
      </div>
    </header>
  `;
}

export function initNavbarEvents({ onNavigate, onLogout, onToggleTheme, currentRole }) {
  const brand = document.getElementById('navbar-brand');
  if (brand) {
    brand.onclick = () => {
      onNavigate(currentRole === 'founder' ? 'founder-dashboard' : 'user-dashboard');
    };
  }

  const linksNav = document.getElementById('navbar-links');
  if (linksNav) {
    linksNav.onclick = (e) => {
      const btn = e.target.closest('[data-nav]');
      if (btn) {
        const page = btn.getAttribute('data-nav');
        if (page) {
          linksNav.classList.remove('mobile-open');
          onNavigate(page);
        }
      }
    };
  }

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.onclick = onToggleTheme;
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = onLogout;
  }

  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn && linksNav) {
    mobileBtn.onclick = () => {
      linksNav.classList.toggle('mobile-open');
    };
  }
}
