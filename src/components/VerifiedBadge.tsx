import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface VerifiedBadgeProps {
  type?: 'owner' | 'elon' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type = 'owner',
  size = 'md',
  className = '',
  showTooltip = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Dimension mapping
  const sizeClasses = {
    sm: 'w-[18px] h-[18px]',
    md: 'w-[22px] h-[22px]',
    lg: 'w-[26px] h-[26px]',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  // Tooltip content
  const tooltipText =
    type === 'owner'
      ? 'Verified Owner - Elonverse Founder • Blue Verified'
      : type === 'elon'
      ? 'Verified Official - CEO & Chief Engineer • Gold & Blue Verified'
      : 'Verified Organization Leader';

  return (
    <span
      className={`relative inline-flex items-center gap-1 align-middle select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. If Elon, also show the Official Gold Star badge first */}
      {type === 'elon' && (
        <span
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 border-2 border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.6)] flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-110`}
          title="CEO &amp; Organization Verified"
        >
          <Star className="text-black fill-black" style={{ width: iconSizes[size], height: iconSizes[size] }} />
        </span>
      )}

      {/* 2. Twitter / X Blue Check Badge */}
      <span
        className={`verified-badge ${sizeClasses[size]} rounded-full bg-[#1D9BF0] border-2 border-white shadow-[0_0_10px_rgba(29,155,240,0.65)] flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-[0_0_14px_rgba(29,155,240,0.9)]`}
      >
        {/* Authentic Twitter Checkmark SVG */}
        <svg
          viewBox="0 0 24 24"
          className="text-white fill-white"
          style={{ width: iconSizes[size], height: iconSizes[size] }}
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </span>

      {/* Interactive Tooltip */}
      {showTooltip && isHovered && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-neutral-200 shadow-2xl pointer-events-none animate-fade-in flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1D9BF0]" />
          <span>{tooltipText}</span>
        </span>
      )}
    </span>
  );
};
