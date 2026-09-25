import React from 'react';
import StartupCard from '../components/StartupCard';
import ApplicationCard from '../components/ApplicationCard';

/**
 * FounderDashboard Page
 * Displays founder's active startups, pending applicant applications,
 * team status, and quick action to create a new startup.
 */
export default function FounderDashboard({
  currentUser,
  founderStartups = [],
  applications = [],
  team = null,
  onNavigate,
  onViewDetails,
  onAcceptApplication,
  onRejectApplication
}) {
  const pendingApps = applications.filter(a => a.status === 'PENDING');

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="dashboard-greeting">Welcome, {currentUser?.name || 'Founder'}! 🚀</h1>
          <p className="dashboard-subtitle">Manage your startups, review talent applications, and build your team.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => onNavigate('create-startup')}
        >
          + Create New Startup
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">My Startups</span>
          <span className="stat-value">{founderStartups.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Applications</span>
          <span className="stat-value" style={{ color: pendingApps.length > 0 ? '#B45309' : 'inherit' }}>
            {pendingApps.length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Applications</span>
          <span className="stat-value">{applications.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Team Formation</span>
          <span className="stat-value" style={{ fontSize: '1.2rem', color: team ? '#15803D' : 'var(--secondary-text)' }}>
            {team ? `${team.members?.length || 1} Members` : 'Building Team'}
          </span>
        </div>
      </div>

      {/* Pending Applications Alert Banner */}
      {pendingApps.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div className="section-header">
            <h2 className="section-title">📬 Action Required: New Applications ({pendingApps.length})</h2>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('applications')}>
              View All Applications &rarr;
            </button>
          </div>

          <div className="cards-grid">
            {pendingApps.slice(0, 3).map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                isFounder={true}
                onAccept={onAcceptApplication}
                onReject={onRejectApplication}
              />
            ))}
          </div>
        </div>
      )}

      {/* My Startups Listing */}
      <div className="section-header">
        <h2 className="section-title">My Created Startups</h2>
      </div>

      {founderStartups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3 className="empty-title">You have not posted any startups yet</h3>
          <p style={{ marginBottom: '16px' }}>Start your journey by posting your startup idea and listing the roles you need.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('create-startup')}>
            + Create Your First Startup
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {founderStartups.map(st => (
            <StartupCard
              key={st.id}
              startup={st}
              showApplyButton={false}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
