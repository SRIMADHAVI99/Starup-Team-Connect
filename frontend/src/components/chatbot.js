/**
 * Chatbot Component (Vanilla JS)
 * Lightweight rule-based assistant answering questions about
 * the platform, application process, and team formation.
 */

const knowledgeBase = [
  {
    keywords: ['what is', 'purpose', 'about', 'startup team connect', 'platform'],
    reply: 'Startup Team Connect helps founders connect with skilled students and professionals to build startup teams.'
  },
  {
    keywords: ['apply', 'join', 'application'],
    reply: 'Open a startup, view its details, and click "Apply to Join". You can track status under "My Applications".'
  },
  {
    keywords: ['create', 'post', 'founder', 'add startup', 'start up'],
    reply: 'Founder accounts can create startups from the Founder Dashboard by clicking "+ Create Startup".'
  },
  {
    keywords: ['accepted', 'accept', 'after application', 'team formed', 'what happens'],
    reply: 'Once a founder accepts your application, a team relationship is automatically formed and appears in "My Team".'
  },
  {
    keywords: ['profile', 'skills', 'experience', 'bio'],
    reply: 'Open your Profile page from the top navigation to update your skills, experience, bio, and education.'
  },
  {
    keywords: ['compatibility', 'match', 'percent', 'percentage'],
    reply: 'Skill Compatibility compares the skills on your profile with the startup’s required skills to give a match score.'
  },
  {
    keywords: ['chat', 'message', 'communicate'],
    reply: 'After joining a team, you and your founder can communicate directly via the Team Chat on the "My Team" page.'
  },
  {
    keywords: ['duplicate', 'title', 'already exists'],
    reply: 'When creating a startup, our system automatically verifies if the title is available to prevent duplicate names.'
  }
];

const quickQuestions = [
  "How do I apply?",
  "How to create a startup?",
  "What happens when accepted?",
  "What is Startup Team Connect?"
];

let botMessages = [
  {
    id: 1,
    sender: 'bot',
    text: 'Hello! I am your TeamConnect Assistant. Ask me how to find startups, apply to teams, or post startup ideas!'
  }
];
let isChatbotOpen = false;

export function renderChatbot() {
  return `
    <div id="chatbot-container">
      <button 
        id="chatbot-trigger"
        class="chatbot-trigger"
        aria-label="Toggle Assistant"
        title="Ask TeamConnect Assistant"
      >
        ${isChatbotOpen ? '✕' : '💬'}
      </button>

      <div 
        id="chatbot-window"
        class="chatbot-window"
        style="display: ${isChatbotOpen ? 'flex' : 'none'};"
      >
        <div class="chatbot-header">
          <div class="chatbot-title">
            <span>🤖</span> TeamConnect Assistant
          </div>
          <button id="chatbot-close-btn" class="chatbot-close">✕</button>
        </div>

        <div id="chatbot-messages" class="chatbot-messages">
          ${renderMessagesHtml()}
        </div>

        <div id="chatbot-quick-chips" class="chatbot-quick-chips">
          ${quickQuestions.map((q) => `
            <button class="quick-chip" data-chip="${escapeHtml(q)}">${escapeHtml(q)}</button>
          `).join('')}
        </div>

        <div class="chatbot-footer">
          <input 
            type="text" 
            id="chatbot-input" 
            class="chatbot-input" 
            placeholder="Ask a question..."
          />
          <button id="chatbot-send-btn" class="btn btn-primary btn-sm">
            Send
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderMessagesHtml() {
  return botMessages.map(m => `
    <div class="chat-bubble-wrapper ${m.sender}">
      <div class="chat-bubble ${m.sender}">
        ${escapeHtml(m.text)}
      </div>
    </div>
  `).join('');
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

function scrollChatToBottom() {
  const container = document.getElementById('chatbot-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function handleUserMessage(query) {
  const text = (query || '').trim();
  if (!text) return;

  botMessages.push({ id: Date.now(), sender: 'user', text });

  const messagesEl = document.getElementById('chatbot-messages');
  if (messagesEl) {
    messagesEl.innerHTML = renderMessagesHtml();
    scrollChatToBottom();
  }

  const inputEl = document.getElementById('chatbot-input');
  if (inputEl) inputEl.value = '';

  const lower = text.toLowerCase();
  let foundReply = null;

  for (const item of knowledgeBase) {
    if (item.keywords.some(k => lower.includes(k))) {
      foundReply = item.reply;
      break;
    }
  }

  if (!foundReply) {
    foundReply = "I can help with questions like: 'How do I apply?', 'How to create a startup?', 'What happens after acceptance?', or 'How does skill compatibility work?'";
  }

  setTimeout(() => {
    botMessages.push({ id: Date.now() + 1, sender: 'bot', text: foundReply });
    if (messagesEl) {
      messagesEl.innerHTML = renderMessagesHtml();
      scrollChatToBottom();
    }
  }, 300);
}

export function initChatbotEvents() {
  const trigger = document.getElementById('chatbot-trigger');
  const win = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const inputEl = document.getElementById('chatbot-input');
  const chipsEl = document.getElementById('chatbot-quick-chips');

  if (trigger && win) {
    trigger.onclick = () => {
      isChatbotOpen = !isChatbotOpen;
      win.style.display = isChatbotOpen ? 'flex' : 'none';
      trigger.innerText = isChatbotOpen ? '✕' : '💬';
      if (isChatbotOpen) {
        scrollChatToBottom();
        if (inputEl) inputEl.focus();
      }
    };
  }

  if (closeBtn && win && trigger) {
    closeBtn.onclick = () => {
      isChatbotOpen = false;
      win.style.display = 'none';
      trigger.innerText = '💬';
    };
  }

  if (sendBtn && inputEl) {
    sendBtn.onclick = () => handleUserMessage(inputEl.value);
  }

  if (inputEl) {
    inputEl.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserMessage(inputEl.value);
      }
    };
  }

  if (chipsEl) {
    chipsEl.onclick = (e) => {
      const chip = e.target.closest('[data-chip]');
      if (chip) {
        const q = chip.getAttribute('data-chip');
        if (q) handleUserMessage(q);
      }
    };
  }
}
