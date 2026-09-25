import React, { useState } from 'react';

/**
 * FounderProfile Page
 * Displays and allows editing of founder information,
 * interests, experience, and vision.
 */
export default function FounderProfile({ currentUser, onUpdateProfile, onNavigate }) {
  const [name, setName] = useState(currentUser?.name || 'Ananya Gupta');
  const [email] = useState(currentUser?.email || 'ananya@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 9876543211');
  const [experience, setExperience] = useState(currentUser?.experience || '2+ years building tech MVPs');
  const [interests, setInterests] = useState(currentUser?.interests || 'CleanTech, Sustainability, IoT');
  const [bio, setBio] = useState(currentUser?.bio || 'Founder looking to assemble a passionate student engineering team for smart waste recycling.');

  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name,
      phone,
      experience,
      interests,
      bio
    };
    onUpdateProfile(updated);
    setSavedMsg('Founder profile saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div>
      <div className="section-header" style={{ maxWidth: '720px', margin: '0 auto 20px auto' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Founder Profile</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem' }}>
            Manage your founder background and startup domains.
          </p>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: '720px' }}>
        {savedMsg && <div className="alert alert-success">{savedMsg}</div>}

        <form onSubmit={handleSave}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Founder Name</label>
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
              <label className="form-label">Startup Focus & Interests</label>
              <input 
                type="text" 
                className="form-input" 
                value={interests} 
                onChange={(e) => setInterests(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Founder Background & Experience</label>
            <input 
              type="text" 
              className="form-input" 
              value={experience} 
              onChange={(e) => setExperience(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vision & Bio</label>
            <textarea 
              className="form-textarea" 
              rows="3" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => onNavigate('create-startup')}
            >
              + Create Startup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
