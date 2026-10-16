import { useId, useMemo, type CSSProperties, type ReactNode } from 'react';
import { palette } from '../shared/palette.js';
import { clamp, createRandom } from '../shared/random.js';

export interface AuroraProps {
  colors?: string[];
  ribbons?: number;
  blur?: number;
  speed?: number;
  intensity?: number;
  amplitude?: number;
  rays?: boolean | number;
  stars?: boolean | number;
  skew?: number;
  background?: string | string[];
  seed?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const TILE = 1200;
const VH = 600;
const PAD = 240;
const STEP = 12;
const DEFAULT_COLORS = ['#34d399', '#22d3ee', '#a78bfa'];

const CSS = `@keyframes au-slide{to{transform:translateX(-${TILE}px)}}@keyframes au-sway{from{transform:scaleY(.88)}to{transform:scaleY(1.12)}}@keyframes au-pulse{from{opacity:.62}to{opacity:1}}@keyframes au-twinkle{from{opacity:.12}to{opacity:1}}@media (prefers-reduced-motion:reduce){.au-anim{animation:none!important}}`;
const TAU = Math.PI * 2;

interface Ribbon {
  d: string;
  base: number;
  rays: { points: string; copy: string }[];
}

function buildRibbons(count: number, amplitude: number, skew: number, rayTotal: number, seed: number): Ribbon[] {
  const rng = createRandom(seed);
  const lean = Math.tan((skew * Math.PI) / 180);
  return Array.from({ length: count }, (_, i) => {
    const base = VH * (0.5 + 0.06 * i) + rng.range(-20, 20);
    const amp = amplitude * rng.range(0.7, 1.3);
    const c1 = rng.int(1, 2);
    const c2 = rng.int(3, 4);
    const c3 = rng.int(2, 4);
    const p1 = rng.range(0, TAU);
    const p2 = rng.range(0, TAU);
    const p3 = rng.range(0, TAU);
    const reach = VH * rng.range(0.3, 0.42);
    const low = (x: number) => base + amp * Math.sin((TAU * c1 * x) / TILE + p1) + 0.45 * amp * Math.sin((TAU * c2 * x) / TILE + p2);
    const tall = (x: number) => reach * (0.7 + 0.3 * Math.sin((TAU * c3 * x) / TILE + p3));

    const bottom: string[] = [];
    const top: string[] = [];
    for (let x = -PAD; x <= TILE * 2 + PAD; x += STEP) {
      const h = tall(x);
      bottom.push(`${x} ${low(x).toFixed(1)}`);
      top.push(`${(x + lean * h).toFixed(1)} ${(low(x) - h).toFixed(1)}`);
    }
    const d = `M${bottom.join('L')}L${top.reverse().join('L')}Z`;

    const perRibbon = Math.round(rayTotal / count);
    const rays = Array.from({ length: perRibbon }, () => {
      const x = rng.range(0, TILE);
      const w = rng.range(1.5, 4.5);
      const len = tall(x) * rng.range(0.45, 1.05);
      const shape = (dx: number) => {
        const y = low(x);
        const tip = lean * len;
        return `${(x + dx - w / 2).toFixed(1)},${y.toFixed(1)} ${(x + dx + w / 2).toFixed(1)},${y.toFixed(1)} ${(x + dx + w / 2 + tip).toFixed(1)},${(y - len).toFixed(1)} ${(x + dx - w / 2 + tip).toFixed(1)},${(y - len).toFixed(1)}`;
      };
      return { points: shape(0), copy: shape(TILE) };
    });
    return { d, base, rays };
  });
}

export function Aurora({
  colors: colorProp = DEFAULT_COLORS,
  ribbons = 3,
  blur = 14,
  speed = 1,
  intensity = 0.8,
  amplitude = 46,
  rays = true,
  stars = true,
  skew = 6,
  background = ['#04060f', '#0a1428', '#10283a'],
  seed = 1,
  height = 420,
  width = '100%',
  className,
  style,
  children,
}: AuroraProps) {
  const colors = palette(colorProp, DEFAULT_COLORS);
  const count = Math.round(clamp(ribbons, 1, 8));
  const rayTotal = rays === true ? 28 : rays === false ? 0 : Math.max(0, Math.round(rays));
  const starTotal = stars === true ? 70 : stars === false ? 0 : Math.max(0, Math.round(stars));
  const id = useId().replace(/:/g, '');
  const shapes = useMemo(() => buildRibbons(count, amplitude, skew, rayTotal, seed), [count, amplitude, skew, rayTotal, seed]);
  const sky = useMemo(() => {
    const rng = createRandom(seed + 101);
    return Array.from({ length: starTotal }, () => ({
      left: rng.range(0, 100),
      top: rng.range(0, 62),
      size: rng.range(0.8, 2.2),
      alpha: rng.range(0.4, 0.95),
      dur: rng.range(3, 7),
      delay: rng.range(0, 6),
    }));
  }, [starTotal, seed]);

  const dir = speed < 0 ? 'alternate-reverse' : 'alternate';
  const rate = Math.abs(speed);
  const color = (i: number) => colors[i % colors.length];

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width,
        height,
        background: Array.isArray(background) ? `linear-gradient(to bottom, ${background.join(',')})` : background,
        ...style,
      }}
    >
      <style>{CSS}</style>
      {sky.map((s, i) => (
        <i
          key={i}
          aria-hidden="true"
          className="au-anim"
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#fff',
            opacity: s.alpha,
            animation: speed ? `au-twinkle ${s.dur / rate}s ease-in-out ${-s.delay}s infinite alternate` : 'none',
          }}
        />
      ))}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${TILE} ${VH}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          {blur > 0 && (
            <filter id={`${id}-glow`} x="-5%" y="-35%" width="110%" height="170%">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          )}
          {shapes.map((_, i) => (
            <g key={i}>
              <linearGradient id={`${id}-r${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color(i + 1)} stopOpacity="0" />
                <stop offset="0.5" stopColor={color(i + 1)} stopOpacity="0.28" />
                <stop offset="0.86" stopColor={color(i)} stopOpacity="0.9" />
                <stop offset="1" stopColor={color(i)} stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id={`${id}-y${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color(i + 1)} stopOpacity="0" />
                <stop offset="1" stopColor={color(i)} stopOpacity="0.8" />
              </linearGradient>
            </g>
          ))}
        </defs>
        {shapes.map((ribbon, i) => {
          const move = (content: ReactNode, filter?: string) => (
            <g
              className="au-anim"
              filter={filter}
              style={{
                transformOrigin: `0px ${ribbon.base}px`,
                animation: speed
                  ? `au-sway ${(11 + i * 3) / rate}s ease-in-out infinite ${dir}, au-pulse ${(7 + i * 2.5) / rate}s ease-in-out infinite ${dir}`
                  : 'none',
              }}
            >
              <g
                className="au-anim"
                style={{ animation: speed ? `au-slide ${(110 + i * 45) / rate}s linear infinite ${speed < 0 ? 'reverse' : 'normal'}` : 'none' }}
              >
                {content}
              </g>
            </g>
          );
          return (
            <g key={i} opacity={clamp(intensity, 0, 1) * (1 - i * 0.08)}>
              {move(<path d={ribbon.d} fill={`url(#${id}-r${i})`} />, blur > 0 ? `url(#${id}-glow)` : undefined)}
              {ribbon.rays.length > 0 &&
                move(
                  <g fill={`url(#${id}-y${i})`}>
                    {ribbon.rays.map((ray, k) => (
                      <g key={k}>
                        <polygon points={ray.points} />
                        <polygon points={ray.copy} />
                      </g>
                    ))}
                  </g>,
                )}
            </g>
          );
        })}
      </svg>
      {children && <div style={{ position: 'relative', height: '100%' }}>{children}</div>}
    </div>
  );
}
