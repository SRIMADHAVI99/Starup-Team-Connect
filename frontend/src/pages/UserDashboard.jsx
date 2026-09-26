import React, { useState } from 'react';
import StartupCard from '../components/StartupCard';
import { calculateSkillCompatibility } from '../utils/skillMatcher';

/**
 * UserDashboard Page
 * Shows recommended startups (ranked by skill compatibility),
 * all startups, search bar, and user stats.
 */
export default function UserDashboard({ 
  currentUser, 
  startups = [], 
  applications = [], 
  savedStartups = [],
  team = null,
  startupsError = null,
  onViewDetails, 
  onApply, 
  onSave, 
  onNavigate 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Categories list
  const categories = ['ALL', 'CleanTech', 'EdTech', 'HealthTech', 'FinTech', 'AI/ML', 'SaaS', 'General'];

  // User skills string/array
  const userSkills = currentUser?.skills || '';

  // Filtered startups
  const filteredStartups = startups.filter(st => {
    const matchesSearch = st.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.requiredSkills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.requiredRoles?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || st.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate skill compatibility & rank recommendations (Requirement 2)
  const recommendedStartups = startups
    .map(st => {
      const compat = calculateSkillCompatibility(userSkills, st.requiredSkills);
      return { ...st, _compat: compat };
    })
    .filter(st => st._compat.percent > 0)
    .sort((a, b) => b._compat.percent - a._compat.percent)
    .slice(0, 3);

  // Check if user has applied to a startup
  const hasUserApplied = (startupId) => {
    return applications.some(app => app.startup?.id === startupId || app.startupId === startupId);
  };

  // Check if startup is saved
  const isStartupSaved = (startupId) => {
    return savedStartups.some(s => s.id === startupId || s.startupId === startupId);
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">Welcome back, {currentUser?.name || 'Student'}! 👋</h1>
        <p className="dashboard-subtitle">
          Explore startup projects matching your skills and join emerging teams.
        </p>
      </div>

      {/* Backend API Connection Error Alert (Requirement 1 & 6) */}
      {startupsError && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          ⚠️ <strong>Service Connection Warning:</strong> {startupsError}
        </div>
      )}

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Available Startups</span>
          <span className="stat-value">{startups.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">My Applications</span>
          <span className="stat-value">{applications.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Saved Projects</span>
          <span className="stat-value">{savedStartups.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Team Status</span>
          <span className="stat-value" style={{ fontSize: '1.2rem', color: team ? '#16A34A' : 'var(--text-secondary)' }}>
            {team ? 'Active Member ✓' : 'Looking for Team'}
          </span>
        </div>
      </div>

      {/* Recommended Startups Section (Requirement 2) */}
      <div style={{ marginBottom: '40px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">⚡ Recommended for Your Skills</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {userSkills ? `Based on your skills: ${userSkills}` : 'Add skills in your Profile to unlock automatic recommendations.'}
            </p>
          </div>
        </div>

        {recommendedStartups.length > 0 ? (
          <div className="cards-grid">
            {recommendedStartups.map(st => (
              <StartupCard
                key={st.id}
                startup={st}
                userSkills={userSkills}
                onViewDetails={onViewDetails}
                onApply={onApply}
                onSave={onSave}
                isSaved={isStartupSaved(st.id)}
                hasApplied={hasUserApplied(st.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ margin: 0, padding: '24px 16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
              No startup matches your current skills yet.
            </p>
          </div>
        )}
      </div>

      {/* All Startups Listing & Search */}
      <div className="section-header">
        <h2 className="section-title">Explore All Startups</h2>

        <div className="filters-bar">
          <input 
            type="text"
            className="search-input"
            placeholder="Search title, skills, roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select 
            className="form-select"
            style={{ padding: '8px 12px', fontSize: '0.88rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c, i) => (
              <option key={i} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredStartups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">
            {startupsError ? 'Unable to load startups' : 'No startups found'}
          </h3>
          <p>
            {startupsError 
              ? 'Please check your backend connection or refresh the page.' 
              : 'Try clearing your search filters or check back once founders post new ideas.'}
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredStartups.map(st => (
            <StartupCard
              key={st.id}
              startup={st}
              userSkills={userSkills}
              onViewDetails={onViewDetails}
              onApply={onApply}
              onSave={onSave}
              isSaved={isStartupSaved(st.id)}
              hasApplied={hasUserApplied(st.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

