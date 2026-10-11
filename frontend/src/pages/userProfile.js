/**
 * UserProfile Page (Vanilla JS)
 * Profile maintenance for users: skills, education, experience level, portfolio.
 */
export function renderUserProfilePage({ currentUser }) {
  return `
    <div class="user-profile-page">
      <div class="section-header" style="max-width: 720px; margin: 0 auto 20px auto;">
        <div>
          <h1 class="section-title" style="font-size: 1.6rem;">User Profile</h1>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">
            Keep your skills and experience up to date to get matched with the right startups.
          </p>
        </div>
      </div>

      <div class="form-card" style="max-width: 720px;">
        <div id="user-profile-success-alert" class="alert alert-success" style="display:none;"></div>
        <div id="user-profile-error-alert" class="alert alert-error" style="display:none;"></div>

        <form id="user-profile-form">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="user-profile-name">Full Name *</label>
              <input 
                type="text" 
                id="user-profile-name"
                class="form-input" 
                placeholder="Enter your full name"
                value="${escapeHtml(currentUser?.name || '')}" 
                required 
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="user-profile-email">Email Address</label>
              <input 
                type="email" 
                id="user-profile-email"
                class="form-input" 
                value="${escapeHtml(currentUser?.email || '')}" 
                disabled 
                style="background: var(--bg-subtle); cursor: not-allowed;"
              />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="user-profile-phone">Phone Number (Optional)</label>
              <input 
                type="text" 
                id="user-profile-phone"
                class="form-input" 
                placeholder="Enter your phone number"
                value="${escapeHtml(currentUser?.phone || '')}" 
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="user-profile-education">Education / College</label>
              <input 
                type="text" 
                id="user-profile-education"
                class="form-input" 
                placeholder="e.g. B.Tech CSE, 3rd Year"
                value="${escapeHtml(currentUser?.education || '')}" 
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="user-profile-skills">Technical Skills * (comma-separated)</label>
            <input 
              type="text" 
              id="user-profile-skills"
              class="form-input" 
              placeholder="e.g. Java, SQL, HTML, CSS, React, Python"
              value="${escapeHtml(currentUser?.skills || '')}" 
              required 
            />
            <span class="form-hint">Used for automatic rule-based candidate matching.</span>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="user-profile-experience">Experience Level</label>
              <select id="user-profile-experience" class="form-select">
                <option value="Beginner" ${currentUser?.experience === 'Beginner' ? 'selected' : ''}>Beginner (Student / Fresher)</option>
                <option value="Intermediate" ${currentUser?.experience === 'Intermediate' ? 'selected' : ''}>Intermediate (1-2 Projects)</option>
                <option value="Experienced" ${currentUser?.experience === 'Experienced' ? 'selected' : ''}>Experienced (Advanced)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="user-profile-portfolio">Portfolio / GitHub Link</label>
              <input 
                type="url" 
                id="user-profile-portfolio"
                class="form-input" 
                placeholder="e.g. https://github.com/yourusername"
                value="${escapeHtml(currentUser?.portfolioLink || '')}" 
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="user-profile-bio">Bio / About Me</label>
            <textarea 
              id="user-profile-bio"
              class="form-textarea" 
              rows="3" 
              placeholder="Tell us about your interests and project experience"
            >${escapeHtml(currentUser?.bio || '')}</textarea>
          </div>

          <button type="submit" id="save-user-profile-btn" class="btn btn-primary">
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  `;
}

export function initUserProfileEvents({ currentUser, onUpdateProfile, apiBaseUrl }) {
  const form = document.getElementById('user-profile-form');
  const successAlert = document.getElementById('user-profile-success-alert');
  const errorAlert = document.getElementById('user-profile-error-alert');
  const saveBtn = document.getElementById('save-user-profile-btn');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (successAlert) successAlert.style.display = 'none';
      if (errorAlert) errorAlert.style.display = 'none';

      const name = document.getElementById('user-profile-name')?.value.trim();
      const phone = document.getElementById('user-profile-phone')?.value.trim();
      const education = document.getElementById('user-profile-education')?.value.trim();
      const skills = document.getElementById('user-profile-skills')?.value.trim();
      const experience = document.getElementById('user-profile-experience')?.value;
      const portfolioLink = document.getElementById('user-profile-portfolio')?.value.trim();
      const bio = document.getElementById('user-profile-bio')?.value.trim();

      const updated = {
        ...currentUser,
        name,
        phone,
        skills,
        experience,
        education,
        bio,
        portfolioLink
      };

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = 'Saving...';
      }

      if (currentUser?.id) {
        try {
          const token = currentUser?.token || localStorage.getItem('stc_token');
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const res = await fetch(`${apiBaseUrl}/api/users/${currentUser.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updated)
          });
          if (res.ok) {
            const savedData = await res.json();
            onUpdateProfile(savedData);
            if (successAlert) {
              successAlert.innerText = 'Profile updated successfully!';
              successAlert.style.display = 'block';
            }
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.innerText = 'Save Profile Changes';
            }
            return;
          }
        } catch (err) {
          console.warn('Backend update error:', err);
        }
      }

      onUpdateProfile(updated);
      if (successAlert) {
        successAlert.innerText = 'Profile updated successfully!';
        successAlert.style.display = 'block';
      }
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Profile Changes';
      }
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
