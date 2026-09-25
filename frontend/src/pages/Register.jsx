import React, { useState } from 'react';
import LoginTabs from '../components/LoginTabs';
import StartupTeamLogo from '../components/StartupTeamLogo';

/**
 * Register Page
 * Handles registration for both Users and Founders
 * with role-specific fields.
 */
export default function Register({ initialRole = 'user', onRegisterSuccess, onSwitchToLogin, apiBaseUrl }) {
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  
  // User specific
  // User specific
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  // Founder specific
  const [interests, setInterests] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsLoading(true);

    const payload = role === 'user' ? {
      name,
      email,
      password,
      phone,
      bio,
      skills,
      experience: experience || 'Beginner',
      education,
      portfolioLink
    } : {
      name,
      email,
      password,
      phone,
      bio,
      experience,
      interests
    };

    try {
      const endpoint = role === 'user' 
        ? `${apiBaseUrl}/api/users/register` 
        : `${apiBaseUrl}/api/founders/register`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onRegisterSuccess(data, role);
        }, 700);
      } else {
        const errText = await res.text();
        setErrorMsg(errText || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration connection error:', err);
      setErrorMsg('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <StartupTeamLogo size={42} showText={true} textStyle={{ fontSize: '1.4rem' }} />
          </div>
          <p className="auth-subtitle">Create your {role === 'user' ? 'User' : 'Founder'} account</p>
        </div>

        <LoginTabs activeRole={role} onRoleChange={(newRole) => {
          setRole(newRole);
          setErrorMsg('');
          setSuccessMsg('');
        }} />

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Enter your email address"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* User Profile Fields */}
          {role === 'user' && (
            <>
              <div className="form-group">
                <label className="form-label">Skills (comma-separated) *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Java, SQL, HTML, CSS"
                  value={skills} 
                  onChange={(e) => setSkills(e.target.value)} 
                  required 
                />
                <span className="form-hint">Used for matching your compatibility with startup roles.</span>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select 
                    className="form-select" 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="">Select experience level</option>
                    <option value="Beginner">Beginner (Student / Fresher)</option>
                    <option value="Intermediate">Intermediate (1-2 Projects)</option>
                    <option value="Experienced">Experienced (Advanced)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Education / Branch</label>
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
                <label className="form-label">Short Bio</label>
                <textarea 
                  className="form-textarea" 
                  rows="2"
                  placeholder="Tell founders what you are passionate about..."
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                />
              </div>
            </>
          )}

          {/* Founder Profile Fields */}
          {role === 'founder' && (
            <>
              <div className="form-group">
                <label className="form-label">Startup Focus / Interests</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="CleanTech, EdTech, SaaS, AI/ML"
                  value={interests} 
                  onChange={(e) => setInterests(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Founder Experience</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. First-time Founder / Product Builder"
                  value={experience} 
                  onChange={(e) => setExperience(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Founder Bio / Vision</label>
                <textarea 
                  className="form-textarea" 
                  rows="2"
                  placeholder="Share a brief overview of your startup vision..."
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            style={{ marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : `Register as ${role === 'user' ? 'User' : 'Founder'}`}
          </button>
        </form>

        <div className="auth-mode-switch">
          <span>Already have an account?</span>
          <button 
            type="button" 
            className="auth-mode-link"
            onClick={() => onSwitchToLogin(role)}
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}
