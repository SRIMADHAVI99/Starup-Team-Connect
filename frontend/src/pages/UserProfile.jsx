import React, { useState } from 'react';

/**
 * UserProfile Page
 * Allows students/professionals to maintain their profile,
 * skills list (used for skill matching), education, and experience.
 */
export default function UserProfile({ currentUser, onUpdateProfile, apiBaseUrl }) {
  const [name, setName] = useState(currentUser?.name || 'Rahul Sharma');
  const [email] = useState(currentUser?.email || 'rahul@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 9876543210');
  const [skills, setSkills] = useState(currentUser?.skills || 'Java, SQL, HTML, CSS');
  const [experience, setExperience] = useState(currentUser?.experience || 'Beginner');
  const [education, setEducation] = useState(currentUser?.education || 'B.Tech CSE, 3rd Year');
  const [bio, setBio] = useState(currentUser?.bio || 'CSE student passionate about building scalable web applications and joining innovative startups.');
  const [portfolioLink, setPortfolioLink] = useState(currentUser?.portfolioLink || 'https://github.com/rahul');

  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
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
    onUpdateProfile(updated);
    setSavedMsg('Profile updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div>
      <div className="section-header" style={{ maxWidth: '720px', margin: '0 auto 20px auto' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>User Profile</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
            Keep your skills and experience up to date to get matched with the best startups.
          </p>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: '720px' }}>
        {savedMsg && <div className="alert alert-success">{savedMsg}</div>}

        <form onSubmit={handleSave}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
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
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Education / College</label>
              <input 
                type="text" 
                className="form-input" 
                value={education} 
                onChange={(e) => setEducation(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills (comma-separated)</label>
            <input 
              type="text" 
              className="form-input" 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
              required 
            />
            <span className="form-hint">Example: Java, SQL, HTML, CSS, React, Python</span>
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
