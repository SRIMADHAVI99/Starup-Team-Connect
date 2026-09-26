import React, { useState } from 'react';

/**
 * Chatbot Component
 * A lightweight, rule-based assistant answering questions about
 * the platform, application process, and team formation.
 */
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your TeamConnect Assistant. Ask me how to find startups, apply to teams, or post startup ideas!'
    }
  ]);

  // Predefined Knowledge Base (Rule-Based Matching)
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

  const handleSend = (textToSend = inputQuery) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Rule-based matching logic
    const lower = trimmed.toLowerCase();
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
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: foundReply }
      ]);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How do I apply?",
    "How to create a startup?",
    "What happens when accepted?",
    "What is Startup Team Connect?"
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        className="chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Assistant"
        title="Ask TeamConnect Assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Floating Chatbot Modal Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span>🤖</span> TeamConnect Assistant
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble-wrapper ${m.sender}`}>
                <div className={`chat-bubble ${m.sender}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="chatbot-quick-chips">
            {quickQuestions.map((q, idx) => (
              <button 
                key={idx} 
                className="quick-chip"
                onClick={() => handleSend(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chatbot Input Bar */}
          <div className="chatbot-footer">
            <input 
              type="text"
              className="chatbot-input"
              placeholder="Ask a question..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleSend()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
