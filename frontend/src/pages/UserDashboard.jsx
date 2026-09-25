import React, { useState } from 'react';
import StartupCard from '../components/StartupCard';

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
  onViewDetails, 
  onApply, 
  onSave, 
  onNavigate 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Categories list
  const categories = ['ALL', 'CleanTech', 'EdTech', 'HealthTech', 'FinTech', 'AI/ML', 'SaaS', 'General'];

  // User skills array
  const userSkills = currentUser?.skills || '';

  // Filtered startups
  const filteredStartups = startups.filter(st => {
    const matchesSearch = st.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.requiredSkills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.requiredRoles?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || st.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate skill match score for sorting recommendations
  const getSkillMatchScore = (startup) => {
    if (!startup.requiredSkills || !userSkills) return 0;
    const req = startup.requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const my = userSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (req.length === 0) return 0;
    const matches = req.filter(s => my.includes(s));
    return matches.length / req.length;
  };

  const recommendedStartups = [...startups]
    .filter(st => getSkillMatchScore(st) > 0)
    .sort((a, b) => getSkillMatchScore(b) - getSkillMatchScore(a))
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
          <span className="stat-value" style={{ fontSize: '1.2rem', color: team ? '#15803D' : 'var(--secondary-text)' }}>
            {team ? 'Active Member ✓' : 'Looking for Team'}
          </span>
        </div>
      </div>

      {/* Recommended Startups Section (if skills match) */}
      {recommendedStartups.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">⚡ Recommended for Your Skills</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                Based on your skills: {userSkills}
              </p>
            </div>
          </div>

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
        </div>
      )}

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
          <h3 className="empty-title">No startups found</h3>
          <p>Try clearing your search filters or check back once founders post new ideas.</p>
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
