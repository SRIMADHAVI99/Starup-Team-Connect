/**
 * ApplicationCard Component (Vanilla JS)
 * Displays an applicant submission with status badges and founder decisions.
 */
export function renderApplicationCard({ application, isFounder = true }) {
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

  return `
    <div class="application-card" data-app-id="${application.id}">
      <div class="application-header">
        <div>
          <h4 class="applicant-name">
            ${escapeHtml(isFounder ? applicantName : startupTitle)}
          </h4>
          <div class="applicant-email">
            ${escapeHtml(isFounder ? applicantEmail : `Founder: ${founderName}`)}
          </div>
        </div>
        <span class="badge ${statusClass}">
          ${escapeHtml(application.status || 'PENDING')}
        </span>
      </div>

      <div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;">
          <strong>Role Applied:</strong> ${escapeHtml(application.appliedRole || 'Team Member')}
        </div>

        ${isFounder && userSkills ? `
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            <strong>Skills:</strong> ${escapeHtml(userSkills)}
          </div>
        ` : ''}

        ${isFounder && startupTitle ? `
          <div style="font-size: 0.82rem; color: var(--accent-blue); margin-top: 4px;">
            Startup: <strong>${escapeHtml(startupTitle)}</strong>
          </div>
        ` : ''}

        ${application.appliedDate ? `
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px;">
            Applied on: ${new Date(application.appliedDate).toLocaleDateString()}
          </div>
        ` : ''}
      </div>

      ${isFounder && (application.status === 'PENDING' || !application.status) ? `
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button 
            class="btn btn-primary btn-sm"
            style="flex: 1;"
            data-app-action="accept"
            data-id="${application.id}"
          >
            Accept
          </button>
          <button 
            class="btn btn-outline btn-sm"
            style="flex: 1; color: #B91C1C;"
            data-app-action="reject"
            data-id="${application.id}"
          >
            Reject
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
