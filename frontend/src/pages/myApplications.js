/**
 * MyApplications Page (User View - Vanilla JS)
 * Displays application status history in a clean, responsive summary table.
 */
export function renderMyApplicationsPage({ applications = [] }) {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'badge-accepted';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-pending';
    }
  };

  return `
    <div class="my-applications-page">
      <div class="section-header">
        <div>
          <h1 class="section-title" style="font-size: 1.6rem;">My Startup Applications</h1>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">
            Track the status of your join requests across all startups.
          </p>
        </div>
      </div>

      ${applications.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3 class="empty-title">You haven't applied to any startups yet.</h3>
          <p style="margin-bottom: 16px; color: var(--text-secondary);">
            Explore active startups on the platform and apply to roles matching your skills.
          </p>
          <button id="browse-startups-empty-btn" class="btn btn-primary">
            Browse Available Startups
          </button>
        </div>
      ` : `
        <div style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); overflow: hidden; box-shadow: var(--shadow-sm);">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.92rem;">
              <thead>
                <tr style="background: var(--accent-blue-light); color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
                  <th style="padding: 14px 18px; font-weight: 700;">Startup Name</th>
                  <th style="padding: 14px 18px; font-weight: 700;">Founder</th>
                  <th style="padding: 14px 18px; font-weight: 700;">Role Applied</th>
                  <th style="padding: 14px 18px; font-weight: 700;">Date</th>
                  <th style="padding: 14px 18px; font-weight: 700;">Status</th>
                  <th style="padding: 14px 18px; font-weight: 700;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${applications.map((app) => {
                  const startupTitle = app.startupTitle || app.startup?.title || 'Not available';
                  const founderName = app.founderName || app.startup?.founderName || 'Not available';
                  const startupId = app.startupId || app.startup?.id;

                  return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 16px 18px; font-weight: 600; color: var(--text-primary);">
                        ${escapeHtml(startupTitle)}
                      </td>
                      <td style="padding: 16px 18px; color: var(--text-secondary);">
                        ${escapeHtml(founderName)}
                      </td>
                      <td style="padding: 16px 18px;">
                        <span class="badge badge-role">${escapeHtml(app.appliedRole || 'Developer')}</span>
                      </td>
                      <td style="padding: 16px 18px; color: var(--text-secondary); font-size: 0.85rem;">
                        ${app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Today'}
                      </td>
                      <td style="padding: 16px 18px;">
                        <span class="badge ${getBadgeClass(app.status)}">
                          ${escapeHtml(app.status || 'PENDING')}
                        </span>
                      </td>
                      <td style="padding: 16px 18px;">
                        ${app.status === 'ACCEPTED' ? `
                          <button 
                            class="btn btn-primary btn-sm"
                            data-my-app-action="team"
                          >
                            View Team &rarr;
                          </button>
                        ` : `
                          <button 
                            class="btn btn-outline btn-sm"
                            data-my-app-action="details"
                            data-startup-id="${startupId}"
                            data-app-id="${app.id}"
                          >
                            Details
                          </button>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    </div>
  `;
}

export function initMyApplicationsEvents({
  applications = [],
  onNavigate,
  onViewStartup
}) {
  const browseBtn = document.getElementById('browse-startups-empty-btn');
  if (browseBtn) browseBtn.onclick = () => onNavigate('startups');

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-my-app-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-my-app-action');
    if (action === 'team') {
      onNavigate('team');
    } else if (action === 'details') {
      const startupId = Number(btn.getAttribute('data-startup-id'));
      const appId = Number(btn.getAttribute('data-app-id'));
      const app = applications.find(a => Number(a.id) === appId);
      const targetStartup = app?.startup || {
        id: startupId,
        title: app?.startupTitle || 'Startup',
        founderName: app?.founderName || 'Founder'
      };
      onViewStartup(targetStartup);
    }
  });
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
