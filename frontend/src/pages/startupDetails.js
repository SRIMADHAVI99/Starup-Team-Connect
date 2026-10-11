import { calculateSkillCompatibility, parseRoles, parseSkills } from '../utils/skillMatcher.js';

/**
 * StartupDetails Page (Vanilla JS)
 * Detailed breakdown of startup problem, solution, open roles,
 * skill compatibility matching score, and join application form.
 */
export function renderStartupDetailsPage({
  startup,
  currentUser,
  currentRole,
  isSaved = false,
  hasApplied = false
}) {
  if (!startup) {
    return `
      <div class="empty-state">
        <h3>Startup not found</h3>
        <button id="back-to-listings-btn" class="btn btn-outline">Back to listings</button>
      </div>
    `;
  }

  const rolesList = parseRoles(startup.requiredRoles);
  const reqSkillsList = parseSkills(startup.requiredSkills);
  const userSkills = currentUser?.skills || '';
  const compat = calculateSkillCompatibility(userSkills, startup.requiredSkills);
  const userSkillsList = parseSkills(userSkills);

  return `
    <div class="startup-details-page">
      <div style="margin-bottom: 20px;">
        <button id="back-btn" class="btn btn-outline btn-sm">
          &larr; Back to Startups
        </button>
      </div>

      <div class="details-layout">
        <!-- Left Column: Story, Problem & Solution -->
        <div class="details-main">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
            <div>
              <span class="badge badge-skill" style="margin-bottom: 8px;">
                ${escapeHtml(startup.category || 'Startup')}
              </span>
              <h1 style="font-size: 1.7rem; color: var(--text-primary); font-weight: 800;">
                ${escapeHtml(startup.title)}
              </h1>
              <p style="color: var(--text-secondary); font-size: 0.92rem;">
                Led by Founder: <strong>${escapeHtml(startup.founderName || 'Startup Founder')}</strong>
              </p>
            </div>

            ${currentRole === 'user' ? `
              <button 
                id="details-save-btn"
                class="btn-icon-save ${isSaved ? 'saved' : ''}"
                style="padding: 8px 14px; font-size: 1.05rem;"
                title="${isSaved ? 'Saved' : 'Save this startup'}"
              >
                ${isSaved ? '♥ Saved' : '♡ Save'}
              </button>
            ` : ''}
          </div>

          <p style="font-size: 1rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 24px;">
            ${escapeHtml(startup.shortDescription || startup.description || '')}
          </p>

          <!-- Problem Statement -->
          <div style="margin-bottom: 22px;">
            <h3 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 700;">
              🎯 The Problem
            </h3>
            <p style="color: var(--text-secondary); line-height: 1.55; background: var(--bg-subtle); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-md); font-size: 0.9rem;">
              ${escapeHtml(startup.problemStatement || 'This startup addresses inefficiency and lack of modern digital tools in the current ecosystem.')}
            </p>
          </div>

          <!-- Solution -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 700;">
              💡 The Solution
            </h3>
            <p style="color: var(--text-secondary); line-height: 1.55; background: var(--bg-subtle); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-md); font-size: 0.9rem;">
              ${escapeHtml(startup.solution || 'Building a lightweight, scalable collaborative web platform with smart workflow management.')}
            </p>
          </div>

          <!-- Open Roles -->
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 10px; font-weight: 700;">
              👥 Open Roles
            </h3>
            <div class="tags-wrap">
              ${rolesList.map(role => `
                <span class="badge badge-role" style="padding: 6px 14px; font-size: 0.86rem;">
                  ${escapeHtml(role)}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="details-sidebar">
          ${currentRole === 'user' ? `
            <!-- Skill Compatibility Card -->
            <div class="details-box">
              <h4 style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 10px; font-weight: 700;">
                Skill Compatibility
              </h4>
              <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
                <span style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">
                  ${compat.percent}%
                </span>
                <span style="font-size: 0.82rem; color: var(--text-secondary);">
                  (${compat.matchedCount} of ${reqSkillsList.length} skills matched)
                </span>
              </div>

              ${compat.matchedSkills.length > 0 ? `
                <div style="font-size: 0.8rem; color: var(--text-primary); margin-bottom: 12px; font-weight: 600;">
                  Matched: ${escapeHtml(compat.matchedSkills.join(', '))}
                </div>
              ` : ''}

              <div style="font-size: 0.8rem; color: var(--text-secondary);">
                <strong>Required skills:</strong>
                <div class="tags-wrap" style="margin-top: 6px;">
                  ${reqSkillsList.map(skill => {
                    const isMatched = userSkillsList.includes(skill.toLowerCase());
                    return `
                      <span class="badge ${isMatched ? 'badge-accepted' : 'badge-skill'}">
                        ${escapeHtml(skill)} ${isMatched ? '✓' : ''}
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Apply Form Box -->
            <div class="details-box">
              <h4 style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 12px; font-weight: 700;">
                Apply to Join Team
              </h4>

              ${hasApplied ? `
                <div class="alert alert-success" style="margin: 0; font-size: 0.85rem;">
                  ✓ You have already applied for this startup! You can track your status in <strong>My Applications</strong>.
                </div>
              ` : `
                <form id="apply-form">
                  <div class="form-group">
                    <label class="form-label" for="apply-role-select">Select Role to Apply For:</label>
                    <select id="apply-role-select" class="form-select">
                      ${(rolesList.length > 0 ? rolesList : ['Developer']).map(r => `
                        <option value="${escapeHtml(r)}">${escapeHtml(r)}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="apply-note-textarea">Short Note for Founder (optional):</label>
                    <textarea 
                      id="apply-note-textarea"
                      class="form-textarea"
                      rows="2"
                      placeholder="Why would you like to contribute to this startup?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    id="submit-apply-btn"
                    class="btn btn-primary btn-full"
                  >
                    Apply to Join
                  </button>
                </form>
              `}
            </div>
          ` : `
            <div class="details-box">
              <h4 style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 8px; font-weight: 700;">
                Founder View
              </h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">
                Target team size: <strong>${escapeHtml(startup.teamSize || '3-5')}</strong>
              </p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

export function initStartupDetailsEvents({
  startup,
  onApply,
  onSave,
  onBack
}) {
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.onclick = onBack;

  const backToListingsBtn = document.getElementById('back-to-listings-btn');
  if (backToListingsBtn) backToListingsBtn.onclick = onBack;

  const saveBtn = document.getElementById('details-save-btn');
  if (saveBtn && startup) {
    saveBtn.onclick = () => onSave(startup);
  }

  const applyForm = document.getElementById('apply-form');
  if (applyForm && startup) {
    applyForm.onsubmit = (e) => {
      e.preventDefault();
      const roleSelect = document.getElementById('apply-role-select');
      const noteInput = document.getElementById('apply-note-textarea');
      const submitBtn = document.getElementById('submit-apply-btn');

      const selectedRole = roleSelect?.value || 'Developer';
      const note = noteInput?.value.trim() || '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';
      }

      onApply(startup, selectedRole, note);
    };
  }
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
