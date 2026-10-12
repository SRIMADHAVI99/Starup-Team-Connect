import { calculateSkillCompatibility, parseRoles, parseSkills } from '../utils/skillMatcher.js';

/**
 * StartupCard Component (Vanilla JS)
 * Displays a startup opportunity with skill matching and action buttons.
 */
export function renderStartupCard({
  startup,
  userSkills = '',
  isSaved = false,
  hasApplied = false,
  showApplyButton = true,
  showSaveButton = true
}) {
  const compatibility = userSkills && startup?.requiredSkills 
    ? calculateSkillCompatibility(userSkills, startup.requiredSkills)
    : null;

  const skillsList = parseSkills(startup?.requiredSkills);
  const rolesList = parseRoles(startup?.requiredRoles);

  return `
    <div class="startup-card" data-startup-id="${startup.id}">
      <div>
        <div class="startup-card-header">
          <h3 class="startup-title">${escapeHtml(startup.title)}</h3>
          ${startup.category ? `
            <span class="startup-category">${escapeHtml(startup.category)}</span>
          ` : ''}
        </div>

        <p class="startup-desc">${escapeHtml(startup.shortDescription || startup.description || '')}</p>

        ${startup.founderName ? `
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 10px; font-weight: 500;">
            Founder: <strong style="color: var(--text-primary);">${escapeHtml(startup.founderName)}</strong>
          </div>
        ` : ''}

        ${compatibility !== null ? `
          <div class="compatibility-pill">
            <span>✨ ${compatibility.percent}% Skill Match</span>
            <span style="font-size: 0.75rem; opacity: 0.85;">
              (${compatibility.matchedCount}/${compatibility.totalCount} skills)
            </span>
          </div>
        ` : ''}

        ${rolesList.length > 0 ? `
          <div class="startup-meta-group">
            <div class="startup-meta-label">Looking for</div>
            <div class="tags-wrap">
              ${rolesList.map(role => `
                <span class="badge badge-role">${escapeHtml(role)}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${skillsList.length > 0 ? `
          <div class="startup-meta-group">
            <div class="startup-meta-label">Required Skills</div>
            <div class="tags-wrap">
              ${skillsList.map(skill => `
                <span class="badge badge-skill">${escapeHtml(skill)}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="startup-card-actions">
        <button 
          class="btn btn-outline btn-sm"
          style="flex: 1;"
          data-card-action="details"
          data-id="${startup.id}"
        >
          View Details
        </button>

        ${showApplyButton ? `
          <button 
            class="btn btn-sm ${hasApplied ? 'btn-secondary' : 'btn-primary'}"
            style="flex: 1;"
            ${hasApplied ? 'disabled' : ''}
            data-card-action="apply"
            data-id="${startup.id}"
          >
            ${hasApplied ? 'Applied ✓' : 'Apply'}
          </button>
        ` : ''}

        ${showSaveButton ? `
          <button 
            class="btn-icon-save ${isSaved ? 'saved' : ''}"
            title="${isSaved ? 'Saved' : 'Save Startup'}"
            data-card-action="save"
            data-id="${startup.id}"
          >
            ${isSaved ? '♥' : '♡'}
          </button>
        ` : ''}
      </div>
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
