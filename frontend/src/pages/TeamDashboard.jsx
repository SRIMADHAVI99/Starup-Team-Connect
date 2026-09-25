import React, { useState } from 'react';

/**
 * TeamDashboard Page
 * The core milestone of Startup Team Connect:
 * Displays formed team rosters, roles, project status,
 * and a simple collaborative team communication message board.
 */
export default function TeamDashboard({
  team,
  currentUser,
  currentRole,
  onSendMessage,
  onNavigate
}) {
  const [chatText, setChatText] = useState('');

  if (!team) {
    return (
      <div>
        <div className="section-header">
          <div>
            <h1 className="section-title" style={{ fontSize: '1.6rem' }}>My Team Workspace</h1>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
              Formed startup teams and member communication.
            </p>
          </div>
        </div>

        <div className="empty-state">
          <div className="empty-icon">🤝</div>
          <h3 className="empty-title">No formed team yet</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 16px auto' }}>
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

  const messages = team.messages || [
    {
      id: 1,
      senderName: team.founderName || 'Founder Ananya',
      senderRole: 'founder',
      text: 'Welcome to the team! Excited to build together.',
      timestamp: '10:00 AM'
    },
    {
      id: 2,
      senderName: 'Rahul (Java Developer)',
      senderRole: 'user',
      text: 'Thanks! I completed the database design and initial endpoints.',
      timestamp: '10:15 AM'
    }
  ];

  return (
    <div>
      {/* Team Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 className="section-title" style={{ fontSize: '1.8rem' }}>
              {team.startupTitle || 'EcoTrack'} Team
            </h1>
            <span className="badge badge-accepted">
              ● Active Team
            </span>
          </div>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
            Founder: <strong>{team.founderName || 'Founder'}</strong> &bull; Startup Project: <strong>{team.startupTitle || 'Startup'}</strong>
          </p>
        </div>
      </div>

      <div className="team-grid">
        {/* Left Column: Team Members Roster & Details */}
        <div>
          <div className="details-box" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-dark)', marginBottom: '14px' }}>
              👥 Team Roster
            </h3>

            {/* Founder Item */}
            <div className="member-item">
              <div>
                <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>
                  {team.founderName || 'Founder'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Founder & Product Lead
                </div>
              </div>
              <span className="badge badge-skill">Founder</span>
            </div>

            {/* Accepted Team Members */}
            {team.members && team.members.length > 0 ? (
              team.members.map((m, idx) => (
                <div key={idx} className="member-item">
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>
                      {m.userName || m.name || 'Team Member'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                      Role: {m.role || 'Developer'} &bull; Skills: {m.skills || 'Java, SQL'}
                    </div>
                  </div>
                  <span className="badge badge-role">{m.role || 'Member'}</span>
                </div>
              ))
            ) : (
              <div className="member-item">
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>
                    {currentUser?.name || 'Rahul Sharma'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                    Role: Java Developer
                  </div>
                </div>
                <span className="badge badge-role">Java Developer</span>
              </div>
            )}
          </div>

          <div className="details-box">
            <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>
              📋 Team Objectives
            </h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--secondary-text)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <li>Finalize semester prototype architecture and database schema</li>
              <li>Coordinate frontend components and Spring Boot REST endpoints</li>
              <li>Prepare end-to-end demo and documentation for project viva</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Simple Team Communication / Chat (Requirement 20) */}
        <div className="chat-container">
          <div className="chat-header">
            💬 Team Discussion & Announcements
          </div>

          <div className="chat-body">
            {messages.map((msg) => {
              const isMine = msg.senderName?.toLowerCase().includes(currentUser?.name?.toLowerCase() || '') ||
                (currentRole === 'founder' && msg.senderRole === 'founder');

              return (
                <div key={msg.id} className={`team-msg ${isMine ? 'mine' : 'theirs'}`}>
                  <div className="team-msg-author" style={{ color: isMine ? '#E8ECF7' : 'var(--secondary-indigo)' }}>
                    {msg.senderName} &bull; <span style={{ opacity: 0.8, fontSize: '0.7rem' }}>{msg.timestamp || 'Just now'}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              );
            })}
          </div>

          <form className="chat-input-bar" onSubmit={handleSend}>
            <input 
              type="text" 
              className="form-input" 
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
              placeholder="Post a message to your team..."
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
