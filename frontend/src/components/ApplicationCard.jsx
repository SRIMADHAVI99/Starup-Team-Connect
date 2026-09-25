import React from 'react';

/**
 * ApplicationCard Component
 * Displays an application from a user to a startup,
 * with Accept / Reject action buttons for founders.
 */
export default function ApplicationCard({ 
  application, 
  onAccept, 
  onReject, 
  isFounder = true 
}) {
  const statusClass = {
    PENDING: 'badge-pending',
    ACCEPTED: 'badge-accepted',
    REJECTED: 'badge-rejected'
  }[application.status] || 'badge-pending';

  const applicantName = application.userName || application.user?.name || 'Applicant';
  const applicantEmail = application.userEmail || application.user?.email || '';
  const startupTitle = application.startupTitle || application.startup?.title || 'Startup Project';
  const founderName = application.founderName || application.startup?.founderName || 'Founder';
  const userSkills = application.userSkills || application.user?.skills || '';

  return (
    <div className="application-card">
      <div className="application-header">
        <div>
          <h4 className="applicant-name">
            {isFounder ? applicantName : startupTitle}
          </h4>
          <div className="applicant-email">
            {isFounder ? applicantEmail : `Founder: ${founderName}`}
          </div>
        </div>
        <span className={`badge ${statusClass}`}>
          {application.status || 'PENDING'}
        </span>
      </div>

      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginBottom: '6px' }}>
          <strong>Role Applied:</strong> {application.appliedRole || 'Team Member'}
        </div>

        {isFounder && userSkills && (
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
            <strong>Skills:</strong> {userSkills}
          </div>
        )}

        {isFounder && startupTitle && (
          <div style={{ fontSize: '0.82rem', color: 'var(--secondary-indigo)', marginTop: '4px' }}>
            Startup: <strong>{startupTitle}</strong>
          </div>
        )}

        {application.appliedDate && (
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: '6px' }}>
            Applied on: {new Date(application.appliedDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Founder Action Buttons */}
      {isFounder && (application.status === 'PENDING' || !application.status) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => onAccept(application.id)}
          >
            Accept
          </button>
          <button 
            className="btn btn-outline btn-sm"
            style={{ flex: 1, color: '#B91C1C' }}
            onClick={() => onReject(application.id)}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
