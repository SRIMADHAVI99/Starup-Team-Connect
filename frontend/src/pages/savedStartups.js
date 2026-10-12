import { renderStartupCard } from '../components/startupCard.js';

/**
 * SavedStartups Page (Vanilla JS)
 * Displays user's bookmarked startup opportunities.
 */
export function renderSavedStartupsPage({
  savedStartups = [],
  currentUser,
  applications = []
}) {
  const userSkills = currentUser?.skills || '';

  const hasUserApplied = (startupId) => {
    return applications.some(app => app.startup?.id === startupId || app.startupId === startupId);
  };

  return `
    <div class="saved-startups-page">
      <div class="section-header">
        <div>
          <h1 class="section-title" style="font-size: 1.6rem;">Saved Startups</h1>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">
            Your bookmarked startup opportunities.
          </p>
        </div>
      </div>

      ${savedStartups.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">♡</div>
          <h3 class="empty-title">No Saved Startups</h3>
          <p style="margin-bottom: 16px; color: var(--text-secondary);">
            You haven't saved any startup opportunities yet.
          </p>
          <button id="explore-startups-btn" class="btn btn-primary">
            Explore Startups
          </button>
        </div>
      ` : `
        <div id="saved-startups-grid" class="cards-grid">
          ${savedStartups.map(st => renderStartupCard({
            startup: st,
            userSkills,
            isSaved: true,
            hasApplied: hasUserApplied(st.id)
          })).join('')}
        </div>
      `}
    </div>
  `;
}

export function initSavedStartupsEvents({
  savedStartups = [],
  onNavigate,
  onViewDetails,
  onApply,
  onSave
}) {
  const exploreBtn = document.getElementById('explore-startups-btn');
  if (exploreBtn) exploreBtn.onclick = () => onNavigate('startups');

  const pageContainer = document.querySelector('.saved-startups-page');
  if (pageContainer) {
    pageContainer.onclick = (e) => {
      const actionBtn = e.target.closest('[data-card-action]');
      if (!actionBtn) return;

      const action = actionBtn.getAttribute('data-card-action');
      const id = Number(actionBtn.getAttribute('data-id'));
      const startup = savedStartups.find(s => Number(s.id) === id || Number(s.startupId) === id);
      if (!startup) return;

      if (action === 'details') {
        onViewDetails(startup);
      } else if (action === 'apply') {
        onApply(startup);
      } else if (action === 'save') {
        onSave(startup);
      }
    };
  }
}
