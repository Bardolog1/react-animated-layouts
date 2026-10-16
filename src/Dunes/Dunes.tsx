import { useId, useMemo, type CSSProperties, type ReactNode } from 'react';
import { palette } from '../shared/palette.js';
import { clamp, createRandom } from '../shared/random.js';

export interface DunesProps {
  layers?: number;
  variant?: 'dunes' | 'mountains';
  roughness?: number;
  colors?: string[];
  speed?: number;
  height?: number | string;
  width?: number | string;
  sky?: string[] | false;
  sun?: boolean;
  sunColor?: string;
  sunSize?: number;
  sunPosition?: [number, number];
  fog?: number;
  flip?: boolean;
  seed?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const TILE = 1200;
const VH = 400;
const STEP = 6;
const CSS = `@keyframes du-slide{to{transform:translateX(-${TILE}px)}}@media (prefers-reduced-motion:reduce){.du-layer{animation:none!important}}`;

function profile(variant: 'dunes' | 'mountains', roughness: number, base: number, rng: ReturnType<typeof createRandom>) {
  const octaves = [1, 2, 4].map((mul, o) => ({
    weight: [1, 0.5 * roughness, 0.25 * roughness][o],
    cells: base * mul + (o ? 1 : 0),
  }));
  const octaveValues = octaves.map((o) => Array.from({ length: o.cells }, () => rng.next()));
  const norm = octaves.reduce((sum, o) => sum + o.weight, 0);
  return (u: number) => {
    let total = 0;
    octaves.forEach((o, k) => {
      const pos = (u % 1) * o.cells;
      const i = Math.floor(pos);
      let f = pos - i;
      if (variant === 'dunes') f = (1 - Math.cos(f * Math.PI)) / 2;
      const a = octaveValues[k][i % o.cells];
      const b = octaveValues[k][(i + 1) % o.cells];
      total += o.weight * (a + (b - a) * f);
    });
    const v = total / norm;
    return variant === 'dunes' ? v * v * (3 - 2 * v) : v;
  };
}

function buildLayers(count: number, variant: 'dunes' | 'mountains', roughness: number, seed: number) {
  const rng = createRandom(seed);
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 1;
    const baseY = VH * (0.4 + 0.42 * t);
    const amp = VH * (variant === 'mountains' ? 0.24 - 0.07 * t : 0.1 + 0.07 * t);
    const h = profile(variant, roughness, variant === 'mountains' ? 4 + i : 2 + (i % 2), rng);
    let d = `M0 ${VH}`;
    for (let x = 0; x <= TILE * 2; x += STEP) d += `L${x} ${(baseY - amp * h(x / TILE)).toFixed(1)}`;
    return { d: `${d}L${TILE * 2} ${VH}Z`, top: baseY - amp, t };
  });
}

const DEFAULT_COLORS = ['#c98a76', '#a96a6e', '#7f4c65', '#58355a', '#33223f'];

export function Dunes({
  layers = 5,
  variant = 'dunes',
  roughness = 0.5,
  colors: colorProp = DEFAULT_COLORS,
  speed = 1,
  height = 360,
  width = '100%',
  sky = ['#1f2a52', '#7a4a7e', '#e8957a', '#f6d2a0'],
  sun = true,
  sunColor = '#fff1d0',
  sunSize = 110,
  sunPosition = [0.7, 0.4],
  fog = 0.35,
  flip = false,
  seed = 1,
  className,
  style,
  children,
}: DunesProps) {
  const colors = palette(colorProp, DEFAULT_COLORS);
  const count = Math.round(clamp(layers, 1, 10));
  const rough = clamp(roughness, 0, 1);
  const id = useId().replace(/:/g, '');
  const shapes = useMemo(() => buildLayers(count, variant, rough, seed), [count, variant, rough, seed]);
  const haze = sky && sky.length ? sky[sky.length - 1] : colors[0];
  const pick = (i: number) => colors[Math.round((count > 1 ? i / (count - 1) : 1) * (colors.length - 1))];

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width,
        height,
        background: sky && sky.length ? `linear-gradient(to bottom, ${sky.join(',')})` : undefined,
        ...style,
      }}
    >
      <style>{CSS}</style>
      {sun && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${sunPosition[0] * 100}%`,
            top: `${sunPosition[1] * 100}%`,
            width: sunSize * 3.2,
            height: sunSize * 3.2,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle closest-side, ${sunColor} 0, ${sunColor} 31%, color-mix(in srgb, ${sunColor} 38%, transparent) 33%, transparent 100%)`,
          }}
        />
      )}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${TILE} ${VH}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: flip ? 'scaleY(-1)' : undefined }}
      >
        <defs>
          <linearGradient id={`${id}-fog`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={haze} stopOpacity="0" />
            <stop offset="1" stopColor={haze} stopOpacity={clamp(fog, 0, 1)} />
          </linearGradient>
        </defs>
        {shapes.map((layer, i) => (
          <g key={i}>
            <path
              className="du-layer"
              d={layer.d}
              fill={pick(i)}
              style={{
                animation: speed
                  ? `du-slide ${70 / (Math.abs(speed) * (0.25 + 0.75 * layer.t))}s linear infinite ${speed < 0 ? 'reverse' : 'normal'}`
                  : 'none',
              }}
            />
            {fog > 0 && i < count - 1 && <rect x="0" y={layer.top} width={TILE} height={VH - layer.top} fill={`url(#${id}-fog)`} />}
          </g>
        ))}
      </svg>
      {children && <div style={{ position: 'relative', height: '100%' }}>{children}</div>}
    </div>
  );
}
