/**
 * LoginTabs Component (Vanilla JS)
 * Role switcher between User and Founder with descriptions.
 */
export function renderLoginTabs(activeRole = 'user') {
  return `
    <div class="login-tabs-container">
      <div class="role-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected="${activeRole === 'user'}"
          class="role-tab-btn ${activeRole === 'user' ? 'active' : ''}"
          data-role="user"
        >
          <span>👤</span> User
        </button>

        <button
          type="button"
          role="tab"
          aria-selected="${activeRole === 'founder'}"
          class="role-tab-btn ${activeRole === 'founder' ? 'active' : ''}"
          data-role="founder"
        >
          <span>🚀</span> Founder
        </button>
      </div>

      <div class="role-tagline">
        ${activeRole === 'user' ? `
          <div>
            <strong>User Account:</strong> Find startup opportunities, showcase your skills, and join ambitious teams.
          </div>
        ` : `
          <div>
            <strong>Founder Account:</strong> Post your startup idea, review applicants, and build your dream team with skilled people.
          </div>
        `}
      </div>
    </div>
  `;
}
