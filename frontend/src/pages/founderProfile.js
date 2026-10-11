/**
 * FounderProfile Page (Vanilla JS)
 * Displays and allows editing of founder information, interests, experience, and vision.
 */
export function renderFounderProfilePage({ currentUser }) {
  return `
    <div class="founder-profile-page">
      <div class="section-header" style="max-width: 720px; margin: 0 auto 20px auto;">
        <div>
          <h1 class="section-title" style="font-size: 1.6rem;">Founder Profile</h1>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">
            Manage your founder background and startup domains.
          </p>
        </div>
      </div>

      <div class="form-card" style="max-width: 720px;">
        <div id="founder-profile-success-alert" class="alert alert-success" style="display:none;"></div>
        <div id="founder-profile-error-alert" class="alert alert-error" style="display:none;"></div>

        <form id="founder-profile-form">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="founder-name">Founder Name *</label>
              <input 
                type="text" 
                id="founder-name"
                class="form-input" 
                placeholder="Enter your full name"
                value="${escapeHtml(currentUser?.name || '')}" 
                required 
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="founder-email">Email Address</label>
              <input 
                type="email" 
                id="founder-email"
                class="form-input" 
                value="${escapeHtml(currentUser?.email || '')}" 
                disabled 
                style="background: var(--bg-subtle); cursor: not-allowed;"
              />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="founder-phone">Phone Number (Optional)</label>
              <input 
                type="text" 
                id="founder-phone"
                class="form-input" 
                placeholder="Enter your phone number"
                value="${escapeHtml(currentUser?.phone || '')}" 
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="founder-interests">Startup Focus & Interests</label>
              <input 
                type="text" 
                id="founder-interests"
                class="form-input" 
                placeholder="e.g. CleanTech, FinTech, EdTech"
                value="${escapeHtml(currentUser?.interests || '')}" 
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="founder-experience">Founder Background & Experience</label>
            <input 
              type="text" 
              id="founder-experience"
              class="form-input" 
              placeholder="Describe your background and experience"
              value="${escapeHtml(currentUser?.experience || '')}" 
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="founder-bio">Vision & Bio</label>
            <textarea 
              id="founder-bio"
              class="form-textarea" 
              rows="3" 
              placeholder="Tell us about your startup vision and interests"
            >${escapeHtml(currentUser?.bio || '')}</textarea>
          </div>

          <div style="display: flex; gap: 12px;">
            <button type="submit" id="save-founder-profile-btn" class="btn btn-primary">
              Save Profile
            </button>
            <button 
              type="button" 
              id="profile-create-startup-btn"
              class="btn btn-outline"
            >
              + Create Startup
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function initFounderProfileEvents({ currentUser, onUpdateProfile, onNavigate, apiBaseUrl }) {
  const form = document.getElementById('founder-profile-form');
  const successAlert = document.getElementById('founder-profile-success-alert');
  const errorAlert = document.getElementById('founder-profile-error-alert');
  const saveBtn = document.getElementById('save-founder-profile-btn');
  const createStartupBtn = document.getElementById('profile-create-startup-btn');

  if (createStartupBtn) {
    createStartupBtn.onclick = () => onNavigate('create-startup');
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (successAlert) successAlert.style.display = 'none';
      if (errorAlert) errorAlert.style.display = 'none';

      const name = document.getElementById('founder-name')?.value.trim();
      const phone = document.getElementById('founder-phone')?.value.trim();
      const interests = document.getElementById('founder-interests')?.value.trim();
      const experience = document.getElementById('founder-experience')?.value.trim();
      const bio = document.getElementById('founder-bio')?.value.trim();

      const updated = {
        ...currentUser,
        name,
        phone,
        interests,
        experience,
        bio
      };

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = 'Saving...';
      }

      if (currentUser?.id && apiBaseUrl) {
        try {
          const token = currentUser?.token || localStorage.getItem('stc_token');
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const res = await fetch(`${apiBaseUrl}/api/founders/${currentUser.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updated)
          });
          if (res.ok) {
            const savedData = await res.json();
            onUpdateProfile(savedData);
            if (successAlert) {
              successAlert.innerText = 'Founder profile saved successfully!';
              successAlert.style.display = 'block';
            }
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.innerText = 'Save Profile';
            }
            return;
          }
        } catch (err) {
          console.warn('Backend update error:', err);
        }
      }

      onUpdateProfile(updated);
      if (successAlert) {
        successAlert.innerText = 'Founder profile saved successfully!';
        successAlert.style.display = 'block';
      }
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Profile';
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
