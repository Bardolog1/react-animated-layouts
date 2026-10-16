import { useEffect, useId, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { palette } from '../shared/palette.js';
import { clamp, createRandom } from '../shared/random.js';
import { runLoop, useLatest, useReducedMotion } from '../shared/runtime.js';

export interface BlobProps {
  blobs?: number;
  points?: number;
  randomness?: number;
  smoothness?: number;
  size?: number;
  speed?: number;
  rotate?: number;
  colors?: string[];
  gradient?: boolean;
  stroke?: string;
  strokeWidth?: number;
  blur?: number;
  opacity?: number;
  seed?: number;
  background?: string;
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface Node {
  angle: number;
  radius: number;
  amp: number;
  freq: number;
  phase: number;
}

interface Layer {
  nodes: Node[];
  cx: number;
  cy: number;
  floor: number;
  spin: number;
}

function buildLayers(blobs: number, points: number, randomness: number, size: number, seed: number): Layer[] {
  const rng = createRandom(seed);
  return Array.from({ length: blobs }, (_, i) => {
    const radius = 90 * size * Math.max(0.35, 1 - i * 0.14);
    const nodes = Array.from({ length: points }, (__, k) => ({
      angle: (k / points) * Math.PI * 2 + (rng.next() - 0.5) * (Math.PI / points) * randomness,
      radius: radius * (1 - randomness * 0.45 * rng.next()),
      amp: radius * randomness * 0.45 * (0.4 + 0.6 * rng.next()),
      freq: rng.range(0.35, 0.85),
      phase: rng.range(0, Math.PI * 2),
    }));
    return {
      nodes,
      cx: i ? rng.range(-14, 14) : 0,
      cy: i ? rng.range(-14, 14) : 0,
      floor: radius * 0.2,
      spin: i % 2 ? -0.6 : 1,
    };
  });
}

const fmt = (n: number) => n.toFixed(2);

function pathAt(layer: Layer, t: number, smoothness: number): string {
  const n = layer.nodes.length;
  const pts = layer.nodes.map((node) => {
    const r = Math.max(layer.floor, node.radius + node.amp * Math.sin(node.freq * t + node.phase));
    return [layer.cx + r * Math.cos(node.angle), layer.cy + r * Math.sin(node.angle)];
  });
  const k = smoothness / 6;
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += `C${fmt(p1[0] + (p2[0] - p0[0]) * k)} ${fmt(p1[1] + (p2[1] - p0[1]) * k)} ${fmt(p2[0] - (p3[0] - p1[0]) * k)} ${fmt(p2[1] - (p3[1] - p1[1]) * k)} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return `${d}Z`;
}

const DEFAULT_COLORS = ['#6366f1', '#14b8a6', '#f472b6'];

export function Blob({
  blobs = 3,
  points = 6,
  randomness = 0.4,
  smoothness = 1,
  size = 0.7,
  speed = 1,
  rotate = 0,
  colors: colorProp = DEFAULT_COLORS,
  gradient = true,
  stroke,
  strokeWidth = 0,
  blur = 0,
  opacity = 0.85,
  seed = 1,
  background,
  height = 360,
  width = '100%',
  className,
  style,
  children,
}: BlobProps) {
  const colors = palette(colorProp, DEFAULT_COLORS);
  const count = Math.round(clamp(blobs, 1, 8));
  const nodes = Math.round(clamp(points, 3, 12));
  const spread = clamp(randomness, 0, 1);
  const smooth = clamp(smoothness, 0, 1.5);
  const id = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const animate = !reduced && (speed !== 0 || rotate !== 0);

  const layers = useMemo(() => buildLayers(count, nodes, spread, clamp(size, 0.1, 1), seed), [count, nodes, spread, size, seed]);
  const initial = useMemo(() => layers.map((l) => pathAt(l, 0, smooth)), [layers, smooth]);

  const rootRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  const clock = useRef({ t: 0, angle: 0 });
  const live = useLatest({ speed, rotate, smooth });
  const drawRef = useRef<((dt: number) => void) | undefined>(undefined);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const draw = (dt: number) => {
      const { speed: s, rotate: r, smooth: sm } = live.current;
      clock.current.t += dt * s;
      clock.current.angle += dt * r;
      layers.forEach((layer, i) => {
        pathRefs.current[i]?.setAttribute('d', pathAt(layer, clock.current.t, sm));
        groupRefs.current[i]?.setAttribute('transform', `rotate(${fmt(clock.current.angle * layer.spin)} ${fmt(layer.cx)} ${fmt(layer.cy)})`);
      });
    };
    drawRef.current = draw;
    return runLoop(root, draw, animate);
  }, [layers, animate, live]);

  useEffect(() => {
    if (!animate) drawRef.current?.(0);
  });

  const useGradient = gradient && colors.length > 1;
  return (
    <div ref={rootRef} className={className} style={{ position: 'relative', overflow: 'hidden', width, height, background, ...style }}>
      <svg
        aria-hidden="true"
        viewBox="-100 -100 200 200"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', filter: blur ? `blur(${blur}px)` : undefined }}
      >
        {useGradient && (
          <defs>
            {layers.map((_, i) => (
              <linearGradient key={i} id={`${id}-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={colors[i % colors.length]} />
                <stop offset="1" stopColor={colors[(i + 1) % colors.length]} />
              </linearGradient>
            ))}
          </defs>
        )}
        {layers.map((layer, i) => (
          <g key={i} ref={(el) => { groupRefs.current[i] = el; }}>
            <path
              ref={(el) => { pathRefs.current[i] = el; }}
              d={initial[i]}
              fill={useGradient ? `url(#${id}-${i})` : colors[i % colors.length]}
              fillOpacity={opacity}
              stroke={strokeWidth > 0 ? (stroke ?? colors[i % colors.length]) : 'none'}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
      {children && <div style={{ position: 'relative', height: '100%' }}>{children}</div>}
    </div>
  );
}
