import React from 'react';
import { calculateSkillCompatibility, parseRoles, parseSkills } from '../utils/skillMatcher';

/**
 * StartupCard Component
 * Displays a startup opportunity with skill matching and action buttons.
 */
export default function StartupCard({ 
  startup, 
  userSkills = '', 
  onViewDetails, 
  onApply, 
  onSave, 
  isSaved = false,
  hasApplied = false,
  showApplyButton = true
}) {
  const compatibility = userSkills && startup?.requiredSkills 
    ? calculateSkillCompatibility(userSkills, startup.requiredSkills)
    : null;

  const skillsList = parseSkills(startup?.requiredSkills);
  const rolesList = parseRoles(startup?.requiredRoles);

  return (
    <div className="startup-card">
      <div>
        <div className="startup-card-header">
          <h3 className="startup-title">{startup.title}</h3>
          {startup.category && (
            <span className="startup-category">{startup.category}</span>
          )}
        </div>

        <p className="startup-desc">{startup.shortDescription || startup.description}</p>

        {startup.founderName && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 500 }}>
            Founder: <strong style={{ color: 'var(--text-primary)' }}>{startup.founderName}</strong>
          </div>
        )}

        {/* Skill Compatibility Pill (Requirement 16) */}
        {compatibility !== null && (
          <div className="compatibility-pill">
            <span>✨ {compatibility.percent}% Skill Match</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              ({compatibility.matchedCount}/{compatibility.totalCount} skills)
            </span>
          </div>
        )}

        {/* Required Roles */}
        {rolesList.length > 0 && (
          <div className="startup-meta-group">
            <div className="startup-meta-label">Looking for</div>
            <div className="tags-wrap">
              {rolesList.map((role, idx) => (
                <span key={idx} className="badge badge-role">{role}</span>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {skillsList.length > 0 && (
          <div className="startup-meta-group">
            <div className="startup-meta-label">Required Skills</div>
            <div className="tags-wrap">
              {skillsList.map((skill, idx) => (
                <span key={idx} className="badge badge-skill">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="startup-card-actions">
        <button 
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
          onClick={() => onViewDetails(startup)}
        >
          View Details
        </button>

        {showApplyButton && (
          <button 
            className={`btn btn-sm ${hasApplied ? 'btn-secondary' : 'btn-primary'}`}
            style={{ flex: 1 }}
            disabled={hasApplied}
            onClick={() => onApply(startup)}
          >
            {hasApplied ? 'Applied ✓' : 'Apply'}
          </button>
        )}

        {onSave && (
          <button 
            className={`btn-icon-save ${isSaved ? 'saved' : ''}`}
            title={isSaved ? "Saved" : "Save Startup"}
            onClick={() => onSave(startup)}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        )}
      </div>
    </div>
  );
}
