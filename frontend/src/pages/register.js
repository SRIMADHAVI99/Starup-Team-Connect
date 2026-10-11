import { renderStartupTeamLogo } from '../components/logo.js';
import { renderLoginTabs } from '../components/loginTabs.js';
import { showModal } from '../components/modal.js';


/**
 * Register Page (Vanilla JS)
 * Role-based account registration with dynamic field sets for Users and Founders.
 */
export function renderRegisterPage({ initialRole = 'user' } = {}) {
  return `
    <div class="auth-wrapper">
      <div class="auth-card" style="max-width: 520px;">
        <div class="auth-header">
          <div class="auth-logo" style="display:flex;justify-content:center;margin-bottom:8px;">
            ${renderStartupTeamLogo({ size: 42, showText: true })}
          </div>
          <p id="register-subtitle" class="auth-subtitle">Create your ${initialRole === 'user' ? 'User' : 'Founder'} account</p>
        </div>

        <div id="register-tabs-mount">
          ${renderLoginTabs(initialRole)}
        </div>

        <div id="register-error-alert" class="alert alert-error" style="display:none;"></div>
        <div id="register-success-alert" class="alert alert-success" style="display:none;"></div>

        <form id="register-form">
          <div class="form-group">
            <label class="form-label" for="reg-name">Full Name *</label>
            <input 
              type="text" 
              id="reg-name"
              class="form-input" 
              placeholder="Enter your full name"
              required 
            />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="reg-email">Email Address *</label>
              <input 
                type="email" 
                id="reg-email"
                class="form-input" 
                placeholder="Enter your email address"
                required 
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-password">Password *</label>
              <input 
                type="password" 
                id="reg-password"
                class="form-input" 
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <!-- Dynamic Role Fields Mount -->
          <div id="register-role-fields">
            ${renderRoleSpecificFields(initialRole)}
          </div>

          <button 
            type="submit" 
            id="register-submit-btn"
            class="btn btn-primary btn-full"
            style="margin-top: 8px;"
          >
            Register as ${initialRole === 'user' ? 'User' : 'Founder'}
          </button>
        </form>

        <div class="auth-mode-switch">
          <span>Already have an account?</span>
          <button 
            type="button" 
            id="switch-to-login-btn"
            class="auth-mode-link"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderRoleSpecificFields(role) {
  if (role === 'user') {
    return `
      <div class="form-group">
        <label class="form-label" for="reg-skills">Skills (comma-separated) *</label>
        <input 
          type="text" 
          id="reg-skills"
          class="form-input" 
          placeholder="e.g. Java, SQL, HTML, CSS"
          required 
        />
        <span class="form-hint">Used for matching your compatibility with startup roles.</span>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="reg-experience">Experience Level</label>
          <select id="reg-experience" class="form-select">
            <option value="">Select experience level</option>
            <option value="Beginner" selected>Beginner (Student / Fresher)</option>
            <option value="Intermediate">Intermediate (1-2 Projects)</option>
            <option value="Experienced">Experienced (Advanced)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-education">Education / Branch</label>
          <input 
            type="text" 
            id="reg-education"
            class="form-input" 
            placeholder="e.g. B.Tech CSE, 3rd Year"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="reg-bio">Short Bio</label>
        <textarea 
          id="reg-bio"
          class="form-textarea" 
          rows="2"
          placeholder="Tell founders what you are passionate about..."
        ></textarea>
      </div>
    `;
  } else {
    return `
      <div class="form-group">
        <label class="form-label" for="reg-interests">Startup Focus / Interests</label>
        <input 
          type="text" 
          id="reg-interests"
          class="form-input" 
          placeholder="CleanTech, EdTech, SaaS, AI/ML"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="reg-founder-exp">Founder Experience</label>
        <input 
          type="text" 
          id="reg-founder-exp"
          class="form-input" 
          placeholder="e.g. First-time Founder / Product Builder"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="reg-founder-bio">Founder Bio / Vision</label>
        <textarea 
          id="reg-founder-bio"
          class="form-textarea" 
          rows="2"
          placeholder="Share a brief overview of your startup vision..."
        ></textarea>
      </div>
    `;
  }
}

export function initRegisterPageEvents({ apiBaseUrl, onRegisterSuccess, onSwitchToLogin, initialRole = 'user' }) {
  let activeRole = initialRole;

  const tabsMount = document.getElementById('register-tabs-mount');
  const roleFieldsMount = document.getElementById('register-role-fields');
  const subtitle = document.getElementById('register-subtitle');
  const submitBtn = document.getElementById('register-submit-btn');
  const errorAlert = document.getElementById('register-error-alert');
  const successAlert = document.getElementById('register-success-alert');
  const switchBtn = document.getElementById('switch-to-login-btn');
  const form = document.getElementById('register-form');

  const updateRoleUI = (newRole) => {
    activeRole = newRole;
    if (tabsMount) tabsMount.innerHTML = renderLoginTabs(activeRole);
    if (roleFieldsMount) roleFieldsMount.innerHTML = renderRoleSpecificFields(activeRole);
    if (subtitle) subtitle.innerText = `Create your ${activeRole === 'user' ? 'User' : 'Founder'} account`;
    if (submitBtn) submitBtn.innerText = `Register as ${activeRole === 'user' ? 'User' : 'Founder'}`;
    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.innerText = '';
    }
    if (successAlert) {
      successAlert.style.display = 'none';
      successAlert.innerText = '';
    }
  };

  if (tabsMount) {
    tabsMount.onclick = (e) => {
      const btn = e.target.closest('[data-role]');
      if (btn) {
        const role = btn.getAttribute('data-role');
        if (role && role !== activeRole) {
          updateRoleUI(role);
        }
      }
    };
  }

  if (switchBtn) {
    switchBtn.onclick = () => {
      onSwitchToLogin(activeRole);
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const name = document.getElementById('reg-name')?.value.trim();
      const email = document.getElementById('reg-email')?.value.trim();
      const password = document.getElementById('reg-password')?.value;

      if (!name || !email || !password) {
        if (errorAlert) {
          errorAlert.innerText = 'Please complete all required fields.';
          errorAlert.style.display = 'block';
        }
        return;
      }

      let payload = {};

      if (activeRole === 'user') {
        const skills = document.getElementById('reg-skills')?.value.trim();
        const experience = document.getElementById('reg-experience')?.value || 'Beginner';
        const education = document.getElementById('reg-education')?.value.trim();
        const bio = document.getElementById('reg-bio')?.value.trim();

        if (!skills) {
          if (errorAlert) {
            errorAlert.innerText = 'Please provide your skills for role matching.';
            errorAlert.style.display = 'block';
          }
          return;
        }

        payload = {
          name,
          email,
          password,
          skills,
          experience,
          education,
          bio
        };
      } else {
        const interests = document.getElementById('reg-interests')?.value.trim();
        const experience = document.getElementById('reg-founder-exp')?.value.trim();
        const bio = document.getElementById('reg-founder-bio')?.value.trim();

        payload = {
          name,
          email,
          password,
          interests,
          experience,
          bio
        };
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating Account...';
      }
      if (errorAlert) errorAlert.style.display = 'none';
      if (successAlert) successAlert.style.display = 'none';

      try {
        const endpoint = activeRole === 'user' 
          ? `${apiBaseUrl}/api/users/register` 
          : `${apiBaseUrl}/api/founders/register`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (successAlert) {
            successAlert.innerText = 'Account created successfully! Logging you in...';
            successAlert.style.display = 'block';
          }
          setTimeout(() => {
            onRegisterSuccess(data, activeRole);
          }, 700);
        } else {
          const errText = await res.text();
          const msg = errText || 'Registration failed. Please try again.';
          if (errorAlert) {
            errorAlert.innerText = msg;
            errorAlert.style.display = 'block';
          }
          showModal('Registration Failed', msg, 'error');
        }
      } catch (err) {
        const msg = 'Unable to connect to the server. Please try again.';
        if (errorAlert) {
          errorAlert.innerText = msg;
          errorAlert.style.display = 'block';
        }
        showModal('Connection Error', msg, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = `Register as ${activeRole === 'user' ? 'User' : 'Founder'}`;
        }
      }
    };
  }
}
