import { renderStartupTeamLogo } from '../components/logo.js';
import { renderLoginTabs } from '../components/loginTabs.js';
import { showModal } from '../components/modal.js';


/**
 * Login Page (Vanilla JS)
 * Role-based authentication for Users and Founders with tab switching.
 */
export function renderLoginPage({ initialRole = 'user' } = {}) {
  return `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo" style="display:flex;justify-content:center;margin-bottom:8px;">
            ${renderStartupTeamLogo({ size: 42, showText: true })}
          </div>
          <p class="auth-subtitle">Sign in to your account</p>
        </div>

        <div id="login-tabs-mount">
          ${renderLoginTabs(initialRole)}
        </div>

        <div id="login-error-alert" class="alert alert-error" style="display:none;"></div>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              class="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            id="login-submit-btn"
            class="btn btn-primary btn-full"
            style="margin-top: 12px;"
          >
            Sign In as ${initialRole === 'user' ? 'User' : 'Founder'}
          </button>
        </form>

        <div class="auth-mode-switch">
          <span>Don't have an account?</span>
          <button 
            type="button" 
            id="switch-to-register-btn"
            class="auth-mode-link"
          >
            Create ${initialRole === 'user' ? 'User' : 'Founder'} Account
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initLoginPageEvents({ apiBaseUrl, onLoginSuccess, onSwitchToRegister, initialRole = 'user' }) {
  let activeRole = initialRole;

  const tabsMount = document.getElementById('login-tabs-mount');
  const errorAlert = document.getElementById('login-error-alert');
  const form = document.getElementById('login-form');
  const submitBtn = document.getElementById('login-submit-btn');
  const switchBtn = document.getElementById('switch-to-register-btn');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  const updateRoleUI = (newRole) => {
    activeRole = newRole;
    if (tabsMount) tabsMount.innerHTML = renderLoginTabs(activeRole);
    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.innerText = '';
    }
    if (submitBtn) {
      submitBtn.innerText = `Sign In as ${activeRole === 'user' ? 'User' : 'Founder'}`;
    }
    if (switchBtn) {
      switchBtn.innerText = `Create ${activeRole === 'user' ? 'User' : 'Founder'} Account`;
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
      onSwitchToRegister(activeRole);
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = emailInput?.value.trim();
      const password = passwordInput?.value;

      if (!email || !password) {
        if (errorAlert) {
          errorAlert.innerText = 'Please enter both email and password.';
          errorAlert.style.display = 'block';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Signing In...';
      }
      if (errorAlert) {
        errorAlert.style.display = 'none';
        errorAlert.innerText = '';
      }

      try {
        const endpoint = activeRole === 'user' 
          ? `${apiBaseUrl}/api/users/login` 
          : `${apiBaseUrl}/api/founders/login`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (res.ok) {
          const data = await res.json();
          onLoginSuccess(data, activeRole);
        } else {
          const errorText = await res.text();
          const msg = errorText || 'Invalid email or password.';
          if (errorAlert) {
            errorAlert.innerText = msg;
            errorAlert.style.display = 'block';
          }
          showModal('Login Failed', msg, 'error');
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
          submitBtn.innerText = `Sign In as ${activeRole === 'user' ? 'User' : 'Founder'}`;
        }
      }
    };
  }
}
