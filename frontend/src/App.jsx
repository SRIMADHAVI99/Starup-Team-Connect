import React, { useState, useEffect } from 'react';
import './styles/global.css';
import './styles/login.css';
import './styles/components.css';
import './styles/dashboard.css';

// Components
import ProtectedLayout from './components/ProtectedLayout';
import StartupCard from './components/StartupCard';
import CustomModal from './components/CustomModal';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import FounderDashboard from './pages/FounderDashboard';
import CreateStartup from './pages/CreateStartup';
import StartupDetails from './pages/StartupDetails';
import Applications from './pages/Applications';
import MyApplications from './pages/MyApplications';
import TeamDashboard from './pages/TeamDashboard';
import UserProfile from './pages/UserProfile';
import FounderProfile from './pages/FounderProfile';

import { API_BASE_URL } from './config/api';

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

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('stc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('stc_role') || 'user'; // 'user' | 'founder'
  });

  // Navigation State with Page Refresh Persistence (Requirement 1)
  const [currentPage, setCurrentPage] = useState(() => {
    const savedUserStr = localStorage.getItem('stc_user');
    if (!savedUserStr) return 'login';

    let savedUser = null;
    try {
      savedUser = JSON.parse(savedUserStr);
    } catch (e) {
      return 'login';
    }

    if (!savedUser || !savedUser.id) return 'login';

    const role = localStorage.getItem('stc_role') || savedUser.role || 'user';
    const savedPage = localStorage.getItem('stc_page');
    const pathPage = getPageFromPath(window.location.pathname, role);
    const defaultPage = role === 'founder' ? 'founder-dashboard' : 'user-dashboard';

    // Prioritize explicit route path, then stc_page from localStorage, then default role page
    const targetPage = pathPage || savedPage || defaultPage;
    return getValidPageForRole(targetPage, role) || defaultPage;
  });

  // Persist current active tab/page on changes
  useEffect(() => {
    if (currentUser?.id && currentPage && currentPage !== 'login' && currentPage !== 'register') {
      localStorage.setItem('stc_page', currentPage);
      localStorage.setItem('stc_page_user_id', String(currentUser.id));

      const targetUrl = PAGE_URL_MAP[currentPage] || (currentRole === 'founder' ? '/founder-dashboard' : '/user-dashboard');
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState(null, '', targetUrl);
      }
    }
  }, [currentPage, currentUser?.id, currentRole]);

  // Theme State (Light / Dark mode persistence)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('stc_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stc_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Global Modal State (replaces native alert popups)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showModal = (title, message, type = 'info') => {
    setModalConfig({ isOpen: true, title, message, type });
  };

  // Startups State with LocalStorage Persistence
  const [startups, setStartups] = useState(() => {
    const saved = localStorage.getItem('stc_startups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [startupsError, setStartupsError] = useState(null);
  const [selectedStartup, setSelectedStartup] = useState(null);

  // Applications State
  const [applications, setApplications] = useState([]);

  // Saved Startups State
  const [savedStartups, setSavedStartups] = useState([]);

  // Formed Team State
  const [team, setTeam] = useState(null);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (currentUser?.id) {
        const pathPage = getPageFromPath(window.location.pathname, currentRole);
        if (pathPage) {
          const validPage = getValidPageForRole(pathPage, currentRole);
          if (validPage) {
            setCurrentPage(validPage);
          }
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser?.id, currentRole]);

  // Live polling (every 3 seconds) for startups, applications, and teams for automatic real-time sync
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/startups`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setStartups(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data)) {
                localStorage.setItem('stc_startups', JSON.stringify(data));
                return data;
              }
              return prev;
            });
            setStartupsError(null);
          }
        }
      } catch (err) {
        console.warn('Backend server connecting...');
      }

      if (currentUser?.id) {
        try {
          // Fetch user/founder applications from backend
          const appUrl = currentRole === 'founder'
            ? `${API_BASE_URL}/api/applications/founder/${currentUser.id}`
            : `${API_BASE_URL}/api/applications/user/${currentUser.id}`;
          const appRes = await fetch(appUrl);
          if (appRes.ok) {
            const appData = await appRes.json();
            if (Array.isArray(appData)) {
              setApplications(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(appData)) return appData;
                return prev;
              });
            }
          }

          // Fetch team from backend
          const teamUrl = currentRole === 'founder'
            ? `${API_BASE_URL}/api/teams/founder/${currentUser.id}`
            : `${API_BASE_URL}/api/teams/user/${currentUser.id}`;
          const teamRes = await fetch(teamUrl);
          if (teamRes.ok) {
            const teamData = await teamRes.json();
            const activeTeam = Array.isArray(teamData) ? teamData[0] : teamData;
            if (activeTeam && activeTeam.id) {
              const msgRes = await fetch(`${API_BASE_URL}/api/teams/${activeTeam.id}/messages`);
              if (msgRes.ok) {
                const msgData = await msgRes.json();
                activeTeam.messages = msgData;
              }
              setTeam(prev => {
                if (!prev || prev.id !== activeTeam.id || JSON.stringify(prev.members) !== JSON.stringify(activeTeam.members) || JSON.stringify(prev.messages) !== JSON.stringify(activeTeam.messages)) {
                  return activeTeam;
                }
                return prev;
              });
            }
          }
        } catch (e) {
          console.warn('Backend sync error:', e);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [currentUser?.id, currentRole]);

  // Saved startups persistence per user
  useEffect(() => {
    if (!currentUser?.id) {
      setSavedStartups([]);
      return;
    }

    const userKey = `stc_saved_user_${currentUser.id}`;
    const fetchSaved = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/saved-startups/user/${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSavedStartups(data);
            localStorage.setItem(userKey, JSON.stringify(data));
            return;
          }
        }
      } catch (e) {
        // Fallback to local storage
      }
      const localSaved = localStorage.getItem(userKey);
      if (localSaved) {
        try {
          setSavedStartups(JSON.parse(localSaved));
        } catch (err) { }
      }
    };

    fetchSaved();
  }, [currentUser?.id]);

  // Save session to localStorage
  const handleLoginSuccess = (userData, role) => {
    setCurrentUser(userData);
    setCurrentRole(role);
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
    setCurrentPage(validPage);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('stc_user');
    localStorage.removeItem('stc_role');
    localStorage.removeItem('stc_page');
    localStorage.removeItem('stc_page_user_id');
    setSavedStartups([]);
    setCurrentPage('login');
    window.history.replaceState(null, '', '/');
  };

  const handleSwitchToRegister = (role) => {
    setCurrentRole(role);
    setCurrentPage('register');
  };

  const handleSwitchToLogin = (role) => {
    setCurrentRole(role);
    setCurrentPage('login');
  };

  const handleViewStartupDetails = (startup) => {
    setSelectedStartup(startup);
    setCurrentPage('startup-details');
  };

  // Apply to Join Startup (Requirement 1, 2, 3)
  const handleApplyToStartup = async (startup, selectedRole = 'Developer', note = '') => {
    if (!currentUser || !currentUser.id || !startup || !startup.id) return;

    // Check if user already applied (Requirement 11)
    const alreadyApplied = applications.some(
      a => Number(a.startupId) === Number(startup.id) && Number(a.userId) === Number(currentUser.id)
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
          userId: currentUser.id,
          startupId: startup.id,
          appliedRole: selectedRole,
          note: note
        })
      });

      if (res.ok) {
        const savedApp = await res.json();
        setApplications(prev => [savedApp, ...prev.filter(a => a.id !== savedApp.id)]);
        showModal('Application Submitted', 'Your application was submitted successfully! Track status in "My Applications".', 'success');

        // Immediately re-fetch user's applications from backend (Requirement 3)
        try {
          const freshRes = await fetch(`${API_BASE_URL}/api/applications/user/${currentUser.id}`);
          if (freshRes.ok) {
            const freshApps = await freshRes.json();
            if (Array.isArray(freshApps)) setApplications(freshApps);
          }
        } catch (e) {}
      } else {
        const errText = await res.text();
        showModal('Application Failed', errText || 'Unable to submit your application. Please try again.', 'error');
      }
    } catch (err) {
      showModal('Application Failed', 'Unable to submit your application. Please try again.', 'error');
    }
  };

  // Save / Bookmark Startup with Backend Persistence (Requirement 12)
  const handleSaveStartup = async (startup) => {
    if (!currentUser?.id) return;
    const userKey = `stc_saved_user_${currentUser.id}`;
    const exists = savedStartups.some(s => s.id === startup.id);

    if (exists) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/saved-startups?userId=${currentUser.id}&startupId=${startup.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          const updated = savedStartups.filter(s => s.id !== startup.id);
          setSavedStartups(updated);
          localStorage.setItem(userKey, JSON.stringify(updated));
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
          body: JSON.stringify({ userId: currentUser.id, startupId: startup.id })
        });
        if (res.ok) {
          const updated = [...savedStartups, startup];
          setSavedStartups(updated);
          localStorage.setItem(userKey, JSON.stringify(updated));
        } else {
          showModal('Error', 'Unable to save startup opportunity.', 'error');
        }
      } catch (e) {
        showModal('Error', 'Unable to connect to the server.', 'error');
      }
    }
  };

  // Create Startup & Re-fetch from Backend DB (Requirement 1 & 8)
  const handleStartupCreated = async (newStartup) => {
    let updatedList = [newStartup, ...startups.filter(s => String(s.id) !== String(newStartup.id) && s.title !== newStartup.title)];
    try {
      const res = await fetch(`${API_BASE_URL}/api/startups`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          updatedList = data;
        }
      }
    } catch (e) {
      console.warn('Backend server connecting during startup creation:', e);
    }

    setStartups(updatedList);
    localStorage.setItem('stc_startups', JSON.stringify(updatedList));
    setStartupsError(null);
    setCurrentPage('founder-dashboard');
    showModal('Startup Created', `Startup "${newStartup.title}" created successfully!`, 'success');
  };

  // Founder Accepts Application -> Team Formation (Requirement 11)
  const handleAcceptApplication = async (appId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${appId}/accept`, {
        method: 'PUT'
      });

      if (res.ok) {
        const acceptedApp = await res.json();
        setApplications(prev => prev.map(app => app.id === appId ? acceptedApp : app));

        if (currentUser?.id) {
          try {
            const teamUrl = currentRole === 'founder'
              ? `${API_BASE_URL}/api/teams/founder/${currentUser.id}`
              : `${API_BASE_URL}/api/teams/user/${currentUser.id}`;
            const teamRes = await fetch(teamUrl);
            if (teamRes.ok) {
              const teamData = await teamRes.json();
              const activeTeam = Array.isArray(teamData) ? teamData[0] : teamData;
              if (activeTeam && activeTeam.id) {
                const msgRes = await fetch(`${API_BASE_URL}/api/teams/${activeTeam.id}/messages`);
                if (msgRes.ok) {
                  activeTeam.messages = await msgRes.json();
                }
                setTeam(activeTeam);
              }
            }
          } catch (e) {}
        }

        showModal('Application Accepted', `Application accepted! Team automatically formed for "${acceptedApp.startupTitle || 'Startup'}". Check "My Team".`, 'success');
      } else {
        const errText = await res.text();
        showModal('Action Failed', errText || 'Unable to accept application. Please try again.', 'error');
      }
    } catch (err) {
      showModal('Action Failed', 'Unable to connect to the server. Please try again.', 'error');
    }
  };

  // Founder Rejects Application (Requirement 11)
  const handleRejectApplication = async (appId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${appId}/reject`, {
        method: 'PUT'
      });

      if (res.ok) {
        const rejectedApp = await res.json();
        setApplications(prev => prev.map(app => app.id === appId ? rejectedApp : app));
        showModal('Application Rejected', 'Application status updated to Rejected.', 'info');
      } else {
        const errText = await res.text();
        showModal('Action Failed', errText || 'Unable to reject application. Please try again.', 'error');
      }
    } catch (err) {
      showModal('Action Failed', 'Unable to connect to the server. Please try again.', 'error');
    }
  };

  // Team Chat Post Message (Requirement 7 & 8)
  const handleSendMessage = async (text) => {
    if (!team || !team.id || !currentUser || !currentUser.id) return false;

    const payload = {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentRole,
      text: text.trim()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/teams/${team.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedMsg = await res.json();
        setTeam(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []).filter(m => m.id !== savedMsg.id), savedMsg]
        } : prev);
        return true;
      } else {
        showModal('Message Failed', 'Unable to send message to team chat.', 'error');
        return false;
      }
    } catch (err) {
      showModal('Message Failed', 'Unable to connect to the server.', 'error');
      return false;
    }
  };

  const handleUpdateUserProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('stc_user', JSON.stringify(updatedUser));
  };

  const userApplications = applications.filter(a => {
    return currentUser?.id != null && a?.userId != null && Number(a.userId) === Number(currentUser.id);
  });

  const founderStartups = startups.filter(s => {
    return currentUser?.id != null && s?.founderId != null && Number(s.founderId) === Number(currentUser.id);
  });

  if (currentPage === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={handleSwitchToRegister}
        apiBaseUrl={API_BASE_URL}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <Register
        initialRole={currentRole}
        onRegisterSuccess={handleLoginSuccess}
        onSwitchToLogin={handleSwitchToLogin}
        apiBaseUrl={API_BASE_URL}
      />
    );
  }

  return (
    <ProtectedLayout
      currentUser={currentUser}
      currentRole={currentRole}
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page)}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    >
      <CustomModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* User Dashboard */}
      {currentPage === 'user-dashboard' && (
        <UserDashboard
          currentUser={currentUser}
          startups={startups}
          applications={userApplications}
          savedStartups={savedStartups}
          team={team}
          startupsError={startupsError}
          onViewDetails={handleViewStartupDetails}
          onApply={(st) => handleApplyToStartup(st, 'Developer')}
          onSave={handleSaveStartup}
          onNavigate={(page) => setCurrentPage(page)}
        />
      )}

      {/* Startups Listing */}
      {currentPage === 'startups' && (
        <UserDashboard
          currentUser={currentUser}
          startups={startups}
          applications={userApplications}
          savedStartups={savedStartups}
          team={team}
          startupsError={startupsError}
          onViewDetails={handleViewStartupDetails}
          onApply={(st) => handleApplyToStartup(st, 'Developer')}
          onSave={handleSaveStartup}
          onNavigate={(page) => setCurrentPage(page)}
        />
      )}

      {/* Saved Startups */}
      {currentPage === 'saved-startups' && (
        <div>
          <div className="section-header">
            <div>
              <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Saved Startups</h1>
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
                Your bookmarked startup opportunities.
              </p>
            </div>
          </div>

          {savedStartups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♡</div>
              <h3 className="empty-title">No Saved Startups</h3>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>You haven't saved any startup opportunities yet.</p>
              <button className="btn btn-primary" onClick={() => setCurrentPage('startups')}>
                Explore Startups
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {savedStartups.map(st => (
                <StartupCard
                  key={st.id}
                  startup={st}
                  userSkills={currentUser?.skills || ''}
                  onViewDetails={handleViewStartupDetails}
                  onApply={(s) => handleApplyToStartup(s, 'Developer')}
                  onSave={handleSaveStartup}
                  isSaved={true}
                  hasApplied={userApplications.some(a => a.startupId === st.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Founder Dashboard */}
      {currentPage === 'founder-dashboard' && (
        <FounderDashboard
          currentUser={currentUser}
          founderStartups={founderStartups}
          applications={applications}
          team={team}
          onNavigate={(page) => setCurrentPage(page)}
          onViewDetails={handleViewStartupDetails}
          onAcceptApplication={handleAcceptApplication}
          onRejectApplication={handleRejectApplication}
        />
      )}

      {/* Create Startup */}
      {currentPage === 'create-startup' && (
        <CreateStartup
          currentUser={currentUser}
          onStartupCreated={handleStartupCreated}
          onCancel={() => setCurrentPage('founder-dashboard')}
          apiBaseUrl={API_BASE_URL}
          existingStartups={startups}
        />
      )}

      {/* Startup Details */}
      {currentPage === 'startup-details' && (
        <StartupDetails
          startup={selectedStartup}
          currentUser={currentUser}
          currentRole={currentRole}
          onApply={(st, role, note) => handleApplyToStartup(st, role, note)}
          onSave={handleSaveStartup}
          isSaved={savedStartups.some(s => s.id === selectedStartup?.id)}
          hasApplied={userApplications.some(a => a.startupId === selectedStartup?.id)}
          onBack={() => setCurrentPage(currentRole === 'founder' ? 'founder-dashboard' : 'startups')}
        />
      )}

      {/* Founder Applications */}
      {currentPage === 'applications' && (
        <Applications
          applications={applications}
          onAcceptApplication={handleAcceptApplication}
          onRejectApplication={handleRejectApplication}
          onNavigate={(page) => setCurrentPage(page)}
        />
      )}

      {/* User Applications */}
      {currentPage === 'my-applications' && (
        <MyApplications
          applications={userApplications}
          onNavigate={(page) => setCurrentPage(page)}
          onViewStartup={handleViewStartupDetails}
        />
      )}

      {/* Team Dashboard */}
      {currentPage === 'team' && (
        <TeamDashboard
          team={team}
          currentUser={currentUser}
          currentRole={currentRole}
          onSendMessage={handleSendMessage}
          onNavigate={(page) => setCurrentPage(page)}
          apiBaseUrl={API_BASE_URL}
          onUpdateTeamMessages={(msgs) => setTeam(prev => prev ? { ...prev, messages: msgs } : prev)}
        />
      )}

      {/* User Profile */}
      {currentPage === 'user-profile' && (
        <UserProfile
          currentUser={currentUser}
          onUpdateProfile={handleUpdateUserProfile}
          apiBaseUrl={API_BASE_URL}
        />
      )}

      {/* Founder Profile */}
      {currentPage === 'founder-profile' && (
        <FounderProfile
          currentUser={currentUser}
          onUpdateProfile={handleUpdateUserProfile}
          onNavigate={(page) => setCurrentPage(page)}
          apiBaseUrl={API_BASE_URL}
        />
      )}
    </ProtectedLayout>
  );
}
