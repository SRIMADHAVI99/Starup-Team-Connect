import React from 'react';

/**
 * StartupCard Component
 * Displays a startup opportunity with skill matching and action buttons.
 */
export default function StartupCard({ 
  startup, 
  userSkills = [], 
  onViewDetails, 
  onApply, 
  onSave, 
  isSaved = false,
  hasApplied = false,
  showApplyButton = true
}) {
  // Rule-based Skill Compatibility Calculation (Requirement 16)
  const calculateCompatibility = () => {
    if (!startup.requiredSkills || !userSkills || userSkills.length === 0) {
      return null;
    }
    
    // Split comma separated or array
    const reqSkills = Array.isArray(startup.requiredSkills)
      ? startup.requiredSkills
      : startup.requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    if (reqSkills.length === 0) return null;

    const mySkills = Array.isArray(userSkills)
      ? userSkills.map(s => s.toLowerCase().trim())
      : userSkills.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);

    const matches = reqSkills.filter(s => mySkills.includes(s));
    const percent = Math.round((matches.length / reqSkills.length) * 100);

    return {
      percent,
      matchedCount: matches.length,
      totalCount: reqSkills.length
    };
  };

  const compatibility = calculateCompatibility();

  const parseSkillsList = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return skills.split(',').map(s => s.trim()).filter(Boolean);
  };

  const parseRolesList = (roles) => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    return roles.split(',').map(r => r.trim()).filter(Boolean);
  };

  const skillsList = parseSkillsList(startup.requiredSkills);
  const rolesList = parseRolesList(startup.requiredRoles);

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
