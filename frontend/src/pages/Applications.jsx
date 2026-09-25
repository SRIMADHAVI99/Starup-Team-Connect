import React from 'react';
import ApplicationCard from '../components/ApplicationCard';

/**
 * Applications Page (Founder View)
 * Displays all applications submitted to the founder's startups,
 * allowing the founder to Accept or Reject each applicant.
 */
export default function Applications({
  applications = [],
  onAcceptApplication,
  onRejectApplication,
  onNavigate
}) {
  const pendingApps = applications.filter(a => a.status === 'PENDING');
  const processedApps = applications.filter(a => a.status !== 'PENDING');

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Applicant Submissions</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
            Review candidates who want to join your startup teams.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📬</div>
          <h3 className="empty-title">No applications yet</h3>
          <p>When users discover your startup and apply, their applications will appear here.</p>
        </div>
      ) : (
        <>
          {/* Pending Applications */}
          {pendingApps.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', marginBottom: '16px' }}>
                Pending Review ({pendingApps.length})
              </h3>
              <div className="cards-grid">
                {pendingApps.map(app => (
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

          {/* Processed Applications */}
          {processedApps.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary-text)', marginBottom: '16px' }}>
                Past Decisions ({processedApps.length})
              </h3>
              <div className="cards-grid">
                {processedApps.map(app => (
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
        </>
      )}
    </div>
  );
}
