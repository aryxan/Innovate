import React from 'react';

export const Logo = ({ className = "w-full h-full" }: { className?: string }) => {
  return (
    <img
      src="/logo.png"
      alt="JalRakshak AI Logo"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};
