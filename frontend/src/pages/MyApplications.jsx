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
          <h3 className="empty-title">You haven't applied to any startups yet.</h3>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Explore active startups on the platform and apply to roles matching your skills.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('startups')}>
            Browse Available Startups
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ background: 'var(--accent-blue-light)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Startup Name</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Founder</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Role Applied</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Date</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: '700' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const startupTitle = app.startupTitle || app.startup?.title || 'Startup Project';
                  const founderName = app.founderName || app.startup?.founderName || 'Startup Founder';
                  const targetStartup = app.startup || { id: app.startupId, title: startupTitle, founderName: founderName };

                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '16px 18px', fontWeight: '600', color: 'var(--primary-dark)' }}>
                        {startupTitle}
                      </td>
                      <td style={{ padding: '16px 18px', color: 'var(--secondary-text)' }}>
                        {founderName}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span className="badge badge-role">{app.appliedRole || 'Developer'}</span>
                      </td>
                      <td style={{ padding: '16px 18px', color: 'var(--secondary-text)', fontSize: '0.85rem' }}>
                        {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Today'}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <span className={`badge ${getBadgeClass(app.status)}`}>
                          {app.status || 'PENDING'}
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
                            onClick={() => onViewStartup(targetStartup)}
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
