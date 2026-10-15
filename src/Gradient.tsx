import type { CSSProperties, ReactNode } from 'react';

export interface GradientProps {
  colors?: string[];
  angle?: number;
  height?: number | string;
  speed?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const CSS = `@keyframes ala-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@media (prefers-reduced-motion:reduce){.ala-gradient{animation:none!important}}`;

export function Gradient({
  colors = ['#f97316', '#ec4899', '#6366f1'],
  angle = 135,
  height = 320,
  speed = 1,
  className,
  style,
  children,
}: GradientProps) {
  return (
    <div
      className={`ala-gradient${className ? ` ${className}` : ''}`}
      style={{
        height,
        backgroundImage: `linear-gradient(${angle}deg, ${[...colors, colors[0]].join(',')})`,
        backgroundSize: '300% 300%',
        animation: speed ? `ala-shift ${12 / Math.abs(speed)}s ease-in-out infinite ${speed < 0 ? 'reverse' : 'normal'}` : 'none',
        ...style,
      }}
    >
      <style>{CSS}</style>
      {children}
    </div>
  );
}
