import { showModal } from '../components/modal.js';

/**
 * CreateStartup Page (Vanilla JS)
 * Allows founders to post a new startup with live title availability check,
 * duplicate validation prevention, role/skills specification.
 */
export function renderCreateStartupPage() {
  return `
    <div class="create-startup-page">
      <div class="section-header" style="max-width: 780px; margin: 0 auto 20px auto;">
        <div>
          <h1 class="section-title" style="font-size: 1.5rem;">Create a New Startup</h1>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            List your project requirements, problem statement, and skills needed.
          </p>
        </div>
        <button id="cancel-create-startup-btn" class="btn btn-outline btn-sm">
          Cancel
        </button>
      </div>

      <div class="form-card">
        <div id="create-startup-error" class="alert alert-error" style="display:none;"></div>

        <form id="create-startup-form">
          <!-- Startup Title with Live Availability Checker -->
          <div class="form-group">
            <label class="form-label" for="startup-title-input">
              Startup Title *
            </label>
            <input
              id="startup-title-input"
              type="text"
              class="form-input"
              placeholder="e.g. HealthConnect"
              required
            />
            <div id="title-availability-msg" class="title-availability-msg default" style="margin-top: 6px; font-size: 0.84rem;">
              Enter a startup title
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="startup-category-select">Category</label>
              <select id="startup-category-select" class="form-select">
                <option value="CleanTech" selected>CleanTech / Environment</option>
                <option value="EdTech">EdTech / Education</option>
                <option value="HealthTech">HealthTech / Healthcare</option>
                <option value="FinTech">FinTech / Finance</option>
                <option value="AI/ML">AI & Machine Learning</option>
                <option value="SaaS">SaaS / Web Software</option>
                <option value="General">General / Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="startup-teamsize-input">Target Team Size</label>
              <input
                id="startup-teamsize-input"
                type="text"
                class="form-input"
                placeholder="e.g. 3-4 members"
                value="3-5 members"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="startup-desc-input">Short Description *</label>
            <input
              id="startup-desc-input"
              type="text"
              class="form-input"
              placeholder="Brief summary of your startup idea and product vision."
              required
            />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="startup-problem-input">Problem Statement</label>
              <textarea
                id="startup-problem-input"
                class="form-textarea"
                rows="3"
                placeholder="What real-world problem does your startup aim to solve?"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="startup-solution-input">Proposed Solution</label>
              <textarea
                id="startup-solution-input"
                class="form-textarea"
                rows="3"
                placeholder="How does your application or product solve this problem?"
              ></textarea>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="startup-roles-input">Required Roles * (comma-separated)</label>
            <input
              id="startup-roles-input"
              type="text"
              class="form-input"
              placeholder="Java Developer, UI Designer, Data Analyst"
              required
            />
            <span class="form-hint">List roles candidates can apply for.</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="startup-skills-input">Required Skills * (comma-separated)</label>
            <input
              id="startup-skills-input"
              type="text"
              class="form-input"
              placeholder="Java, SQL, HTML, CSS"
              required
            />
            <span class="form-hint">Used for automatic rule-based candidate matching.</span>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button 
              type="submit" 
              id="create-startup-submit-btn"
              class="btn btn-primary"
              style="flex: 1;"
            >
              Create Startup & Save
            </button>
            <button 
              type="button" 
              id="cancel-create-startup-btn-2"
              class="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function initCreateStartupEvents({
  currentUser,
  onStartupCreated,
  onCancel,
  apiBaseUrl,
  existingStartups = []
}) {
  const cancelBtn1 = document.getElementById('cancel-create-startup-btn');
  const cancelBtn2 = document.getElementById('cancel-create-startup-btn-2');
  if (cancelBtn1) cancelBtn1.onclick = onCancel;
  if (cancelBtn2) cancelBtn2.onclick = onCancel;

  const titleInput = document.getElementById('startup-title-input');
  const titleMsg = document.getElementById('title-availability-msg');
  const errorAlert = document.getElementById('create-startup-error');
  const form = document.getElementById('create-startup-form');
  const submitBtn = document.getElementById('create-startup-submit-btn');

  let titleStatus = null; // null | 'checking' | 'available' | 'taken'
  let debounceTimer = null;

  const normalizeTitle = (str) => {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ').toLowerCase();
  };

  const updateTitleStatus = (status, message) => {
    titleStatus = status;
    if (titleMsg) {
      titleMsg.className = `title-availability-msg ${status || 'default'}`;
      titleMsg.innerText = message;
    }
  };

  if (titleInput) {
    titleInput.oninput = () => {
      const normalized = normalizeTitle(titleInput.value);
      if (debounceTimer) clearTimeout(debounceTimer);

      if (!normalized || normalized.length < 2) {
        updateTitleStatus('default', 'Enter a startup title');
        return;
      }

      updateTitleStatus('checking', 'Checking title availability...');

      debounceTimer = setTimeout(async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/api/startups/check-title?title=${encodeURIComponent(normalized)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.exists) {
              updateTitleStatus('taken', '⚠️ Startup title already registered. Please choose a different title.');
            } else {
              updateTitleStatus('available', '✓ Startup title is available.');
            }
          } else {
            const exists = existingStartups.some(s => normalizeTitle(s.title) === normalized);
            if (exists) {
              updateTitleStatus('taken', '⚠️ Startup title already registered. Please choose a different title.');
            } else {
              updateTitleStatus('available', '✓ Startup title is available.');
            }
          }
        } catch {
          const exists = existingStartups.some(s => normalizeTitle(s.title) === normalized);
          if (exists) {
            updateTitleStatus('taken', '⚠️ Startup title already registered. Please choose a different title.');
          } else {
            updateTitleStatus('available', '✓ Startup title is available.');
          }
        }
      }, 400);
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (errorAlert) {
        errorAlert.style.display = 'none';
        errorAlert.innerText = '';
      }

      const rawTitle = titleInput?.value || '';
      const normalized = normalizeTitle(rawTitle);

      if (!normalized) {
        if (errorAlert) {
          errorAlert.innerText = 'Please enter a valid startup title.';
          errorAlert.style.display = 'block';
        }
        return;
      }

      if (titleStatus === 'taken') {
        showModal(
          'Startup Already Exists',
          'This startup title is already registered. Please choose a different title.',
          'warning'
        );
        return;
      }

      const shortDescription = document.getElementById('startup-desc-input')?.value.trim();
      const requiredRoles = document.getElementById('startup-roles-input')?.value.trim();
      const requiredSkills = document.getElementById('startup-skills-input')?.value.trim();
      const category = document.getElementById('startup-category-select')?.value.trim() || 'CleanTech';
      const teamSize = document.getElementById('startup-teamsize-input')?.value.trim() || '3-5 members';
      const problemStatement = document.getElementById('startup-problem-input')?.value.trim() || '';
      const solution = document.getElementById('startup-solution-input')?.value.trim() || '';

      if (!rawTitle || !shortDescription || !requiredRoles || !requiredSkills) {
        if (errorAlert) {
          errorAlert.innerText = 'Please fill in all mandatory fields (Title, Description, Roles, Skills).';
          errorAlert.style.display = 'block';
        }
        return;
      }

      if (!currentUser || !currentUser.id) {
        if (errorAlert) {
          errorAlert.innerText = 'You must be logged in as a founder to create a startup.';
          errorAlert.style.display = 'block';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving Startup...';
      }

      // Final backend verification on submit
      try {
        const checkRes = await fetch(`${apiBaseUrl}/api/startups/check-title?title=${encodeURIComponent(normalized)}`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.exists) {
            updateTitleStatus('taken', '⚠️ Startup title already registered. Please choose a different title.');
            showModal(
              'Startup Already Exists',
              'This startup title is already registered. Please choose a different title.',
              'warning'
            );
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerText = 'Create Startup & Save';
            }
            return;
          }
        }
      } catch (err) {}

      const payload = {
        title: rawTitle.trim().replace(/\s+/g, ' '),
        shortDescription,
        problemStatement,
        solution,
        requiredRoles,
        requiredSkills,
        teamSize,
        category,
        founderId: currentUser.id,
        founderName: currentUser.name
      };

      try {
        const res = await fetch(`${apiBaseUrl}/api/startups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const createdData = await res.json();
          onStartupCreated(createdData);
        } else {
          const errorText = await res.text();
          if (errorAlert) {
            errorAlert.innerText = errorText || 'Unable to create startup. Please try again.';
            errorAlert.style.display = 'block';
          }
        }
      } catch (err) {
        if (errorAlert) {
          errorAlert.innerText = 'Unable to connect to the server. Please try again.';
          errorAlert.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Create Startup & Save';
        }
      }
    };
  }
}
