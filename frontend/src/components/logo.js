/**
 * StartupTeamLogo Component (Vanilla JS)
 * Professional technology-style logo for Startup Team Connect.
 * Blue circular connection symbol with 3 inner nodes and distinct brand text colors.
 */
export function renderStartupTeamLogo({ size = 32, showText = true, isDark = false, className = '' } = {}) {
  const primaryBlue = '#2563EB';
  const navyText = isDark ? '#F8FAFC' : '#0F172A';

  return `
    <div class="logo-container ${className}" style="display:inline-flex;align-items:center;gap:10px;user-select:none;">
      <svg
        width="${size}"
        height="${size}"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style="flex-shrink:0;"
      >
        <circle cx="50" cy="50" r="46" fill="${primaryBlue}" />
        <path
          d="M 50 24 L 74 68 L 26 68 Z"
          stroke="#FFFFFF"
          stroke-width="4"
          stroke-linejoin="round"
          opacity="0.85"
        />
        <line x1="50" y1="24" x2="50" y2="48" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85" />
        <line x1="74" y1="68" x2="50" y2="48" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85" />
        <line x1="26" y1="68" x2="50" y2="48" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85" />
        <circle cx="50" cy="24" r="7" fill="#FFFFFF" />
        <circle cx="74" cy="68" r="7" fill="#FFFFFF" />
        <circle cx="26" cy="68" r="7" fill="#FFFFFF" />
        <circle cx="50" cy="48" r="5" fill="#FFFFFF" />
      </svg>
      ${showText ? `
        <span class="logo-text" style="font-weight:800;font-size:1.25rem;letter-spacing:-0.02em;white-space:nowrap;font-family:Inter,system-ui,sans-serif;">
          <span style="color:${navyText};">Startup </span>
          <span style="color:${primaryBlue};">Team </span>
          <span style="color:${navyText};">Connect</span>
        </span>
      ` : ''}
    </div>
  `;
}
