import React, { useState, useEffect, useRef } from 'react';

/**
 * TeamDashboard Page
 * Displays formed team rosters, member roles, project status,
 * and real-time auto-refreshing team communication message board.
 */
export default function TeamDashboard({
  team,
  currentUser,
  currentRole,
  onSendMessage,
  onNavigate,
  apiBaseUrl = `http://${window.location.hostname || 'localhost'}:8080`,
  onUpdateTeamMessages
}) {
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState(team?.messages || []);
  const chatBodyRef = useRef(null);

  // Sync prop messages into state
  useEffect(() => {
    if (team?.messages) {
      setMessages(team.messages);
    }
  }, [team?.messages]);

  // Polling loop for active team messages every 3 seconds
  useEffect(() => {
    if (!team?.id) return;

    const fetchLatestMessages = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/teams/${team.id}/messages`);
        if (res.ok) {
          const freshMsgs = await res.json();
          if (Array.isArray(freshMsgs)) {
            setMessages(prev => {
              if (prev.length === freshMsgs.length && 
                  prev.length > 0 && 
                  prev[prev.length - 1].id === freshMsgs[freshMsgs.length - 1].id) {
                return prev;
              }
              if (onUpdateTeamMessages) {
                onUpdateTeamMessages(freshMsgs);
              }
              return freshMsgs;
            });
          }
        }
      } catch (err) {
        // Silent poll warning
      }
    };

    fetchLatestMessages();
    const interval = setInterval(fetchLatestMessages, 3000);
    return () => clearInterval(interval);
  }, [team?.id, apiBaseUrl, onUpdateTeamMessages]);

  // Auto-scroll chat to bottom when messages update
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  if (!team) {
    return (
      <div>
        <div className="section-header">
          <div>
            <h1 className="section-title" style={{ fontSize: '1.5rem' }}>My Team Workspace</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Formed startup teams and member communication.
            </p>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-icon">🤝</div>
          <h3 className="empty-title">You haven't joined a startup team yet</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 16px auto', fontSize: '0.9rem' }}>
            {currentRole === 'founder' 
              ? 'Accept an applicant’s submission to automatically form your startup team.' 
              : 'Once a founder accepts your application, you will join their startup team here!'}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate(currentRole === 'founder' ? 'applications' : 'startups')}
          >
            {currentRole === 'founder' ? 'Check Applications' : 'Explore Startups'}
          </button>
        </div>
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    onSendMessage(chatText.trim());
    setChatText('');
  };

  const startupTitle = team.startupTitle || 'Startup Project';
  const founderName = team.founderName || 'Founder';

  return (
    <div>
      {/* Team Header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h1 className="section-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              {startupTitle.endsWith('Team') ? startupTitle : `${startupTitle} Team`}
            </h1>
            <span className="badge badge-accepted" style={{ fontSize: '0.78rem', padding: '4px 12px' }}>
              ● Active Team
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Founder: <strong>{founderName}</strong> &bull; Startup Project: <strong>{startupTitle}</strong>
          </p>
        </div>
      </div>

      <div className="team-grid">
        {/* Left Column: Team Members Roster & Details (Requirement 7 & 11) */}
        <div>
          <div className="details-box" style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '14px', fontWeight: 700 }}>
              👥 Team Roster
            </h3>

            {/* Founder Item */}
            <div className="member-item">
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  {founderName}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Founder &bull; Product Lead
                </div>
              </div>
              <span className="badge badge-skill">Founder</span>
            </div>

            {/* Accepted Team Members */}
            {team.members && team.members.length > 0 ? (
              team.members.map((m, idx) => (
                <div key={idx} className="member-item">
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                      {m.userName || m.name || 'Team Member'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Role: {m.role || 'Developer'} &bull; Skills: {m.skills || 'Technical Skills'}
                    </div>
                  </div>
                  <span className="badge badge-role">{m.role || 'Member'}</span>
                </div>
              ))
            ) : (
              <div className="member-item">
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                    {currentUser?.name || 'Team Member'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Role: {currentRole === 'founder' ? 'Founder' : 'Contributor'}
                  </div>
                </div>
                <span className="badge badge-role">{currentRole === 'founder' ? 'Lead' : 'Member'}</span>
              </div>
            )}
          </div>

          {/* Team Objectives (Requirement 12) */}
          <div className="details-box">
            <h4 style={{ fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 700 }}>
              📋 Team Objectives
            </h4>
            <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.65' }}>
              <li>Finalize semester prototype architecture and database schema</li>
              <li>Coordinate frontend components and Spring Boot REST endpoints</li>
              <li>Develop startup matching workflow and verify candidate compatibility</li>
              <li>Prepare end-to-end demo and documentation for project viva</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Team Discussion / Chat (Requirement 8 & 9) */}
        <div className="chat-container">
          <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💬 Team Discussion & Announcements</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              ● Live Sync
            </span>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px', fontSize: '0.85rem' }}>
                No messages in this chat channel yet. Send a message to start collaborating!
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = (msg.senderId && currentUser?.id && Number(msg.senderId) === Number(currentUser.id)) ||
                  (msg.senderName && msg.senderName.toLowerCase().includes(currentUser?.name?.toLowerCase() || '')) ||
                  (currentRole === 'founder' && msg.senderRole === 'founder');

                return (
                  <div key={msg.id || Math.random()} className={`team-msg ${isMine ? 'mine' : 'theirs'}`}>
                    <div className="team-msg-author" style={{ opacity: 0.85 }}>
                      {msg.senderName} &bull; <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>{msg.timestamp || (msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')}</span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                );
              })
            )}
          </div>

          <form className="chat-input-bar" onSubmit={handleSend}>
            <input 
              type="text" 
              className="form-input" 
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.88rem' }}
              placeholder="Type your message..."
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
