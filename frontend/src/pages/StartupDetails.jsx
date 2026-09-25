import React, { useState } from 'react';

/**
 * StartupDetails Page
 * Detailed overview of the startup idea, problem, solution, roles,
 * skill compatibility breakdown, and application submission form.
 */
export default function StartupDetails({
  startup,
  currentUser,
  currentRole,
  onApply,
  onSave,
  isSaved,
  hasApplied,
  onBack
}) {
  if (!startup) {
    return (
      <div className="empty-state">
        <h3>Startup not found</h3>
        <button className="btn btn-outline" onClick={onBack}>Back to listings</button>
      </div>
    );
  }

  // Parse roles
  const rolesList = startup.requiredRoles 
    ? (Array.isArray(startup.requiredRoles) ? startup.requiredRoles : startup.requiredRoles.split(',').map(r => r.trim()).filter(Boolean))
    : [];

  const [selectedRole, setSelectedRole] = useState(rolesList[0] || 'Developer');
  const [applicationNote, setApplicationNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Skill Compatibility logic
  const userSkills = currentUser?.skills || '';
  const reqSkillsList = startup.requiredSkills
    ? (Array.isArray(startup.requiredSkills) ? startup.requiredSkills : startup.requiredSkills.split(',').map(s => s.trim()).filter(Boolean))
    : [];

  const mySkillsList = userSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const matchedSkills = reqSkillsList.filter(s => mySkillsList.includes(s.toLowerCase()));
  const matchPercentage = reqSkillsList.length > 0 
    ? Math.round((matchedSkills.length / reqSkillsList.length) * 100)
    : 0;

  const handleApplyClick = () => {
    setIsApplying(true);
    onApply(startup, selectedRole, applicationNote);
    setIsApplying(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>
          &larr; Back to Startups
        </button>
      </div>

      <div className="details-layout">
        {/* Left Column: Startup Story, Problem & Solution */}
        <div className="details-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span className="badge badge-skill" style={{ marginBottom: '8px' }}>
                {startup.category || 'Startup'}
              </span>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)' }}>{startup.title}</h1>
              <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
                Led by Founder: <strong>{startup.founderName || 'Startup Founder'}</strong>
              </p>
            </div>

            {currentRole === 'user' && (
              <button 
                className={`btn-icon-save ${isSaved ? 'saved' : ''}`}
                style={{ padding: '8px 14px', fontSize: '1.1rem' }}
                onClick={() => onSave(startup)}
                title={isSaved ? "Saved" : "Save this startup"}
              >
                {isSaved ? '♥ Saved' : '♡ Save'}
              </button>
            )}
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '28px' }}>
            {startup.shortDescription || startup.description}
          </p>

          {/* Problem Statement */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>
              🎯 The Problem
            </h3>
            <p style={{ color: 'var(--secondary-text)', lineHeight: '1.5', background: 'var(--off-white)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              {startup.problemStatement || 'This startup addresses inefficiency and lack of modern digital tools in the current ecosystem.'}
            </p>
          </div>

          {/* Solution */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>
              💡 The Solution
            </h3>
            <p style={{ color: 'var(--secondary-text)', lineHeight: '1.5', background: 'var(--off-white)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              {startup.solution || 'Building a lightweight, scalable collaborative web platform with smart workflow management.'}
            </p>
          </div>

          {/* Open Roles */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-dark)', marginBottom: '10px' }}>
              👥 Open Roles
            </h3>
            <div className="tags-wrap">
              {rolesList.map((role, idx) => (
                <span key={idx} className="badge badge-role" style={{ padding: '6px 14px', fontSize: '0.9rem' }}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Compatibility & Application Form */}
        <div className="details-sidebar">
          {/* Skill Compatibility Card */}
          {currentRole === 'user' && (
            <div className="details-box">
              <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '10px' }}>
                Skill Compatibility
              </h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: matchPercentage > 50 ? '#15803D' : '#D97706' }}>
                  {matchPercentage}%
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                  ({matchedSkills.length} of {reqSkillsList.length} skills matched)
                </span>
              </div>

              {matchedSkills.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: '#15803D', marginBottom: '12px' }}>
                  <strong>Matched:</strong> {matchedSkills.join(', ')}
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                <strong>Required skills:</strong>
                <div className="tags-wrap" style={{ marginTop: '6px' }}>
                  {reqSkillsList.map((skill, idx) => {
                    const isMatched = mySkillsList.includes(skill.toLowerCase());
                    return (
                      <span 
                        key={idx} 
                        className={`badge ${isMatched ? 'badge-accepted' : 'badge-skill'}`}
                      >
                        {skill} {isMatched ? '✓' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Apply Form for Users */}
          {currentRole === 'user' ? (
            <div className="details-box">
              <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '12px' }}>
                Apply to Join Team
              </h4>

              {hasApplied ? (
                <div className="alert alert-success" style={{ margin: 0 }}>
                  ✓ You have already applied for this startup! You can track your status in <strong>My Applications</strong>.
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label className="form-label">Select Role to Apply For:</label>
                    <select 
                      className="form-select"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      {rolesList.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Short Note for Founder (optional):</label>
                    <textarea 
                      className="form-textarea"
                      rows="2"
                      placeholder="Why would you like to contribute to this startup?"
                      value={applicationNote}
                      onChange={(e) => setApplicationNote(e.target.value)}
                    />
                  </div>

                  <button 
                    className="btn btn-primary btn-full"
                    onClick={handleApplyClick}
                    disabled={isApplying}
                  >
                    {isApplying ? 'Submitting...' : 'Apply to Join'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="details-box">
              <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark)', marginBottom: '8px' }}>
                Founder View
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                Target team size: <strong>{startup.teamSize || '3-5'}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
