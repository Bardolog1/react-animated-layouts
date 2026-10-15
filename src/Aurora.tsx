import type { CSSProperties, ReactNode } from 'react';

export interface AuroraProps {
  colors?: string[];
  height?: number | string;
  blobs?: number;
  blur?: number;
  speed?: number;
  opacity?: number;
  background?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const CSS = `@keyframes ala-drift{to{transform:translate(var(--dx),var(--dy)) scale(1.15)}}@media (prefers-reduced-motion:reduce){.ala-blob{animation:none!important}}`;

export function Aurora({
  colors = ['#22d3ee', '#a78bfa', '#f472b6'],
  height = 320,
  blobs = 5,
  blur = 60,
  speed = 1,
  opacity = 0.7,
  background = '#0b1020',
  className,
  style,
  children,
}: AuroraProps) {
  const count = Math.max(1, Math.round(blobs));
  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', height, background, ...style }}
    >
      <style>{CSS}</style>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, filter: `blur(${blur}px)` }}>
        {Array.from({ length: count }, (_, i) => {
          const size = 40 + ((i * 17) % 30);
          return (
            <div
              key={i}
              className="ala-blob"
              style={
                {
                  position: 'absolute',
                  left: `${(i * 37) % 70}%`,
                  top: `${(i * 53) % 60}%`,
                  width: `${size}%`,
                  height: `${size}%`,
                  borderRadius: '50%',
                  background: colors[i % colors.length],
                  opacity,
                  '--dx': `${(i % 2 ? -1 : 1) * (20 + i * 6)}%`,
                  '--dy': `${(i % 3 === 0 ? -1 : 1) * (15 + i * 5)}%`,
                  animation: speed
                    ? `ala-drift ${(16 + i * 4) / Math.abs(speed)}s ease-in-out infinite ${speed < 0 ? 'alternate-reverse' : 'alternate'}`
                    : 'none',
                } as CSSProperties
              }
            />
          );
        })}
      </div>
      {children && <div style={{ position: 'relative' }}>{children}</div>}
    </div>
  );
}
