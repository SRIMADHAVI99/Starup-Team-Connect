import React, { useState } from 'react';
import { calculateSkillCompatibility, parseRoles, parseSkills } from '../utils/skillMatcher';

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

  // Parse roles & skills
  const rolesList = parseRoles(startup.requiredRoles);
  const reqSkillsList = parseSkills(startup.requiredSkills);
  const userSkills = currentUser?.skills || '';

  const [selectedRole, setSelectedRole] = useState(rolesList[0] || 'Developer');
  const [applicationNote, setApplicationNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Skill Compatibility logic (Requirement 2)
  const compat = calculateSkillCompatibility(userSkills, startup.requiredSkills);
  const matchedSkills = compat.matchedSkills;
  const matchPercentage = compat.percent;
  const userSkillsList = parseSkills(userSkills);

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-skill" style={{ marginBottom: '8px' }}>
                {startup.category || 'Startup'}
              </span>
              <h1 style={{ fontSize: '1.7rem', color: 'var(--text-primary)', fontWeight: 800 }}>{startup.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Led by Founder: <strong>{startup.founderName || 'Startup Founder'}</strong>
              </p>
            </div>

            {currentRole === 'user' && (
              <button 
                className={`btn-icon-save ${isSaved ? 'saved' : ''}`}
                style={{ padding: '8px 14px', fontSize: '1.05rem' }}
                onClick={() => onSave(startup)}
                title={isSaved ? "Saved" : "Save this startup"}
              >
                {isSaved ? '♥ Saved' : '♡ Save'}
              </button>
            )}
          </div>

          <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '24px' }}>
            {startup.shortDescription || startup.description}
          </p>

          {/* Problem Statement */}
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
              🎯 The Problem
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.55', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
              {startup.problemStatement || 'This startup addresses inefficiency and lack of modern digital tools in the current ecosystem.'}
            </p>
          </div>

          {/* Solution */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
              💡 The Solution
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.55', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
              {startup.solution || 'Building a lightweight, scalable collaborative web platform with smart workflow management.'}
            </p>
          </div>

          {/* Open Roles */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 700 }}>
              👥 Open Roles
            </h3>
            <div className="tags-wrap">
              {rolesList.map((role, idx) => (
                <span key={idx} className="badge badge-role" style={{ padding: '6px 14px', fontSize: '0.86rem' }}>
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
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '10px', fontWeight: 700 }}>
                Skill Compatibility
              </h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {matchPercentage}%
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  ({matchedSkills.length} of {reqSkillsList.length} skills matched)
                </span>
              </div>

              {matchedSkills.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 600 }}>
                  Matched: {matchedSkills.join(', ')}
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Required skills:</strong>
                <div className="tags-wrap" style={{ marginTop: '6px' }}>
                  {reqSkillsList.map((skill, idx) => {
                    const isMatched = userSkillsList.includes(skill.toLowerCase());
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
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 700 }}>
                Apply to Join Team
              </h4>

              {hasApplied ? (
                <div className="alert alert-success" style={{ margin: 0, fontSize: '0.85rem' }}>
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
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
                Founder View
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Target team size: <strong>{startup.teamSize || '3-5'}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
