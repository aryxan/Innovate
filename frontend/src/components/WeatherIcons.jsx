import React from 'react';

export const SunnyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" fill="#FCD34D" className="animate-pulse" />
    <g stroke="#FCD34D" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="1" x2="12" y2="3" className="animate-pulse" />
      <line x1="12" y1="21" x2="12" y2="23" className="animate-pulse" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" className="animate-pulse" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" className="animate-pulse" />
      <line x1="1" y1="12" x2="3" y2="12" className="animate-pulse" />
      <line x1="21" y1="12" x2="23" y2="12" className="animate-pulse" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" className="animate-pulse" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" className="animate-pulse" />
    </g>
  </svg>
);

export const RainIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25"
      stroke="#60A5FA"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#3B82F6"
      opacity="0.7"
    />
    <g className="animate-rain">
      <line x1="8" y1="19" x2="8" y2="21" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="19" x2="16" y2="21" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
    </g>
    <style jsx>{`
      @keyframes rain {
        0%, 100% { opacity: 0.3; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(2px); }
      }
      .animate-rain {
        animation: rain 1s ease-in-out infinite;
      }
    `}</style>
  </svg>
);

export const ThunderIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M19 16.9A5 5 0 0018 7h-1.26a8 8 0 10-11.62 9"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#6B7280"
      opacity="0.8"
    />
    <polygon
      points="13 11 9 17 11 17 11 21 15 15 13 15 13 11"
      fill="#FCD34D"
      stroke="#F59E0B"
      strokeWidth="1"
      className="animate-lightning"
    />
    <style jsx>{`
      @keyframes lightning {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.3; }
      }
      .animate-lightning {
        animation: lightning 2s ease-in-out infinite;
      }
    `}</style>
  </svg>
);

export const CloudyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#6B7280"
      opacity="0.6"
    />
  </svg>
);

export const getWeatherIcon = (weatherType, size = 20) => {
  switch (weatherType) {
    case 'sunny':
      return <SunnyIcon size={size} />;
    case 'rain':
      return <RainIcon size={size} />;
    case 'thunder':
      return <ThunderIcon size={size} />;
    case 'cloudy':
      return <CloudyIcon size={size} />;
    default:
      return <CloudyIcon size={size} />;
  }
};

export default { SunnyIcon, RainIcon, ThunderIcon, CloudyIcon, getWeatherIcon };
