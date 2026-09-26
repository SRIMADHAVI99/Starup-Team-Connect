import React, { useState } from 'react';
import LoginTabs from '../components/LoginTabs';
import StartupTeamLogo from '../components/StartupTeamLogo';

/**
 * Login Page
 * Handles role-based login for both Users and Founders
 * with an integrated tab switch.
 */
export default function Login({ onLoginSuccess, onSwitchToRegister, apiBaseUrl }) {
  const [role, setRole] = useState('user'); // 'user' | 'founder'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Endpoint: /api/users/login or /api/founders/login
      const endpoint = role === 'user' 
        ? `${apiBaseUrl}/api/users/login` 
        : `${apiBaseUrl}/api/founders/login`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data, role);
      } else {
        const errorText = await res.text();
        setErrorMsg(errorText || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the backend server. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <StartupTeamLogo size={42} showText={true} textStyle={{ fontSize: '1.4rem' }} />
          </div>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {/* User / Founder Role Tabs */}
        <LoginTabs activeRole={role} onRoleChange={(newRole) => {
          setRole(newRole);
          setErrorMsg('');
        }} />

        {/* Error Alert */}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            style={{ marginTop: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : `Sign In as ${role === 'user' ? 'User' : 'Founder'}`}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="auth-mode-switch">
          <span>Don't have an account?</span>
          <button 
            type="button" 
            className="auth-mode-link"
            onClick={() => onSwitchToRegister(role)}
          >
            Create {role === 'user' ? 'User' : 'Founder'} Account
          </button>
        </div>
      </div>
    </div>
  );
}
