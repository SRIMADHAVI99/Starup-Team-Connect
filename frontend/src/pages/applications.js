import { renderApplicationCard } from '../components/applicationCard.js';

/**
 * Applications Page (Founder View - Vanilla JS)
 * Displays applicant submissions with Pending Review and Past Decisions sections.
 */
export function renderApplicationsPage({ applications = [] }) {
  const pendingApps = applications.filter(a => a.status === 'PENDING');
  const processedApps = applications.filter(a => a.status !== 'PENDING');

  return `
    <div class="applications-page">
      <div class="section-header">
        <div>
          <h1 class="section-title" style="font-size: 1.6rem;">Applicant Submissions</h1>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">
            Review candidates who want to join your startup teams.
          </p>
        </div>
      </div>

      ${applications.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📬</div>
          <h3 class="empty-title">No applications yet</h3>
          <p>When users discover your startup and apply, their applications will appear here.</p>
        </div>
      ` : `
        <!-- Pending Applications -->
        ${pendingApps.length > 0 ? `
          <div style="margin-bottom: 36px;">
            <h3 style="font-size: 1.2rem; color: var(--accent-blue-dark); margin-bottom: 16px;">
              Pending Review (${pendingApps.length})
            </h3>
            <div class="cards-grid">
              ${pendingApps.map(app => renderApplicationCard({
                application: app,
                isFounder: true
              })).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Processed Applications -->
        ${processedApps.length > 0 ? `
          <div>
            <h3 style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 16px;">
              Past Decisions (${processedApps.length})
            </h3>
            <div class="cards-grid">
              ${processedApps.map(app => renderApplicationCard({
                application: app,
                isFounder: true
              })).join('')}
            </div>
          </div>
        ` : ''}
      `}
    </div>
  `;
}

export function initApplicationsEvents({ onAcceptApplication, onRejectApplication }) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-app-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-app-action');
    const id = Number(btn.getAttribute('data-id'));
    if (action === 'accept') {
      onAcceptApplication(id);
    } else if (action === 'reject') {
      onRejectApplication(id);
    }
  });
}
