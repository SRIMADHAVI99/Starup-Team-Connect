import React from 'react';

/**
 * StartupTeamLogo Component
 * Professional technology-style logo for Startup Team Connect.
 * Features a clean blue circular connection icon with 3 inner nodes (Founder, Developer, Team)
 * and distinct brand text colors ("Startup" dark navy, "Team" blue, "Connect" dark navy).
 */
export default function StartupTeamLogo({ size = 32, showText = true, isDark = false, textStyle = {} }) {
  const primaryBlue = '#2563EB';
  const navyText = isDark ? '#F8FAFC' : '#0F172A';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      {/* Abstract Blue Circular Connection Symbol */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blue Circle Outer Frame */}
        <circle cx="50" cy="50" r="46" fill={primaryBlue} />

        {/* Inner White Connection Network */}
        <path
          d="M 50 24 L 74 68 L 26 68 Z"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* Connecting Rays to Hub */}
        <line x1="50" y1="24" x2="50" y2="48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <line x1="74" y1="68" x2="50" y2="48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <line x1="26" y1="68" x2="50" y2="48" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" />

        {/* 3 Node Dots (Founder, Developer, Team) */}
        <circle cx="50" cy="24" r="7" fill="#FFFFFF" />
        <circle cx="74" cy="68" r="7" fill="#FFFFFF" />
        <circle cx="26" cy="68" r="7" fill="#FFFFFF" />

        {/* Central Hub Dot */}
        <circle cx="50" cy="48" r="5" fill="#FFFFFF" />
      </svg>

      {showText && (
        <span
          style={{
            fontWeight: 800,
            fontSize: '1.2rem',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            ...textStyle
          }}
        >
          <span style={{ color: navyText }}>Startup </span>
          <span style={{ color: primaryBlue }}>Team </span>
          <span style={{ color: navyText }}>Connect</span>
        </span>
      )}
    </div>
  );
}

