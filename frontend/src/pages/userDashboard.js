import { renderStartupCard } from '../components/startupCard.js';
import { calculateSkillCompatibility } from '../utils/skillMatcher.js';

/**
 * UserDashboard Page (Vanilla JS)
 * Displays personalized recommendations based on rule-based skill matching,
 * stats summary, search, and category filtering.
 */
const categories = ['ALL', 'CleanTech', 'EdTech', 'HealthTech', 'FinTech', 'AI/ML', 'SaaS', 'General'];

export function renderUserDashboardPage({
  currentUser,
  startups = [],
  applications = [],
  savedStartups = [],
  team = null,
  startupsError = null
}) {
  const userSkills = currentUser?.skills || '';
  const userName = currentUser?.name || 'Student';

  // Calculate skill compatibility & rank top 3 recommendations
  const recommendedStartups = startups
    .map(st => {
      const compat = calculateSkillCompatibility(userSkills, st.requiredSkills);
      return { ...st, _compat: compat };
    })
    .filter(st => st._compat.percent > 0)
    .sort((a, b) => b._compat.percent - a._compat.percent)
    .slice(0, 3);

  const hasUserApplied = (startupId) => {
    return applications.some(app => app.startup?.id === startupId || app.startupId === startupId);
  };

  const isStartupSaved = (startupId) => {
    return savedStartups.some(s => s.id === startupId || s.startupId === startupId);
  };

  return `
    <div class="user-dashboard-page">
      <div class="dashboard-header">
        <h1 class="dashboard-greeting">Welcome back, ${escapeHtml(userName)}! 👋</h1>
        <p class="dashboard-subtitle">
          Explore startup projects matching your skills and join emerging teams.
        </p>
      </div>

      ${startupsError ? `
        <div class="alert alert-error" style="margin-bottom: 20px;">
          ⚠️ <strong>Service Connection Warning:</strong> ${escapeHtml(startupsError)}
        </div>
      ` : ''}

      <!-- Stats Summary Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Available Startups</span>
          <span class="stat-value">${startups.length}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">My Applications</span>
          <span class="stat-value">${applications.length}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Saved Projects</span>
          <span class="stat-value">${savedStartups.length}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Team Status</span>
          <span class="stat-value" style="font-size: 1.2rem; color: ${team ? '#16A34A' : 'var(--text-secondary)'};">
            ${team ? 'Active Member ✓' : 'Looking for Team'}
          </span>
        </div>
      </div>

      <!-- Recommended Startups Section -->
      <div style="margin-bottom: 40px;">
        <div class="section-header">
          <div>
            <h2 class="section-title">⚡ Recommended for Your Skills</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
              ${userSkills ? `Based on your skills: ${escapeHtml(userSkills)}` : 'Add skills in your Profile to unlock automatic recommendations.'}
            </p>
          </div>
        </div>

        ${recommendedStartups.length > 0 ? `
          <div class="cards-grid">
            ${recommendedStartups.map(st => renderStartupCard({
              startup: st,
              userSkills,
              isSaved: isStartupSaved(st.id),
              hasApplied: hasUserApplied(st.id)
            })).join('')}
          </div>
        ` : `
          <div class="empty-state" style="margin: 0; padding: 24px 16px;">
            <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0;">
              No startup matches your current skills yet.
            </p>
          </div>
        `}
      </div>

      <!-- All Startups Listing & Search Bar -->
      <div class="section-header">
        <h2 class="section-title">Explore All Startups</h2>

        <div class="filters-bar">
          <input 
            type="text"
            id="startups-search-input"
            class="search-input"
            placeholder="Search title, skills, roles..."
          />

          <select 
            id="startups-category-select"
            class="form-select"
            style="padding: 8px 12px; font-size: 0.88rem;"
          >
            ${categories.map(c => `
              <option value="${c}">${c === 'ALL' ? 'All Categories' : c}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div id="all-startups-grid-container">
        ${renderAllStartupsGrid(startups, userSkills, applications, savedStartups, startupsError)}
      </div>
    </div>
  `;
}

function renderAllStartupsGrid(startups, userSkills, applications, savedStartups, startupsError, filterTerm = '', filterCategory = 'ALL') {
  const hasUserApplied = (startupId) => {
    return applications.some(app => app.startup?.id === startupId || app.startupId === startupId);
  };

  const isStartupSaved = (startupId) => {
    return savedStartups.some(s => s.id === startupId || s.startupId === startupId);
  };

  const term = (filterTerm || '').toLowerCase().trim();
  const category = (filterCategory || 'ALL').toLowerCase();

  const filtered = startups.filter(st => {
    const matchesSearch = !term ||
      (st.title && st.title.toLowerCase().includes(term)) ||
      (st.shortDescription && st.shortDescription.toLowerCase().includes(term)) ||
      (st.description && st.description.toLowerCase().includes(term)) ||
      (st.requiredSkills && st.requiredSkills.toLowerCase().includes(term)) ||
      (st.requiredRoles && st.requiredRoles.toLowerCase().includes(term));

    const matchesCategory = category === 'all' || (st.category && st.category.toLowerCase() === category);

    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">
          ${startupsError ? 'Unable to load startups' : 'No startups found'}
        </h3>
        <p>
          ${startupsError 
            ? 'Please check your backend connection or refresh the page.' 
            : 'Try clearing your search filters or check back once founders post new ideas.'}
        </p>
      </div>
    `;
  }

  return `
    <div class="cards-grid">
      ${filtered.map(st => renderStartupCard({
        startup: st,
        userSkills,
        isSaved: isStartupSaved(st.id),
        hasApplied: hasUserApplied(st.id)
      })).join('')}
    </div>
  `;
}

export function initUserDashboardEvents({
  startups = [],
  currentUser,
  applications = [],
  savedStartups = [],
  startupsError = null,
  onViewDetails,
  onApply,
  onSave
}) {
  const searchInput = document.getElementById('startups-search-input');
  const catSelect = document.getElementById('startups-category-select');
  const gridContainer = document.getElementById('all-startups-grid-container');
  const userSkills = currentUser?.skills || '';

  const handleFilterChange = () => {
    const term = searchInput?.value || '';
    const cat = catSelect?.value || 'ALL';
    if (gridContainer) {
      gridContainer.innerHTML = renderAllStartupsGrid(startups, userSkills, applications, savedStartups, startupsError, term, cat);
    }
  };

  if (searchInput) searchInput.oninput = handleFilterChange;
  if (catSelect) catSelect.onchange = handleFilterChange;

  // Delegate actions on all startup cards in page
  document.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-card-action]');
    if (!actionBtn) return;

    const action = actionBtn.getAttribute('data-card-action');
    const id = Number(actionBtn.getAttribute('data-id'));
    const startup = startups.find(s => Number(s.id) === id);
    if (!startup) return;

    if (action === 'details') {
      onViewDetails(startup);
    } else if (action === 'apply') {
      onApply(startup);
    } else if (action === 'save') {
      onSave(startup);
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
