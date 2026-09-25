import React from 'react';

/**
 * MyApplications Page (User View)
 * Displays a clean summary table/cards of startups the user has applied to
 * with status indicators (PENDING, ACCEPTED, REJECTED).
 */
export default function MyApplications({
  applications = [],
  onNavigate,
  onViewStartup
}) {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'badge-accepted';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-pending';
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>My Startup Applications</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
            Track the status of your join requests across all startups.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3 className="empty-title">You have not submitted any applications yet</h3>
          <p style={{ marginBottom: '16px' }}>Explore active startups on the platform and apply to roles matching your skills.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('startups')}>
            Browse Available Startups
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--card-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ background: 'var(--soft-blue)', color: 'var(--primary-dark)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Startup Name</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Founder</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Role Applied</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px 18px', fontWeight: '600', color: 'var(--primary-dark)' }}>
                      {app.startup?.title || 'EcoTrack'}
                    </td>
                    <td style={{ padding: '16px 18px', color: 'var(--secondary-text)' }}>
                      {app.startup?.founderName || 'Founder'}
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      <span className="badge badge-role">{app.appliedRole || 'Developer'}</span>
                    </td>
                    <td style={{ padding: '16px 18px', color: 'var(--secondary-text)', fontSize: '0.85rem' }}>
                      {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Today'}
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      <span className={`badge ${getBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      {app.status === 'ACCEPTED' ? (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => onNavigate('team')}
                        >
                          View Team &rarr;
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => onViewStartup(app.startup)}
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
