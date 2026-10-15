import { useMemo, type CSSProperties } from 'react';

export interface WavesProps {
  colors?: string[];
  height?: number;
  width?: number | string;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  layers?: number;
  opacity?: number;
  flip?: boolean;
  className?: string;
  style?: CSSProperties;
}

const TILE = 1200;
const STEP = 10;
const CSS = `@keyframes wl-slide{to{transform:translateX(-${TILE}px)}}@media (prefers-reduced-motion:reduce){.wl-layer{animation:none!important}}`;

function wavePath(base: number, amp: number, crests: number, phase: number, height: number) {
  let d = `M0 ${height}`;
  for (let x = 0; x <= TILE * 2; x += STEP) {
    const y = base + amp * Math.sin((x / TILE) * Math.PI * 2 * crests + phase);
    d += `L${x} ${y.toFixed(2)}`;
  }
  return `${d}L${TILE * 2} ${height}Z`;
}

export function Waves({
  colors = ['#38bdf8', '#0ea5e9', '#0369a1'],
  height = 160,
  width = '100%',
  amplitude = 20,
  frequency = 2,
  speed = 1,
  layers = 3,
  opacity = 0.6,
  flip = false,
  className,
  style,
}: WavesProps) {
  const count = Math.max(1, Math.round(layers));
  const crests = Math.max(1, Math.round(frequency));
  const paths = useMemo(() => {
    const usable = Math.max(0, height - amplitude * 2);
    return Array.from({ length: count }, (_, i) =>
      wavePath(amplitude + (usable * i * 0.6) / count, amplitude, crests, i * 1.3, height),
    );
  }, [count, crests, amplitude, height]);

  return (
    <svg
      className={className}
      style={{ display: 'block', width, height, transform: flip ? 'scaleY(-1)' : undefined, ...style }}
      viewBox={`0 0 ${TILE} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <style>{CSS}</style>
      {paths.map((d, i) => (
        <path
          key={i}
          className="wl-layer"
          d={d}
          fill={colors[i % colors.length]}
          fillOpacity={opacity}
          style={{
            animation: speed
              ? `wl-slide ${(14 * (1 + i * 0.35)) / Math.abs(speed)}s linear infinite ${speed < 0 ? 'reverse' : 'normal'}`
              : 'none',
          }}
        />
      ))}
    </svg>
  );
}
