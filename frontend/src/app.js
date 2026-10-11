import './styles/global.css';
import './styles/login.css';
import './styles/components.css';
import './styles/dashboard.css';

// Components
import { renderNavbar, initNavbarEvents } from './components/navbar.js';
import { showModal } from './components/modal.js';
import { renderChatbot, initChatbotEvents } from './components/chatbot.js';

// Pages
import { renderLoginPage, initLoginPageEvents } from './pages/login.js';
import { renderRegisterPage, initRegisterPageEvents } from './pages/register.js';
import { renderUserDashboardPage, initUserDashboardEvents } from './pages/userDashboard.js';
import { renderFounderDashboardPage, initFounderDashboardEvents } from './pages/founderDashboard.js';
import { renderCreateStartupPage, initCreateStartupEvents } from './pages/createStartup.js';
import { renderStartupDetailsPage, initStartupDetailsEvents } from './pages/startupDetails.js';
import { renderApplicationsPage, initApplicationsEvents } from './pages/applications.js';
import { renderMyApplicationsPage, initMyApplicationsEvents } from './pages/myApplications.js';
import { renderSavedStartupsPage, initSavedStartupsEvents } from './pages/savedStartups.js';
import { renderTeamDashboardPage, initTeamDashboardEvents, cleanupTeamDashboard } from './pages/teamDashboard.js';
import { renderUserProfilePage, initUserProfileEvents } from './pages/userProfile.js';
import { renderFounderProfilePage, initFounderProfileEvents } from './pages/founderProfile.js';

import { API_BASE_URL } from './config/api.js';

/**
 * URL and Page Routing Map
 */
const PAGE_URL_MAP = {
  'user-dashboard': '/user-dashboard',
  'founder-dashboard': '/founder-dashboard',
  'startups': '/startups',
  'my-applications': '/applications',
  'applications': '/applications',
  'saved-startups': '/saved',
  'team': '/my-team',
  'user-profile': '/profile',
  'founder-profile': '/profile',
  'create-startup': '/create-startup',
  'startup-details': '/startup-details'
};

const getPageFromPath = (path, role) => {
  if (!path) return null;
  const cleanPath = path.toLowerCase().replace(/\/+$/, '');
  if (cleanPath === '/my-team' || cleanPath === '/team') return 'team';
  if (cleanPath === '/profile' || cleanPath === '/user-profile' || cleanPath === '/founder-profile') {
    return role === 'founder' ? 'founder-profile' : 'user-profile';
  }
  if (cleanPath === '/applications' || cleanPath === '/my-applications') {
    return role === 'founder' ? 'applications' : 'my-applications';
  }
  if (cleanPath === '/saved' || cleanPath === '/saved-startups') return 'saved-startups';
  if (cleanPath === '/startups') return 'startups';
  if (cleanPath === '/create-startup') return 'create-startup';
  if (cleanPath === '/founder-dashboard') return 'founder-dashboard';
  if (cleanPath === '/user-dashboard' || cleanPath === '/dashboard') return 'user-dashboard';
  return null;
};

const getValidPageForRole = (page, role) => {
  if (!page || page === 'login' || page === 'register') return null;

  if (role === 'founder') {
    if (page === 'user-dashboard') return 'founder-dashboard';
    if (page === 'my-applications') return 'applications';
    if (page === 'user-profile') return 'founder-profile';
    const validFounderPages = ['founder-dashboard', 'create-startup', 'applications', 'team', 'founder-profile', 'startup-details'];
    return validFounderPages.includes(page) ? page : 'founder-dashboard';
  } else {
    if (page === 'founder-dashboard') return 'user-dashboard';
    if (page === 'applications') return 'my-applications';
    if (page === 'founder-profile') return 'user-profile';
    const validUserPages = ['user-dashboard', 'startups', 'my-applications', 'saved-startups', 'team', 'user-profile', 'startup-details'];
    return validUserPages.includes(page) ? page : 'user-dashboard';
  }
};

/**
 * Application State
 */
class AppState {
  constructor() {
    // Current User
    const savedUserStr = localStorage.getItem('stc_user');
    try {
      this.currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
    } catch {
      this.currentUser = null;
    }

    // Role ('user' | 'founder')
    this.currentRole = localStorage.getItem('stc_role') || (this.currentUser?.role || 'user');

    // Page resolution with refresh persistence
    this.currentPage = this.resolveInitialPage();

    // Theme (light / dark)
    this.theme = localStorage.getItem('stc_theme') || 'light';
    document.documentElement.setAttribute('data-theme', this.theme);

    // Startups
    const savedStartupsStr = localStorage.getItem('stc_startups');
    try {
      this.startups = savedStartupsStr ? JSON.parse(savedStartupsStr) : [];
      if (!Array.isArray(this.startups)) this.startups = [];
    } catch {
      this.startups = [];
    }
    this.startupsError = null;
    this.selectedStartup = null;

    // Applications & Team
    this.applications = [];
    this.savedStartups = [];

    const savedTeamStr = localStorage.getItem('stc_team');
    try {
      this.team = savedTeamStr ? JSON.parse(savedTeamStr) : null;
    } catch {
      this.team = null;
    }

    const savedSelectedTeamId = localStorage.getItem('stc_selected_team_id');
    this.selectedTeamId = savedSelectedTeamId ? Number(savedSelectedTeamId) : (this.team?.id || null);
    this.teams = this.team ? [this.team] : [];

    this.pollTimer = null;
  }

  resolveInitialPage() {
    if (!this.currentUser || !this.currentUser.id) {
      return 'login';
    }

    const savedPage = localStorage.getItem('stc_page');
    const pathPage = getPageFromPath(window.location.pathname, this.currentRole);
    const defaultPage = this.currentRole === 'founder' ? 'founder-dashboard' : 'user-dashboard';

    const targetPage = pathPage || savedPage || defaultPage;
    return getValidPageForRole(targetPage, this.currentRole) || defaultPage;
  }
}

const state = new AppState();

/**
 * Main App Controller
 */
export function initApp() {
  const root = document.getElementById('root') || document.body;

  // Popstate navigation support for browser back/forward buttons
  window.addEventListener('popstate', () => {
    if (state.currentUser?.id) {
      const pathPage = getPageFromPath(window.location.pathname, state.currentRole);
      if (pathPage) {
        const validPage = getValidPageForRole(pathPage, state.currentRole);
        if (validPage && validPage !== state.currentPage) {
          navigateTo(validPage, false);
        }
      }
    }
  });

  // Start live polling (startups, applications, teams)
  startLivePolling();

  // Load saved startups for current user
  fetchSavedStartups();

  // Render initial view
  render();
}

/**
 * Route Navigation
 */
function navigateTo(page, updateHistory = true) {
  cleanupTeamDashboard();

  if (!state.currentUser && page !== 'login' && page !== 'register') {
    page = 'login';
  }

  const validPage = getValidPageForRole(page, state.currentRole) || page;
  state.currentPage = validPage;

  if (state.currentUser?.id && validPage !== 'login' && validPage !== 'register') {
    localStorage.setItem('stc_page', validPage);
    localStorage.setItem('stc_page_user_id', String(state.currentUser.id));

    if (updateHistory) {
      const targetUrl = PAGE_URL_MAP[validPage] || (state.currentRole === 'founder' ? '/founder-dashboard' : '/user-dashboard');
      if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    }
  }

  render();
}

/**
 * Theme Toggle
 */
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('stc_theme', state.theme);
  render();
}

/**
 * Authentication Handlers
 */
function handleLoginSuccess(userData, role) {
  state.currentUser = userData;
  state.currentRole = role;
  localStorage.setItem('stc_user', JSON.stringify(userData));
  localStorage.setItem('stc_role', role);

  const savedUserId = localStorage.getItem('stc_page_user_id');
  let targetPage = null;
  if (savedUserId && String(savedUserId) === String(userData.id)) {
    targetPage = localStorage.getItem('stc_page');
  }

  const defaultPage = role === 'founder' ? 'founder-dashboard' : 'user-dashboard';
  const validPage = targetPage ? (getValidPageForRole(targetPage, role) || defaultPage) : defaultPage;

  localStorage.setItem('stc_page', validPage);
  localStorage.setItem('stc_page_user_id', String(userData.id));

  fetchSavedStartups();
  navigateTo(validPage);
}

function handleLogout() {
  state.currentUser = null;
  state.savedStartups = [];
  state.applications = [];
  state.team = null;
  state.teams = [];
  state.selectedTeamId = null;

  localStorage.removeItem('stc_user');
  localStorage.removeItem('stc_role');
  localStorage.removeItem('stc_page');
  localStorage.removeItem('stc_page_user_id');
  localStorage.removeItem('stc_team');
  localStorage.removeItem('stc_selected_team_id');

  window.history.replaceState(null, '', '/');
  navigateTo('login', false);
}

/**
 * Data Synchronization (Live Polling every 3 seconds)
 */
async function fetchSyncData() {
  // 1. Fetch startups
  try {
    const res = await fetch(`${API_BASE_URL}/api/startups`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (JSON.stringify(state.startups) !== JSON.stringify(data)) {
          state.startups = data;
          localStorage.setItem('stc_startups', JSON.stringify(data));
          // Refresh user dashboard or startup listings if currently displayed
          if (state.currentPage === 'user-dashboard' || state.currentPage === 'startups' || state.currentPage === 'founder-dashboard') {
            renderActivePageOnly();
          }
        }
        state.startupsError = null;
      }
    }
  } catch (e) {
    // Keep cached startups
  }

  // 2. Fetch applications & team if user logged in
  if (state.currentUser?.id) {
    try {
      const appUrl = state.currentRole === 'founder'
        ? `${API_BASE_URL}/api/applications/founder/${state.currentUser.id}`
        : `${API_BASE_URL}/api/applications/user/${state.currentUser.id}`;
      
      const appRes = await fetch(appUrl);
      if (appRes.ok) {
        const appData = await appRes.json();
        if (Array.isArray(appData)) {
          if (JSON.stringify(state.applications) !== JSON.stringify(appData)) {
            state.applications = appData;
            if (state.currentPage === 'applications' || state.currentPage === 'my-applications' || state.currentPage === 'founder-dashboard') {
              renderActivePageOnly();
            }
          }
        }
      }

      let teamData = [];
      const teamUrl = state.currentRole === 'founder'
        ? `${API_BASE_URL}/api/teams/founder/${state.currentUser.id}`
        : `${API_BASE_URL}/api/teams/user/${state.currentUser.id}/all`;
      
      let teamRes = await fetch(teamUrl);
      if (!teamRes.ok && state.currentRole !== 'founder') {
        teamRes = await fetch(`${API_BASE_URL}/api/teams/user/${state.currentUser.id}`);
      }

      if (teamRes.ok) {
        const raw = await teamRes.json();
        teamData = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        state.teams = teamData;

        let activeTeam = null;
        if (state.selectedTeamId) {
          activeTeam = teamData.find(t => Number(t.id) === Number(state.selectedTeamId));
        }
        if (!activeTeam && teamData.length > 0) {
          activeTeam = teamData[teamData.length - 1];
          state.selectedTeamId = activeTeam.id;
          localStorage.setItem('stc_selected_team_id', String(activeTeam.id));
        }

        if (activeTeam && activeTeam.id) {
          // If user is currently on the 'team' page, teamDashboard.js owns live 2s message polling
          if (state.currentPage !== 'team') {
            const msgRes = await fetch(`${API_BASE_URL}/api/teams/${activeTeam.id}/messages`);
            if (msgRes.ok) {
              activeTeam.messages = await msgRes.json();
            }
          } else if (state.team && state.team.id === activeTeam.id && state.team.messages) {
            activeTeam.messages = state.team.messages;
          }

          const teamMembersChanged = !state.team ||
            Number(state.team.id) !== Number(activeTeam.id) ||
            (state.team.members || []).length !== (activeTeam.members || []).length;

          state.team = activeTeam;
          localStorage.setItem('stc_team', JSON.stringify(activeTeam));

          if (teamMembersChanged && (state.currentPage === 'founder-dashboard' || state.currentPage === 'user-dashboard')) {
            renderActivePageOnly();
          }
        } else if (!activeTeam && state.team) {
          state.team = null;
          state.selectedTeamId = null;
          localStorage.removeItem('stc_team');
          localStorage.removeItem('stc_selected_team_id');
          if (state.currentPage === 'team' || state.currentPage === 'founder-dashboard' || state.currentPage === 'user-dashboard') {
            renderActivePageOnly();
          }
        }
      }
    } catch (e) {
      console.warn('Backend sync retry:', e);
    }
  }
}

function startLivePolling() {
  if (state.pollTimer) clearInterval(state.pollTimer);
  fetchSyncData();
  state.pollTimer = setInterval(fetchSyncData, 3000);
}

async function fetchSavedStartups() {
  if (!state.currentUser?.id) {
    state.savedStartups = [];
    return;
  }

  const userKey = `stc_saved_user_${state.currentUser.id}`;
  try {
    const res = await fetch(`${API_BASE_URL}/api/saved-startups/user/${state.currentUser.id}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        state.savedStartups = data;
        localStorage.setItem(userKey, JSON.stringify(data));
        return;
      }
    }
  } catch (e) {}

  const localSaved = localStorage.getItem(userKey);
  if (localSaved) {
    try {
      state.savedStartups = JSON.parse(localSaved);
    } catch {}
  }
}

/**
 * Domain Actions
 */
async function handleApplyToStartup(startup, selectedRole = 'Developer', note = '') {
  if (!state.currentUser || !state.currentUser.id || !startup || !startup.id) return;

  const alreadyApplied = state.applications.some(
    a => Number(a.startupId) === Number(startup.id) && Number(a.userId) === Number(state.currentUser.id)
  );

  if (alreadyApplied) {
    showModal('Already Applied', 'You have already submitted an application to this startup!', 'info');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.currentUser.id,
        startupId: startup.id,
        appliedRole: selectedRole,
        note: note
      })
    });

    if (res.ok) {
      const savedApp = await res.json();
      state.applications = [savedApp, ...state.applications.filter(a => a.id !== savedApp.id)];
      showModal('Application Submitted', 'Your application was submitted successfully! Track status in "My Applications".', 'success');

      try {
        const freshRes = await fetch(`${API_BASE_URL}/api/applications/user/${state.currentUser.id}`);
        if (freshRes.ok) {
          const freshApps = await freshRes.json();
          if (Array.isArray(freshApps)) state.applications = freshApps;
        }
      } catch (e) {}

      renderActivePageOnly();
    } else {
      const errText = await res.text();
      showModal('Application Failed', errText || 'Unable to submit your application. Please try again.', 'error');
    }
  } catch (err) {
    showModal('Application Failed', 'Unable to submit your application. Please try again.', 'error');
  }
}

async function handleSaveStartup(startup) {
  if (!state.currentUser?.id || !startup?.id) return;
  const userKey = `stc_saved_user_${state.currentUser.id}`;
  const exists = state.savedStartups.some(s => s.id === startup.id);

  if (exists) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/saved-startups?userId=${state.currentUser.id}&startupId=${startup.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        state.savedStartups = state.savedStartups.filter(s => s.id !== startup.id);
        localStorage.setItem(userKey, JSON.stringify(state.savedStartups));
        renderActivePageOnly();
      } else {
        showModal('Error', 'Unable to remove startup from bookmarks.', 'error');
      }
    } catch (e) {
      showModal('Error', 'Unable to connect to the server.', 'error');
    }
  } else {
    try {
      const res = await fetch(`${API_BASE_URL}/api/saved-startups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.currentUser.id, startupId: startup.id })
      });
      if (res.ok) {
        state.savedStartups = [...state.savedStartups, startup];
        localStorage.setItem(userKey, JSON.stringify(state.savedStartups));
        renderActivePageOnly();
      } else {
        showModal('Error', 'Unable to save startup opportunity.', 'error');
      }
    } catch (e) {
      showModal('Error', 'Unable to connect to the server.', 'error');
    }
  }
}

async function handleStartupCreated(newStartup) {
  let updatedList = [newStartup, ...state.startups.filter(s => String(s.id) !== String(newStartup.id) && s.title !== newStartup.title)];
  try {
    const res = await fetch(`${API_BASE_URL}/api/startups`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        updatedList = data;
      }
    }
  } catch (e) {}

  state.startups = updatedList;
  localStorage.setItem('stc_startups', JSON.stringify(updatedList));
  state.startupsError = null;

  navigateTo('founder-dashboard');
  showModal('Startup Created', `Startup "${newStartup.title}" created successfully!`, 'success');
}

async function handleAcceptApplication(appId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/applications/${appId}/accept`, {
      method: 'PUT'
    });

    if (res.ok) {
      const acceptedApp = await res.json();
      state.applications = state.applications.map(app => app.id === appId ? acceptedApp : app);

      if (state.currentUser?.id) {
        try {
          const teamUrl = state.currentRole === 'founder'
            ? `${API_BASE_URL}/api/teams/founder/${state.currentUser.id}`
            : `${API_BASE_URL}/api/teams/user/${state.currentUser.id}/all`;
          const teamRes = await fetch(teamUrl);
          if (teamRes.ok) {
            const raw = await teamRes.json();
            const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
            state.teams = list;
            const activeTeam = list[list.length - 1] || list[0];
            if (activeTeam && activeTeam.id) {
              state.selectedTeamId = activeTeam.id;
              localStorage.setItem('stc_selected_team_id', String(activeTeam.id));
              const msgRes = await fetch(`${API_BASE_URL}/api/teams/${activeTeam.id}/messages`);
              if (msgRes.ok) {
                activeTeam.messages = await msgRes.json();
              }
              state.team = activeTeam;
              localStorage.setItem('stc_team', JSON.stringify(activeTeam));
            }
          }
        } catch (e) {}
      }

      showModal('Application Accepted', `Application accepted! Team automatically formed for "${acceptedApp.startupTitle || 'Startup'}". Check "My Team".`, 'success');
      renderActivePageOnly();
    } else {
      const errText = await res.text();
      showModal('Action Failed', errText || 'Unable to accept application. Please try again.', 'error');
    }
  } catch (err) {
    showModal('Action Failed', 'Unable to connect to the server. Please try again.', 'error');
  }
}

async function handleRejectApplication(appId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/applications/${appId}/reject`, {
      method: 'PUT'
    });

    if (res.ok) {
      const rejectedApp = await res.json();
      state.applications = state.applications.map(app => app.id === appId ? rejectedApp : app);
      showModal('Application Rejected', 'Application status updated to Rejected.', 'info');
      renderActivePageOnly();
    } else {
      const errText = await res.text();
      showModal('Action Failed', errText || 'Unable to reject application. Please try again.', 'error');
    }
  } catch (err) {
    showModal('Action Failed', 'Unable to connect to the server. Please try again.', 'error');
  }
}

async function handleSendMessage(text) {
  if (!state.team || !state.team.id || !state.currentUser || !state.currentUser.id) return false;

  const payload = {
    senderId: state.currentUser.id,
    senderName: state.currentUser.name || (state.currentRole === 'founder' ? 'Founder' : 'Team Member'),
    senderRole: state.currentRole,
    text: text.trim()
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/teams/${state.team.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const savedMsg = await res.json();
      const existing = state.team.messages || [];
      const updated = [...existing.filter(m => m.id !== savedMsg.id), savedMsg];
      state.team.messages = updated;
      localStorage.setItem('stc_team', JSON.stringify(state.team));
      return savedMsg;
    } else {
      showModal('Message Failed', 'Unable to send message to team chat.', 'error');
      return false;
    }
  } catch (err) {
    showModal('Message Failed', 'Unable to connect to the server.', 'error');
    return false;
  }
}

function handleSelectTeam(newTeamId) {
  const selected = (state.teams || []).find(t => Number(t.id) === Number(newTeamId));
  if (selected) {
    state.selectedTeamId = selected.id;
    state.team = selected;
    localStorage.setItem('stc_selected_team_id', String(selected.id));
    localStorage.setItem('stc_team', JSON.stringify(selected));
    renderActivePageOnly();
  }
}

function handleUpdateUserProfile(updatedUser) {
  state.currentUser = updatedUser;
  localStorage.setItem('stc_user', JSON.stringify(updatedUser));
  renderActivePageOnly();
}

function handleUpdateFounderProfile(updatedFounder) {
  state.currentUser = updatedFounder;
  localStorage.setItem('stc_user', JSON.stringify(updatedFounder));
  renderActivePageOnly();
}

function handleViewStartupDetails(startup) {
  state.selectedStartup = startup;
  navigateTo('startup-details');
}

/**
 * Rendering Logic
 */
function render() {
  const root = document.getElementById('root');
  if (!root) return;

  if (state.currentPage === 'login') {
    root.innerHTML = renderLoginPage({ initialRole: state.currentRole });
    initLoginPageEvents({
      apiBaseUrl: API_BASE_URL,
      onLoginSuccess: handleLoginSuccess,
      onSwitchToRegister: (role) => {
        state.currentRole = role;
        navigateTo('register');
      },
      initialRole: state.currentRole
    });
    return;
  }

  if (state.currentPage === 'register') {
    root.innerHTML = renderRegisterPage({ initialRole: state.currentRole });
    initRegisterPageEvents({
      apiBaseUrl: API_BASE_URL,
      onRegisterSuccess: handleLoginSuccess,
      onSwitchToLogin: (role) => {
        state.currentRole = role;
        navigateTo('login');
      },
      initialRole: state.currentRole
    });
    return;
  }

  // Protected Layout Shell
  root.innerHTML = `
    <div class="layout-wrapper" style="min-height: 100vh; display: flex; flex-direction: column;">
      ${renderNavbar({
        currentUser: state.currentUser,
        currentRole: state.currentRole,
        currentPage: state.currentPage,
        theme: state.theme
      })}

      <main class="container page-container" id="page-content" style="flex: 1;">
        <!-- Active Page Content -->
      </main>

      <footer style="
        border-top: 1px solid var(--border-color);
        padding: 20px 0;
        background: var(--bg-card);
        color: var(--text-secondary);
        font-size: 0.85rem;
        text-align: center;
        transition: background-color 0.2s ease, border-color 0.2s ease;
      ">
        <div class="container">
          Startup Team Connect &bull; Technical PBL Collaboration Platform
        </div>
      </footer>

      ${renderChatbot()}
    </div>
  `;

  // Initialize Navbar and Chatbot events
  initNavbarEvents({
    onNavigate: (p) => navigateTo(p),
    onLogout: handleLogout,
    onToggleTheme: toggleTheme,
    currentRole: state.currentRole
  });

  initChatbotEvents();

  // Render the specific active page inside #page-content
  renderActivePageContent();
}

function renderActivePageOnly() {
  const contentMount = document.getElementById('page-content');
  if (contentMount) {
    renderActivePageContent();
  } else {
    render();
  }
}

function renderActivePageContent() {
  const contentMount = document.getElementById('page-content');
  if (!contentMount) return;

  const userApplications = state.applications.filter(a => {
    return state.currentUser?.id != null && a?.userId != null && Number(a.userId) === Number(state.currentUser.id);
  });

  const founderStartups = state.startups.filter(s => {
    return state.currentUser?.id != null && s?.founderId != null && Number(s.founderId) === Number(state.currentUser.id);
  });

  switch (state.currentPage) {
    case 'user-dashboard':
    case 'startups':
      contentMount.innerHTML = renderUserDashboardPage({
        currentUser: state.currentUser,
        startups: state.startups,
        applications: userApplications,
        savedStartups: state.savedStartups,
        team: state.team,
        startupsError: state.startupsError
      });
      initUserDashboardEvents({
        startups: state.startups,
        currentUser: state.currentUser,
        applications: userApplications,
        savedStartups: state.savedStartups,
        startupsError: state.startupsError,
        onViewDetails: handleViewStartupDetails,
        onApply: (st) => handleApplyToStartup(st, 'Developer'),
        onSave: handleSaveStartup
      });
      break;

    case 'saved-startups':
      contentMount.innerHTML = renderSavedStartupsPage({
        savedStartups: state.savedStartups,
        currentUser: state.currentUser,
        applications: userApplications
      });
      initSavedStartupsEvents({
        savedStartups: state.savedStartups,
        onNavigate: (p) => navigateTo(p),
        onViewDetails: handleViewStartupDetails,
        onApply: (st) => handleApplyToStartup(st, 'Developer'),
        onSave: handleSaveStartup
      });
      break;

    case 'founder-dashboard':
      contentMount.innerHTML = renderFounderDashboardPage({
        currentUser: state.currentUser,
        founderStartups: founderStartups,
        applications: state.applications,
        team: state.team
      });
      initFounderDashboardEvents({
        founderStartups: founderStartups,
        applications: state.applications,
        onNavigate: (p) => navigateTo(p),
        onViewDetails: handleViewStartupDetails,
        onAcceptApplication: handleAcceptApplication,
        onRejectApplication: handleRejectApplication
      });
      break;

    case 'create-startup':
      contentMount.innerHTML = renderCreateStartupPage();
      initCreateStartupEvents({
        currentUser: state.currentUser,
        onStartupCreated: handleStartupCreated,
        onCancel: () => navigateTo('founder-dashboard'),
        apiBaseUrl: API_BASE_URL,
        existingStartups: state.startups
      });
      break;

    case 'startup-details':
      contentMount.innerHTML = renderStartupDetailsPage({
        startup: state.selectedStartup,
        currentUser: state.currentUser,
        currentRole: state.currentRole,
        isSaved: state.savedStartups.some(s => s.id === state.selectedStartup?.id),
        hasApplied: userApplications.some(a => a.startupId === state.selectedStartup?.id)
      });
      initStartupDetailsEvents({
        startup: state.selectedStartup,
        onApply: (st, role, note) => handleApplyToStartup(st, role, note),
        onSave: handleSaveStartup,
        onBack: () => navigateTo(state.currentRole === 'founder' ? 'founder-dashboard' : 'startups')
      });
      break;

    case 'applications':
      contentMount.innerHTML = renderApplicationsPage({
        applications: state.applications
      });
      initApplicationsEvents({
        onAcceptApplication: handleAcceptApplication,
        onRejectApplication: handleRejectApplication
      });
      break;

    case 'my-applications':
      contentMount.innerHTML = renderMyApplicationsPage({
        applications: userApplications
      });
      initMyApplicationsEvents({
        applications: userApplications,
        onNavigate: (p) => navigateTo(p),
        onViewStartup: handleViewStartupDetails
      });
      break;

    case 'team':
      contentMount.innerHTML = renderTeamDashboardPage({
        team: state.team,
        teams: state.teams,
        currentUser: state.currentUser,
        currentRole: state.currentRole
      });
      initTeamDashboardEvents({
        team: state.team,
        teams: state.teams,
        currentUser: state.currentUser,
        currentRole: state.currentRole,
        onSendMessage: handleSendMessage,
        onNavigate: (p) => navigateTo(p),
        onSelectTeam: handleSelectTeam,
        apiBaseUrl: API_BASE_URL,
        onUpdateTeamMessages: (msgs) => {
          if (state.team) {
            state.team.messages = msgs;
            localStorage.setItem('stc_team', JSON.stringify(state.team));
          }
        }
      });
      break;

    case 'user-profile':
      contentMount.innerHTML = renderUserProfilePage({
        currentUser: state.currentUser
      });
      initUserProfileEvents({
        currentUser: state.currentUser,
        onUpdateProfile: handleUpdateUserProfile,
        apiBaseUrl: API_BASE_URL
      });
      break;

    case 'founder-profile':
      contentMount.innerHTML = renderFounderProfilePage({
        currentUser: state.currentUser
      });
      initFounderProfileEvents({
        currentUser: state.currentUser,
        onUpdateProfile: handleUpdateFounderProfile,
        onNavigate: (p) => navigateTo(p),
        apiBaseUrl: API_BASE_URL
      });
      break;

    default:
      navigateTo(state.currentRole === 'founder' ? 'founder-dashboard' : 'user-dashboard');
      break;
  }
}
