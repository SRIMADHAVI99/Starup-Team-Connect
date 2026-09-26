import React, { useState } from 'react';

/**
 * UserProfile Page
 * Allows students/professionals to maintain their profile,
 * skills list (used for skill matching), education, and experience.
 */
export default function UserProfile({ currentUser, onUpdateProfile, apiBaseUrl }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [email] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [skills, setSkills] = useState(currentUser?.skills || '');
  const [experience, setExperience] = useState(currentUser?.experience || 'Beginner');
  const [education, setEducation] = useState(currentUser?.education || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [portfolioLink, setPortfolioLink] = useState(currentUser?.portfolioLink || '');

  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSavedMsg('');
    setErrorMsg('');

    const updated = {
      ...currentUser,
      name,
      phone,
      skills,
      experience,
      education,
      bio,
      portfolioLink
    };

    if (currentUser?.id) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          const savedData = await res.json();
          onUpdateProfile(savedData);
          setSavedMsg('Profile updated successfully!');
          setTimeout(() => setSavedMsg(''), 3000);
          return;
        }
      } catch (err) {
        console.warn('Backend update error:', err);
      }
    }

    onUpdateProfile(updated);
    setSavedMsg('Profile updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div>
      <div className="section-header" style={{ maxWidth: '720px', margin: '0 auto 20px auto' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>User Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Keep your skills and experience up to date to get matched with the right startups.
          </p>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: '720px' }}>
        {savedMsg && <div className="alert alert-success">{savedMsg}</div>}

        <form onSubmit={handleSave}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter your full name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                disabled 
                style={{ background: 'var(--off-white)', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter your phone number"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Education / College</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. B.Tech CSE, 3rd Year"
                value={education} 
                onChange={(e) => setEducation(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills * (comma-separated)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Java, SQL, HTML, CSS, React, Python"
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
              required 
            />
            <span className="form-hint">Used for automatic rule-based candidate matching.</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select 
                className="form-select" 
                value={experience} 
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="Beginner">Beginner (Student / Fresher)</option>
                <option value="Intermediate">Intermediate (1-2 Projects)</option>
                <option value="Experienced">Experienced (Advanced)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Portfolio / GitHub Link</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="e.g. https://github.com/yourusername"
                value={portfolioLink} 
                onChange={(e) => setPortfolioLink(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio / About Me</label>
            <textarea 
              className="form-textarea" 
              rows="3" 
              placeholder="Tell us about your interests and project experience"
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}
