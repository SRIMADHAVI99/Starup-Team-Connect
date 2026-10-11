import { renderStartupCard } from '../components/startupCard.js';
import { renderApplicationCard } from '../components/applicationCard.js';

/**
 * FounderDashboard Page (Vanilla JS)
 * Displays founder's startups, applicant submissions needing decision, and quick startup creation.
 */
export function renderFounderDashboardPage({
  currentUser,
  founderStartups = [],
  applications = [],
  team = null
}) {
  const pendingApps = applications.filter(a => a.status === 'PENDING');
  const founderName = currentUser?.name || 'Founder';

  return `
    <div class="founder-dashboard-page">
      <!-- Dashboard Header -->
      <div class="section-header" style="margin-bottom: 24px;">
        <div>
          <h1 class="dashboard-greeting">Welcome, ${escapeHtml(founderName)}! 🚀</h1>
          <p class="dashboard-subtitle">Manage your startups, review talent applications, and build your team.</p>
        </div>
        <button 
          id="founder-create-startup-btn"
          class="btn btn-primary"
        >
          + Create New Startup
        </button>
      </div>

      <!-- Stats Summary Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">My Startups</span>
          <span class="stat-value">${founderStartups.length}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Pending Applications</span>
          <span class="stat-value" style="color: ${pendingApps.length > 0 ? '#B45309' : 'inherit'};">
            ${pendingApps.length}
          </span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Applications</span>
          <span class="stat-value">${applications.length}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Team Formation</span>
          <span class="stat-value" style="font-size: 1.2rem; color: ${team ? '#15803D' : 'var(--text-secondary)'};">
            ${team ? `${team.members?.length || 1} Members` : 'Building Team'}
          </span>
        </div>
      </div>

      <!-- Pending Applications Alert Banner -->
      ${pendingApps.length > 0 ? `
        <div style="margin-bottom: 36px;">
          <div class="section-header">
            <h2 class="section-title">📬 Action Required: New Applications (${pendingApps.length})</h2>
            <button id="view-all-apps-btn" class="btn btn-outline btn-sm">
              View All Applications &rarr;
            </button>
          </div>

          <div class="cards-grid">
            ${pendingApps.slice(0, 3).map(app => renderApplicationCard({
              application: app,
              isFounder: true
            })).join('')}
          </div>
        </div>
      ` : ''}

      <!-- My Startups Listing -->
      <div class="section-header">
        <h2 class="section-title">My Created Startups</h2>
      </div>

      ${founderStartups.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">💡</div>
          <h3 class="empty-title">You have not posted any startups yet</h3>
          <p style="margin-bottom: 16px;">Start your journey by posting your startup idea and listing the roles you need.</p>
          <button id="create-first-startup-btn" class="btn btn-primary">
            + Create Your First Startup
          </button>
        </div>
      ` : `
        <div class="cards-grid">
          ${founderStartups.map(st => renderStartupCard({
            startup: st,
            showApplyButton: false
          })).join('')}
        </div>
      `}
    </div>
  `;
}

export function initFounderDashboardEvents({
  founderStartups = [],
  applications = [],
  onNavigate,
  onViewDetails,
  onAcceptApplication,
  onRejectApplication
}) {
  const createBtn = document.getElementById('founder-create-startup-btn');
  if (createBtn) createBtn.onclick = () => onNavigate('create-startup');

  const createFirstBtn = document.getElementById('create-first-startup-btn');
  if (createFirstBtn) createFirstBtn.onclick = () => onNavigate('create-startup');

  const viewAllAppsBtn = document.getElementById('view-all-apps-btn');
  if (viewAllAppsBtn) viewAllAppsBtn.onclick = () => onNavigate('applications');

  // Handle application actions & startup card actions
  document.addEventListener('click', (e) => {
    const appBtn = e.target.closest('[data-app-action]');
    if (appBtn) {
      const action = appBtn.getAttribute('data-app-action');
      const appId = Number(appBtn.getAttribute('data-id'));
      if (action === 'accept') {
        onAcceptApplication(appId);
      } else if (action === 'reject') {
        onRejectApplication(appId);
      }
      return;
    }

    const cardBtn = e.target.closest('[data-card-action]');
    if (cardBtn) {
      const action = cardBtn.getAttribute('data-card-action');
      const stId = Number(cardBtn.getAttribute('data-id'));
      const st = founderStartups.find(s => Number(s.id) === stId);
      if (st && action === 'details') {
        onViewDetails(st);
      }
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
