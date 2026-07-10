import React from 'react';

const Logo = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {/* Document */}
      <g>
        {/* Document body */}
        <rect x="22" y="10" width="44" height="58" rx="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />

        {/* Text lines on the document */}
        <rect x="31" y="22" width="22" height="3.5" rx="1.75" fill="#10b981" />
        <rect x="31" y="31" width="27" height="3.5" rx="1.75" fill="#e2e8f0" />
        <rect x="31" y="40" width="20" height="3.5" rx="1.75" fill="#e2e8f0" />
        <rect x="31" y="49" width="24" height="3.5" rx="1.75" fill="#e2e8f0" />
      </g>

      {/* Magnifying glass (darker green for contrast) - not tilted */}
      {/* Lens circle */}
      <circle cx="58" cy="62" r="18" fill="#ffffff" stroke="#059669" strokeWidth="3.5" />

      {/* Checkmark inside lens */}
      <path d="M49 62 L55 68 L67 56" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Handle */}
      <line x1="71" y1="75" x2="84" y2="88" stroke="#059669" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
};

export default Logo;
