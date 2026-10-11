/**
 * TeamDashboard Page (Vanilla JS)
 * Displays team rosters, objectives, and real-time auto-refreshing chat.
 * CRITICAL REQUIREMENTS:
 * 1. Messages sent by Founder appear automatically on User's chat, and vice versa, without refreshing.
 * 2. Fetch immediately when chat opens and poll strictly every 2 seconds (2000ms).
 * 3. Fix stale message comparisons; prevent overlapping requests; prevent duplicate messages.
 * 4. Preserve existing messages on fetch errors.
 * 5. Clean up polling and abort inflight requests when leaving the page.
 * 6. Both users view the same team's chat with workspace switcher when multiple teams exist.
 * 7. Own messages strictly on the right in blue (#2563EB); other members' messages on the left in light blue (#EFF6FF), using sender IDs only.
 */

function deduplicateMessages(messages = []) {
  if (!Array.isArray(messages)) return [];
  const map = new Map();
  for (const msg of messages) {
    if (!msg) continue;
    if (msg.id != null) {
      map.set(Number(msg.id), msg);
    } else {
      const fallbackKey = `${msg.senderId || ''}_${msg.sentAt || ''}_${msg.text || ''}`;
      map.set(fallbackKey, msg);
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const timeA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
    const timeB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  });
}

export function renderTeamDashboardPage({
  team,
  teams = [],
  currentUser,
  currentRole
}) {
  if (!team) {
    return `
      <div class="team-dashboard-page">
        <div class="section-header">
          <div>
            <h1 class="section-title" style="font-size: 1.5rem;">My Team Workspace</h1>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
              Formed startup teams and member communication.
            </p>
          </div>
        </div>

        <div class="empty-state">
          <div class="empty-icon">🤝</div>
          <h3 class="empty-title">You haven't joined a startup team yet</h3>
          <p style="max-width: 440px; margin: 0 auto 16px auto; font-size: 0.9rem;">
            ${currentRole === 'founder' 
              ? 'Accept an applicant’s submission to automatically form your startup team.' 
              : 'Once a founder accepts your application, you will join their startup team here!'}
          </p>
          <button 
            id="empty-team-action-btn"
            class="btn btn-primary"
          >
            ${currentRole === 'founder' ? 'Check Applications' : 'Explore Startups'}
          </button>
        </div>
      </div>
    `;
  }

  const startupTitle = team.startupTitle || 'Startup Project';
  const founderName = team.founderName || 'Founder';
  const messages = deduplicateMessages(team.messages || []);

  return `
    <div class="team-dashboard-page">
      <!-- Team Header -->
      <div class="section-header" style="margin-bottom: 20px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 6px;">
            <h1 class="section-title" style="font-size: 1.6rem; font-weight: 800;">
              ${escapeHtml(startupTitle.endsWith('Team') ? startupTitle : `${startupTitle} Team`)}
            </h1>
            <span class="badge badge-accepted" style="font-size: 0.78rem; padding: 4px 12px;">
              ● Active Team #${escapeHtml(String(team.id))}
            </span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 4px;">
            Founder: <strong>${escapeHtml(founderName)}</strong> &bull; Startup Project: <strong>${escapeHtml(startupTitle)}</strong>
          </p>

          ${teams && teams.length > 1 ? `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 10px;">
              <label for="team-selector-dropdown" style="font-size: 0.84rem; font-weight: 600; color: var(--text-secondary);">
                Active Team:
              </label>
              <select id="team-selector-dropdown" class="form-input" style="padding: 5px 10px; font-size: 0.84rem; width: auto; max-width: 280px;">
                ${teams.map(t => `
                  <option value="${t.id}" ${Number(t.id) === Number(team.id) ? 'selected' : ''}>
                    ${escapeHtml(t.startupTitle || 'Team')} (#${t.id})
                  </option>
                `).join('')}
              </select>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="team-grid">
        <!-- Left Column: Team Roster & Objectives -->
        <div>
          <div class="details-box" style="margin-bottom: 18px;">
            <h3 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 14px; font-weight: 700;">
              👥 Team Roster
            </h3>

            <!-- Founder Item -->
            <div class="member-item">
              <div>
                <div style="font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">
                  ${escapeHtml(founderName)}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                  Founder &bull; Product Lead
                </div>
              </div>
              <span class="badge badge-skill">Founder</span>
            </div>

            <!-- Accepted Team Members -->
            ${team.members && team.members.length > 0 ? (
              team.members.map((m, idx) => `
                <div class="member-item" key="${m.id || idx}">
                  <div>
                    <div style="font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">
                      ${escapeHtml(m.userName || m.name || 'Team Member')}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                      Role: ${escapeHtml(m.role || 'Developer')} &bull; Skills: ${escapeHtml(m.skills || 'Technical Skills')}
                    </div>
                  </div>
                  <span class="badge badge-role">${escapeHtml(m.role || 'Member')}</span>
                </div>
              `).join('')
            ) : `
              <div class="member-item">
                <div>
                  <div style="font-weight: 700; color: var(--text-primary); font-size: 0.92rem;">
                    ${escapeHtml(currentUser?.name || 'Team Member')}
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">
                    Role: ${currentRole === 'founder' ? 'Founder' : 'Contributor'}
                  </div>
                </div>
                <span class="badge badge-role">${currentRole === 'founder' ? 'Lead' : 'Member'}</span>
              </div>
            `}
          </div>

          <!-- Team Objectives -->
          <div class="details-box">
            <h4 style="font-size: 0.98rem; color: var(--text-primary); margin-bottom: 10px; font-weight: 700;">
              📋 Team Objectives
            </h4>
            <ul style="padding-left: 18px; color: var(--text-secondary); font-size: 0.86rem; line-height: 1.65;">
              <li>Finalize semester prototype architecture and database schema</li>
              <li>Coordinate frontend components and Spring Boot REST endpoints</li>
              <li>Develop startup matching workflow and verify candidate compatibility</li>
              <li>Prepare end-to-end demo and documentation for project viva</li>
            </ul>
          </div>
        </div>

        <!-- Right Column: Team Discussion / Chat -->
        <div class="chat-container">
          <div class="chat-header">
            <span>💬 Team Discussion & Announcements</span>
            <span style="font-size: 0.72rem; font-weight: 600; color: #16A34A; background: #DCFCE7; padding: 3px 10px; border-radius: 12px; border: 1px solid #86EFAC;">
              ● Live Sync (2s)
            </span>
          </div>

          <div id="team-chat-body" class="chat-body">
            ${renderMessagesHtml(messages, currentUser)}
          </div>

          <form id="team-chat-form" class="chat-input-bar">
            <input 
              type="text" 
              id="team-chat-input"
              class="form-input" 
              style="flex: 1; padding: 9px 12px; font-size: 0.88rem;"
              placeholder="Type your message..."
              autocomplete="off"
              required
            />
            <button type="submit" id="team-chat-send-btn" class="btn btn-primary btn-sm">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders message bubbles with strict alignment:
 * Current logged-in user -> own-message (RIGHT-aligned, Blue background #2563EB, White text)
 * Other team members -> other-message (LEFT-aligned, Light Blue #EFF6FF, Dark text #0F172A)
 * Strictly using sender IDs only.
 */
export function renderMessagesHtml(messages = [], currentUser) {
  const deduped = deduplicateMessages(messages);
  if (!deduped || deduped.length === 0) {
    return `
      <div style="text-align: center; color: var(--text-secondary); padding: 32px 16px; font-size: 0.88rem;">
        <div style="font-size: 1.8rem; margin-bottom: 8px;">💬</div>
        <div>No messages in this chat channel yet.</div>
        <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-muted);">Send a message to start collaborating!</div>
      </div>
    `;
  }

  return deduped.map((msg) => {
    // Strictly compare sender ID with currentUser ID
    const isOwnMessage = Boolean(
      currentUser &&
      currentUser.id != null &&
      msg?.senderId != null &&
      Number(msg.senderId) === Number(currentUser.id)
    );

    const timeDisplay = msg.timestamp || (msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now');

    return `
      <div class="message-row ${isOwnMessage ? 'own-message own' : 'other-message other'}" data-msg-id="${escapeHtml(String(msg.id || ''))}">
        <div class="message-bubble">
          <div class="message-author">
            ${escapeHtml(msg.senderName || 'Member')} &bull; <span style="opacity: 0.75; font-size: 0.7rem;">${escapeHtml(timeDisplay)}</span>
          </div>
          <div class="message-text">${escapeHtml(msg.text)}</div>
        </div>
      </div>
    `;
  }).join('');
}

let chatPollInterval = null;
let activeAbortController = null;
let isPollFetching = false;

export function initTeamDashboardEvents({
  team,
  teams = [],
  currentUser,
  currentRole,
  onSendMessage,
  onNavigate,
  onSelectTeam,
  apiBaseUrl,
  onUpdateTeamMessages
}) {
  cleanupTeamDashboard();

  const emptyBtn = document.getElementById('empty-team-action-btn');
  if (emptyBtn) {
    emptyBtn.onclick = () => {
      onNavigate(currentRole === 'founder' ? 'applications' : 'startups');
    };
  }

  const teamSelect = document.getElementById('team-selector-dropdown');
  if (teamSelect && typeof onSelectTeam === 'function') {
    teamSelect.onchange = (e) => {
      onSelectTeam(Number(e.target.value));
    };
  }

  if (!team || !team.id) return;

  const chatBody = document.getElementById('team-chat-body');
  const chatForm = document.getElementById('team-chat-form');
  const chatInput = document.getElementById('team-chat-input');
  const sendBtn = document.getElementById('team-chat-send-btn');

  // Track rendered signature to avoid stale comparisons and redundant DOM updates
  let renderedSignature = deduplicateMessages(team.messages || []).map(m => `${m.id}:${m.text}`).join('|');

  const scrollToBottom = () => {
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  };

  scrollToBottom();

  const fetchLatestMessages = async () => {
    if (!team || !team.id) return;
    if (isPollFetching) return; // Prevent overlapping requests

    isPollFetching = true;
    activeAbortController = new AbortController();

    try {
      const url = `${apiBaseUrl}/api/teams/${team.id}/messages`;
      const token = currentUser?.token || localStorage.getItem('stc_token') || '';
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, {
        signal: activeAbortController.signal,
        headers
      });

      if (res.ok) {
        const freshMsgs = await res.json();
        if (Array.isArray(freshMsgs)) {
          const deduped = deduplicateMessages(freshMsgs);
          const incomingSig = deduped.map(m => `${m.id}:${m.text}`).join('|');

          // Only update if incoming messages differ from the currently rendered signature
          if (incomingSig !== renderedSignature) {
            renderedSignature = incomingSig;
            team.messages = deduped;

            if (chatBody) {
              const isNearBottom = (chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight) < 120;
              chatBody.innerHTML = renderMessagesHtml(deduped, currentUser);
              if (isNearBottom || renderedSignature === incomingSig) {
                scrollToBottom();
              }
            }

            if (typeof onUpdateTeamMessages === 'function') {
              onUpdateTeamMessages(deduped);
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Preserve old messages on fetch errors. Do not clear chatBody or team.messages.
        console.warn('Team chat sync poll retry:', err);
      }
    } finally {
      isPollFetching = false;
      activeAbortController = null;
    }
  };

  if (chatForm && chatInput) {
    chatForm.onsubmit = async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      if (sendBtn) sendBtn.disabled = true;
      chatInput.disabled = true;

      try {
        const sent = await onSendMessage(text);
        if (sent) {
          chatInput.value = '';
          // Immediate fetch after sending to update without waiting for next tick
          await fetchLatestMessages();
          scrollToBottom();
        }
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
      }
    };
  }

  // 1. Fetch immediately when chat opens
  fetchLatestMessages();

  // 2. Live auto-polling strictly every 2 seconds (Requirement: poll every 2 seconds)
  chatPollInterval = setInterval(fetchLatestMessages, 2000);
}

export function cleanupTeamDashboard() {
  if (chatPollInterval) {
    clearInterval(chatPollInterval);
    chatPollInterval = null;
  }
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
  isPollFetching = false;
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
