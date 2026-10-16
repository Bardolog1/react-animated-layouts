import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { clamp, createRandom } from '../shared/random.js';
import { fitCanvas, observeSize, runLoop, useLatest, useReducedMotion } from '../shared/runtime.js';

export interface ParticlesProps {
  count?: number;
  colors?: string[];
  size?: number | [number, number];
  speed?: number;
  linkDistance?: number;
  linkWidth?: number;
  linkOpacity?: number;
  links?: boolean;
  interaction?: 'none' | 'repel' | 'attract';
  interactionRadius?: number;
  pointerTarget?: 'element' | 'window';
  depth?: number;
  direction?: number;
  shape?: 'circle' | 'square';
  background?: string;
  seed?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

interface Particle {
  u: number;
  v: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  z: number;
  color: string;
}

const MAX_COUNT = 4000;

export function Particles({
  count = 90,
  colors = ['#94a3b8', '#7dd3fc', '#c4b5fd'],
  size = [1, 3],
  speed = 1,
  linkDistance = 120,
  linkWidth = 1,
  linkOpacity = 0.35,
  links = true,
  interaction = 'repel',
  interactionRadius = 140,
  pointerTarget = 'element',
  depth = 0,
  direction,
  shape = 'circle',
  background,
  seed = 1,
  height = 360,
  width = '100%',
  className,
  style,
  children,
}: ParticlesProps) {
  const [sizeMin, sizeMax] = typeof size === 'number' ? [size, size] : size;
  const total = Math.round(clamp(count, 0, MAX_COUNT));
  const colorKey = colors.join('|');
  const reduced = useReducedMotion();
  const animate = !reduced && (speed !== 0 || interaction !== 'none');

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<((dt: number) => void) | undefined>(undefined);
  const live = useLatest({ speed, linkDistance, linkWidth, linkOpacity, links, interaction, interactionRadius, depth, shape });

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!root || !canvas || !ctx) return;

    const palette = colorKey ? colorKey.split('|') : ['#94a3b8'];
    const rng = createRandom(seed);
    const particles: Particle[] = Array.from({ length: total }, () => {
      const heading = direction === undefined ? rng.range(0, Math.PI * 2) : (direction * Math.PI) / 180 + (rng.next() - 0.5) * 0.5;
      const v = rng.range(14, 40);
      return {
        u: rng.next(),
        v: rng.next(),
        x: 0,
        y: 0,
        vx: Math.cos(heading) * v,
        vy: Math.sin(heading) * v,
        r: rng.range(Math.min(sizeMin, sizeMax), Math.max(sizeMin, sizeMax)),
        z: rng.next(),
        color: palette[Math.floor(rng.next() * palette.length)],
      };
    });

    let w = 0;
    let h = 0;
    let dpr = 1;
    const pointer = { x: 0, y: 0, active: false };
    const parallax = { x: 0, y: 0 };
    const rx = new Float32Array(total);
    const ry = new Float32Array(total);
    const next = new Int32Array(total);

    const place = (oldW: number, oldH: number) => {
      for (const p of particles) {
        if (oldW > 0 && oldH > 0) {
          p.x = (p.x / oldW) * w;
          p.y = (p.y / oldH) * h;
        } else {
          p.x = p.u * w;
          p.y = p.v * h;
        }
      }
    };

    const draw = (dt: number) => {
      if (w <= 0 || h <= 0) return;
      const cfg = live.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const tx = pointer.active ? (pointer.x / w - 0.5) * 2 : 0;
      const ty = pointer.active ? (pointer.y / h - 0.5) * 2 : 0;
      const ease = Math.min(1, dt * 3);
      parallax.x += (tx - parallax.x) * ease;
      parallax.y += (ty - parallax.y) * ease;

      const radius = cfg.interactionRadius;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const f = 1 - cfg.depth * (1 - p.z);
        p.x += p.vx * cfg.speed * f * dt;
        p.y += p.vy * cfg.speed * f * dt;
        const m = p.r + 2;
        if (p.x < -m) p.x += w + m * 2;
        else if (p.x > w + m) p.x -= w + m * 2;
        if (p.y < -m) p.y += h + m * 2;
        else if (p.y > h + m) p.y -= h + m * 2;

        const shift = (p.z - 0.5) * 2 * cfg.depth * 40;
        rx[i] = p.x + parallax.x * shift;
        ry[i] = p.y + parallax.y * shift;

        if (cfg.interaction !== 'none' && pointer.active && dt > 0) {
          const dx = pointer.x - rx[i];
          const dy = pointer.y - ry[i];
          const d = Math.hypot(dx, dy);
          if (d < radius && d > 6) {
            const pull = (1 - d / radius) ** 2 * 220 * dt * (cfg.interaction === 'repel' ? -1 : 1);
            p.x += (dx / d) * pull;
            p.y += (dy / d) * pull;
          }
        }
      }

      if (cfg.links && cfg.linkDistance > 0 && cfg.linkOpacity > 0 && cfg.linkWidth > 0) {
        const cell = Math.max(cfg.linkDistance, 16);
        const cols = Math.ceil((w + 40) / cell) + 1;
        const rows = Math.ceil((h + 40) / cell) + 1;
        const head = new Int32Array(cols * rows).fill(-1);
        const cellOf = (i: number) => {
          const cx = clamp(Math.floor((rx[i] + 20) / cell), 0, cols - 1);
          const cy = clamp(Math.floor((ry[i] + 20) / cell), 0, rows - 1);
          return [cx, cy] as const;
        };
        for (let i = 0; i < particles.length; i++) {
          const [cx, cy] = cellOf(i);
          next[i] = head[cy * cols + cx];
          head[cy * cols + cx] = i;
        }
        const reach = cfg.linkDistance;
        ctx.lineWidth = cfg.linkWidth;
        for (let i = 0; i < particles.length; i++) {
          const [cx, cy] = cellOf(i);
          const fi = 1 - cfg.depth * (1 - particles[i].z);
          for (let oy = -1; oy <= 1; oy++) {
            const gy = cy + oy;
            if (gy < 0 || gy >= rows) continue;
            for (let ox = -1; ox <= 1; ox++) {
              const gx = cx + ox;
              if (gx < 0 || gx >= cols) continue;
              for (let j = head[gy * cols + gx]; j !== -1; j = next[j]) {
                if (j <= i) continue;
                const d = Math.hypot(rx[i] - rx[j], ry[i] - ry[j]);
                if (d >= reach) continue;
                const fj = 1 - cfg.depth * (1 - particles[j].z);
                ctx.globalAlpha = cfg.linkOpacity * (1 - d / reach) * Math.min(fi, fj);
                ctx.strokeStyle = particles[i].color;
                ctx.beginPath();
                ctx.moveTo(rx[i], ry[i]);
                ctx.lineTo(rx[j], ry[j]);
                ctx.stroke();
              }
            }
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const f = 1 - cfg.depth * (1 - p.z);
        const r = Math.max(0.4, p.r * (0.5 + 0.5 * f));
        ctx.globalAlpha = 0.35 + 0.65 * f;
        ctx.fillStyle = p.color;
        if (cfg.shape === 'square') {
          ctx.fillRect(rx[i] - r, ry[i] - r, r * 2, r * 2);
        } else {
          ctx.beginPath();
          ctx.arc(rx[i], ry[i], r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    drawRef.current = draw;

    const stopSize = observeSize(root, (nw, nh) => {
      const oldW = w;
      const oldH = h;
      w = nw;
      h = nh;
      dpr = fitCanvas(canvas, nw, nh);
      place(oldW, oldH);
      if (!animate) draw(0);
    });

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onWindow = pointerTarget === 'window';
    const moveSource = (onWindow ? window : root) as HTMLElement;
    const leaveSource = onWindow ? document.documentElement : root;
    if (animate) {
      moveSource.addEventListener('pointermove', onMove);
      leaveSource.addEventListener('pointerleave', onLeave);
    }

    const stopLoop = runLoop(root, draw, animate);
    return () => {
      stopLoop();
      stopSize();
      moveSource.removeEventListener('pointermove', onMove);
      leaveSource.removeEventListener('pointerleave', onLeave);
      drawRef.current = undefined;
    };
  }, [total, colorKey, sizeMin, sizeMax, seed, direction, animate, live, pointerTarget]);

  useEffect(() => {
    if (!animate) drawRef.current?.(0);
  });

  return (
    <div ref={rootRef} className={className} style={{ position: 'relative', overflow: 'hidden', width, height, background, ...style }}>
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      {children && <div style={{ position: 'relative', height: '100%' }}>{children}</div>}
    </div>
  );
}
