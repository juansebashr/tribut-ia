import React from 'react';

interface FiscolLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const FiscolLogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`fiscol-logo-svg ${className}`}
      style={{ flexShrink: 0, display: 'inline-block' }}
      aria-label="Fiscol Logo"
    >
      <defs>
        <linearGradient id="fiscolBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="60%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="fiscolBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="fiscolLetterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0fdf4" />
        </linearGradient>
        <linearGradient id="fiscolSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <filter id="sparkleGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Squircle Base Frame */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="15"
        ry="15"
        fill="url(#fiscolBgGrad)"
        stroke="url(#fiscolBorderGrad)"
        strokeWidth="2.5"
      />

      {/* Tax Analytics Accent Bars at Base */}
      <rect x="28" y="44" width="4.5" height="4" rx="1.5" fill="#38bdf8" opacity="0.6" />
      <rect x="35" y="41" width="4.5" height="7" rx="1.5" fill="#10b981" opacity="0.8" />
      <rect x="42" y="37" width="4.5" height="11" rx="1.5" fill="#6366f1" opacity="0.9" />

      {/* Bold Modern "F" Body */}
      {/* Vertical Stem */}
      <rect x="15" y="14" width="8.5" height="34" rx="3.5" fill="url(#fiscolLetterGrad)" />
      {/* Top Horizontal Bar */}
      <rect x="15" y="14" width="27" height="8.5" rx="3.5" fill="url(#fiscolLetterGrad)" />
      {/* Middle Horizontal Bar */}
      <rect x="15" y="27.5" width="19" height="7.5" rx="3" fill="url(#fiscolLetterGrad)" />

      {/* AI Star / Sparkle (Top-Right of F) */}
      <g filter="url(#sparkleGlowFilter)">
        <path
          d="M47 8 Q47 16 55 16 Q47 16 47 24 Q47 16 39 16 Q47 16 47 8 Z"
          fill="url(#fiscolSparkleGrad)"
        />
        <circle cx="47" cy="16" r="1.5" fill="#ffffff" />
      </g>

      {/* Fiscal Precision Accent */}
      <circle cx="39" cy="22" r="1.5" fill="#34d399" opacity="0.9" />
    </svg>
  );
};

export const FiscolLogo: React.FC<FiscolLogoProps> = ({
  size = 36,
  showText = true,
  className = '',
  subtitle = 'Suite Tributaria DIAN',
  onClick,
}) => {
  return (
    <div
      className={`fiscol-brand-lockup ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
    >
      <FiscolLogoIcon size={size} />
      {showText && (
        <div className="fiscol-brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            className="fiscol-brand-title"
            style={{
              fontSize: `${Math.max(14, Math.round(size * 0.44))}px`,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary, #0f172a)',
              lineHeight: 1.15,
            }}
          >
            Fiscol
          </span>
          {subtitle && (
            <span
              className="fiscol-brand-subtitle"
              style={{
                fontSize: `${Math.max(9, Math.round(size * 0.28))}px`,
                fontWeight: 600,
                color: 'var(--text-muted, #64748b)',
                letterSpacing: '0.01em',
                lineHeight: 1.1,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
