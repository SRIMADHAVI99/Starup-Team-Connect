import React, { useState, useEffect } from 'react';
import './styles/global.css';
import './styles/login.css';
import './styles/components.css';
import './styles/dashboard.css';

// Components
import ProtectedLayout from './components/ProtectedLayout';

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

const API_BASE_URL = `http://${window.location.hostname || 'localhost'}:8080`;

// Initial Demo/Seed Startup (EcoTrack as specified in Requirement 8 & 29)
const INITIAL_STARTUPS = [
  {
    id: 1,
    title: 'EcoTrack',
    category: 'CleanTech',
    shortDescription: 'A smart waste management and recycling platform connecting communities with collection hubs.',
    problemStatement: 'Urban neighborhoods lack transparency and incentives for effective segregation and collection of recyclable waste.',
    solution: 'A mobile-first platform that tracks waste collection routes, provides reward points for verified recycling, and alerts collection teams.',
    requiredRoles: 'Java Developer, UI Designer, IoT Specialist',
    requiredSkills: 'Java, SQL, HTML, CSS, React',
    teamSize: '3-4 members',
    founderId: 1,
    founderName: 'Ananya Gupta',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'SkillBridge',
    category: 'EdTech',
    shortDescription: 'Peer-to-peer micro-mentorship platform for engineering students to build open-source projects.',
    problemStatement: 'Junior students struggle to find real project experience and personalized code review from seniors.',
    solution: 'Structured collaborative sprints where senior mentors guide small student teams to build resume-worthy MVPs.',
    requiredRoles: 'Frontend Developer, Database Admin',
    requiredSkills: 'JavaScript, React, SQL, Git',
    teamSize: '3 members',
    founderId: 2,
    founderName: 'Vikram Mehta',
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('stc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('stc_role') || 'user'; // 'user' | 'founder'
  });

  // Navigation State
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('stc_user');
    const role = localStorage.getItem('stc_role') || 'user';
    return saved ? (role === 'founder' ? 'founder-dashboard' : 'user-dashboard') : 'login';
  });

  // Startups State
  const [startups, setStartups] = useState(INITIAL_STARTUPS);
  const [selectedStartup, setSelectedStartup] = useState(null);

  // Applications State
  const [applications, setApplications] = useState([]);

  // Saved Startups State (Requirement 15)
  const [savedStartups, setSavedStartups] = useState([]);

  // Formed Team State (Requirement 13 & 19)
  const [team, setTeam] = useState(null);

  // Load from backend on startup or when user/role changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/startups`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setStartups(data);
          }
        }
      } catch {
        // Backend not yet running; using initial seeds
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
              setApplications(appData);
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
              // Fetch team messages
              const msgRes = await fetch(`${API_BASE_URL}/api/teams/${activeTeam.id}/messages`);
              if (msgRes.ok) {
                const msgData = await msgRes.json();
                activeTeam.messages = msgData;
              }
              setTeam(activeTeam);
            }
          }
        } catch (e) {
          console.warn('Backend sync warning:', e);
        }
      }
    };
    fetchData();
  }, [currentUser, currentRole]);

  // Save session to localStorage
  const handleLoginSuccess = (userData, role) => {
    setCurrentUser(userData);
    setCurrentRole(role);
    localStorage.setItem('stc_user', JSON.stringify(userData));
    localStorage.setItem('stc_role', role);
    setCurrentPage(role === 'founder' ? 'founder-dashboard' : 'user-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('stc_user');
    localStorage.removeItem('stc_role');
    setCurrentPage('login');
  };

  // Switch between Login and Register views
  const handleSwitchToRegister = (role) => {
    setCurrentRole(role);
    setCurrentPage('register');
  };

  const handleSwitchToLogin = (role) => {
    setCurrentRole(role);
    setCurrentPage('login');
  };

  // View Startup Details
  const handleViewStartupDetails = (startup) => {
    setSelectedStartup(startup);
    setCurrentPage('startup-details');
  };

  // Apply to Join Startup (Requirement 11)
  const handleApplyToStartup = async (startup, selectedRole = 'Developer', note = '') => {
    if (!currentUser) return;

    // Check if user already applied
    const alreadyApplied = applications.some(
      a => (a.startupId === startup.id || a.startup?.id === startup.id) &&
           (a.userId === currentUser.id || a.user?.email === currentUser.email)
    );

    if (alreadyApplied) {
      alert('You have already applied to this startup!');
      return;
    }

    const newApplication = {
      id: Date.now(),
      startupId: startup.id,
      startup: startup,
      userId: currentUser.id,
      user: currentUser,
      appliedRole: selectedRole,
      note: note,
      appliedDate: new Date().toISOString(),
      status: 'PENDING'
    };

    // Try backend call
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
        setApplications(prev => [savedApp, ...prev]);
      } else {
        setApplications(prev => [newApplication, ...prev]);
      }
    } catch {
      setApplications(prev => [newApplication, ...prev]);
    }

    alert('Application submitted successfully! Track status in "My Applications".');
  };

  // Save / Bookmark Startup (Requirement 15)
  const handleSaveStartup = (startup) => {
    setSavedStartups(prev => {
      const exists = prev.some(s => s.id === startup.id);
      if (exists) {
        return prev.filter(s => s.id !== startup.id);
      } else {
        return [...prev, startup];
      }
    });
  };

  // Create Startup (Requirement 8)
  const handleStartupCreated = (newStartup) => {
    setStartups(prev => [newStartup, ...prev]);
    setCurrentPage('founder-dashboard');
    alert(`Startup "${newStartup.title}" created successfully and saved!`);
  };

  // Founder Accepts Application -> Triggers Team Formation (Requirement 13)
  const handleAcceptApplication = async (appId) => {
    let acceptedApp = null;

    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        acceptedApp = { ...app, status: 'ACCEPTED' };
        return acceptedApp;
      }
      return app;
    }));

    // Call backend API: PUT /api/applications/{id}/accept
    try {
      await fetch(`${API_BASE_URL}/api/applications/${appId}/accept`, {
        method: 'PUT'
      });
    } catch {
      // Offline fallback
    }

    // Automatically form team relationship (Requirement 13 & 29)
    if (acceptedApp) {
      const targetStartup = acceptedApp.startup || startups.find(s => s.id === acceptedApp.startupId) || { title: 'Startup Project' };
      
      const newMember = {
        userId: acceptedApp.user?.id || 1,
        userName: acceptedApp.user?.name || 'Applicant',
        role: acceptedApp.appliedRole || 'Developer',
        skills: acceptedApp.user?.skills || 'Technical Skills'
      };

      setTeam(prevTeam => {
        if (!prevTeam) {
          return {
            id: Date.now(),
            startupTitle: targetStartup.title,
            founderName: targetStartup.founderName || currentUser?.name || 'Founder',
            status: 'Active',
            members: [newMember],
            messages: [
              {
                id: 1,
                senderName: targetStartup.founderName || 'Founder',
                senderRole: 'founder',
                text: `Welcome to the ${targetStartup.title} team! Excited to work together.`,
                timestamp: 'Just now'
              }
            ]
          };
        } else {
          return {
            ...prevTeam,
            members: [...(prevTeam.members || []), newMember]
          };
        }
      });

      alert(`Application accepted! Team automatically formed for "${targetStartup.title}". Check "My Team".`);
    }
  };

  // Founder Rejects Application (Requirement 12)
  const handleRejectApplication = async (appId) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return { ...app, status: 'REJECTED' };
      }
      return app;
    }));

    try {
      await fetch(`${API_BASE_URL}/api/applications/${appId}/reject`, {
        method: 'PUT'
      });
    } catch {
      // Offline fallback
    }
  };

  // Team Chat: Post message (Requirement 20)
  const handleSendMessage = async (text) => {
    if (!team) return;
    const newMsg = {
      id: Date.now(),
      senderName: currentUser?.name || (currentRole === 'founder' ? 'Founder' : 'Team Member'),
      senderRole: currentRole,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTeam(prev => ({
      ...prev,
      messages: [...(prev?.messages || []), newMsg]
    }));

    if (team.id) {
      try {
        await fetch(`${API_BASE_URL}/api/teams/${team.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUser?.id || 1,
            senderName: newMsg.senderName,
            senderRole: currentRole,
            text: text
          })
        });
      } catch (err) {
        console.warn('Backend message save error:', err);
      }
    }
  };

  // User Profile Update
  const handleUpdateUserProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('stc_user', JSON.stringify(updatedUser));
  };

  // Filter applications relevant to current user
  const userApplications = applications.filter(
    a => a.userId === currentUser?.id || a.user?.email === currentUser?.email
  );

  // Filter startups created by this founder
  const founderStartups = startups.filter(
    s => s.founderId === currentUser?.id || s.founderName === currentUser?.name
  );

  // Authentication Views
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

  // Authenticated Views wrapped in ProtectedLayout
  return (
    <ProtectedLayout
      currentUser={currentUser}
      currentRole={currentRole}
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page)}
      onLogout={handleLogout}
    >
      {/* User Dashboard */}
      {currentPage === 'user-dashboard' && (
        <UserDashboard 
          currentUser={currentUser}
          startups={startups}
          applications={userApplications}
          savedStartups={savedStartups}
          team={team}
          onViewDetails={handleViewStartupDetails}
          onApply={(st) => handleApplyToStartup(st, 'Developer')}
          onSave={handleSaveStartup}
          onNavigate={(page) => setCurrentPage(page)}
        />
      )}

      {/* Startups Listing (User View) */}
      {currentPage === 'startups' && (
        <UserDashboard 
          currentUser={currentUser}
          startups={startups}
          applications={userApplications}
          savedStartups={savedStartups}
          team={team}
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
              <h3 className="empty-title">No saved startups yet</h3>
              <p style={{ marginBottom: '16px' }}>Click the heart icon on any startup card to bookmark it here.</p>
              <button className="btn btn-primary" onClick={() => setCurrentPage('startups')}>
                Browse Startups
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {savedStartups.map(st => (
                <StartupDetails
                  key={st.id}
                  startup={st}
                  currentUser={currentUser}
                  currentRole={currentRole}
                  onApply={(s, role, note) => handleApplyToStartup(s, role, note)}
                  onSave={handleSaveStartup}
                  isSaved={true}
                  hasApplied={userApplications.some(a => a.startupId === st.id)}
                  onBack={() => setCurrentPage('startups')}
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
        />
      )}
    </ProtectedLayout>
  );
}
