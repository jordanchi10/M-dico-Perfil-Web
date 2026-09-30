import React from "react";

interface Icon3DProps {
  className?: string;
}

export const IconHome3D: React.FC<Icon3DProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="home3d-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="0.7" stopColor="#e2e8f0" stopOpacity="0.85" />
        <stop offset="1" stopColor="#94a3b8" />
      </linearGradient>
      <filter id="home3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    <path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      fill="url(#home3d-grad)"
      filter="url(#home3d-shadow)"
    />
  </svg>
);

export const IconDoctor3D: React.FC<Icon3DProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="doc3d-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="0.6" stopColor="#e0e7ff" />
        <stop offset="1" stopColor="#a5b4fc" />
      </linearGradient>
      <filter id="doc3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    <circle cx="12" cy="7" r="4" fill="url(#doc3d-grad)" filter="url(#doc3d-shadow)" />
    <path
      d="M4 21V19C4 16.2386 7.58172 14 12 14C16.4183 14 20 16.2386 20 19V21"
      stroke="url(#doc3d-grad)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const IconServices3D: React.FC<Icon3DProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="serv3d-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="0.7" stopColor="#ccfbf1" />
        <stop offset="1" stopColor="#5eead4" />
      </linearGradient>
      <filter id="serv3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill="url(#serv3d-grad)"
      filter="url(#serv3d-shadow)"
    />
  </svg>
);

export const IconReviews3D: React.FC<Icon3DProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rev3d-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="0.6" stopColor="#fef08a" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
      <filter id="rev3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill="url(#rev3d-grad)"
      filter="url(#rev3d-shadow)"
    />
  </svg>
);

export const IconAppointment3D: React.FC<Icon3DProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="app3d-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="0.6" stopColor="#d1fae5" />
        <stop offset="1" stopColor="#6ee7b7" />
      </linearGradient>
      <filter id="app3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    <rect x="3" y="4" width="18" height="18" rx="3" fill="url(#app3d-grad)" filter="url(#app3d-shadow)" />
    <path d="M16 2V6M8 2V6M3 10H21" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="15" r="2" fill="#047857" />
  </svg>
);

export const IconWhatsapp3D: React.FC<Icon3DProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wa3d-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="0.6" stopColor="#86efac" />
        <stop offset="1" stopColor="#22c55e" />
      </linearGradient>
      <filter id="wa3d-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
    <path
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
      fill="url(#wa3d-grad)"
      filter="url(#wa3d-shadow)"
    />
    <path
      d="M17 15.5c-.3.8-1.5 1.5-2.2 1.5-.6 0-1.4-.3-3.2-1.3-2.3-1.3-3.8-3.7-3.9-3.9s-.9-1.2-.9-2.3c0-1.1.6-1.6.8-1.9.2-.2.5-.3.8-.3h.6c.2 0 .4.1.6.5.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5l-.5.6c-.2.2-.4.4-.2.7.2.4.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.3.1.5.1.7-.1.3-.3.7-.8.9-1.1.2-.3.4-.3.7-.2.3.1 1.8.9 2.1 1 .3.2.5.3.6.4.1.2.1.8-.2 1.6z"
      fill="#065f46"
    />
  </svg>
);
