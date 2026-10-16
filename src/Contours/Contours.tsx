import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { clamp, lerp, smoothNoise } from '../shared/random.js';
import { fitCanvas, observeSize, runLoop, useLatest, useReducedMotion } from '../shared/runtime.js';

export interface ContoursProps {
  levels?: number;
  scale?: number;
  speed?: number;
  lineWidth?: number;
  colors?: string[];
  background?: string;
  smooth?: boolean;
  resolution?: number;
  fill?: boolean;
  seed?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

type Rgb = [number, number, number];

const MIN_RESOLUTION = 6;
const MAX_CELLS = 40000;

// Cell edge pairs per case index (corner bits a=1 top-left, b=2 top-right, c=4 bottom-right, d=8 bottom-left).
// Edges: 0 top, 1 right, 2 bottom, 3 left. Saddle cases 5 and 10 are resolved separately.
const SEGMENTS: number[][] = [
  [],
  [3, 0],
  [0, 1],
  [3, 1],
  [1, 2],
  [],
  [0, 2],
  [3, 2],
  [2, 3],
  [0, 2],
  [],
  [1, 2],
  [3, 1],
  [0, 1],
  [3, 0],
  [],
];

function toRgb(ctx: CanvasRenderingContext2D, color: string): Rgb {
  ctx.fillStyle = '#000000';
  ctx.fillStyle = color;
  const v = String(ctx.fillStyle);
  if (v[0] === '#') return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
  const m = v.match(/[\d.]+/g) ?? ['0', '0', '0'];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

function rampAt(ramp: Rgb[], t: number): string {
  if (ramp.length === 1) return `rgb(${ramp[0].join(',')})`;
  const x = clamp(t, 0, 1) * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(x));
  const f = x - i;
  const a = ramp[i];
  const b = ramp[i + 1];
  return `rgb(${Math.round(lerp(a[0], b[0], f))},${Math.round(lerp(a[1], b[1], f))},${Math.round(lerp(a[2], b[2], f))})`;
}

export function Contours({
  levels = 12,
  scale = 240,
  speed = 1,
  lineWidth = 1,
  colors = ['#1d3b5c', '#3f87a6', '#b8e0d2'],
  background = '#0a0f1c',
  smooth = true,
  resolution = 10,
  fill = false,
  seed = 1,
  height = 360,
  width = '100%',
  className,
  style,
  children,
}: ContoursProps) {
  const reduced = useReducedMotion();
  const animate = !reduced && speed !== 0;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<((dt: number) => void) | undefined>(undefined);
  const clock = useRef(0);
  const live = useLatest({ levels, scale, speed, lineWidth, colors, smooth, resolution, fill });

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!root || !canvas || !ctx) return;

    const noise = smoothNoise(seed);
    const offset = (seed % 97) * 13.7;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let rampKey = '';
    let ramp: Rgb[] = [[255, 255, 255]];
    let cells = 0;
    let field = new Float32Array(0);
    let link0 = new Int32Array(0);
    let link1 = new Int32Array(0);
    let visited = new Uint8Array(0);

    const draw = (dt: number) => {
      if (w <= 0 || h <= 0) return;
      const cfg = live.current;
      clock.current += dt * cfg.speed * 0.12;
      const key = cfg.colors.join('|');
      if (key !== rampKey) {
        rampKey = key;
        ramp = cfg.colors.length ? cfg.colors.map((c) => toRgb(ctx, c)) : [[255, 255, 255]];
      }

      let res = Math.max(MIN_RESOLUTION, cfg.resolution);
      let cols = Math.ceil(w / res) + 1;
      let rows = Math.ceil(h / res) + 1;
      while (cols * rows > MAX_CELLS) {
        res *= 1.1;
        cols = Math.ceil(w / res) + 1;
        rows = Math.ceil(h / res) + 1;
      }
      if (cols * rows !== cells) {
        cells = cols * rows;
        field = new Float32Array(cells);
        link0 = new Int32Array(cells * 2);
        link1 = new Int32Array(cells * 2);
        visited = new Uint8Array(cells * 2);
      }
      const count = Math.round(clamp(cfg.levels, 1, 40));
      const t = clock.current;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = (i * res) / cfg.scale + offset;
          const y = (j * res) / cfg.scale + offset;
          const n = (noise(x, y, t) + 0.5 * noise(x * 2 + 17, y * 2 + 31, t * 1.4)) / 1.5;
          field[j * cols + i] = clamp((n - 0.5) * 1.9 + 0.5, 0, 1);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const hEdge = (i: number, j: number) => j * cols + i;
      const vEdge = (i: number, j: number) => cols * rows + j * cols + i;
      const px = new Float32Array(2);
      const inside = new Uint8Array(4);
      const cx = new Float32Array(4);
      const cy = new Float32Array(4);
      const vals = new Float32Array(4);

      for (let k = 0; k < count; k++) {
        const level = 0.12 + (0.76 * (k + 0.5)) / count;
        const color = rampAt(ramp, count === 1 ? 1 : k / (count - 1));

        const point = (e: number) => {
          const half = cols * rows;
          if (e < half) {
            const j = Math.floor(e / cols);
            const i = e - j * cols;
            const a = field[e];
            const b = field[e + 1];
            px[0] = (i + (level - a) / (b - a)) * res;
            px[1] = j * res;
          } else {
            const f = e - half;
            const j = Math.floor(f / cols);
            const i = f - j * cols;
            const a = field[f];
            const b = field[f + cols];
            px[0] = i * res;
            px[1] = (j + (level - a) / (b - a)) * res;
          }
        };

        if (cfg.fill) {
          ctx.fillStyle = color;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let j = 0; j < rows - 1; j++) {
            let run = -1;
            for (let i = 0; i < cols - 1; i++) {
              const a = field[j * cols + i];
              const b = field[j * cols + i + 1];
              const c = field[(j + 1) * cols + i + 1];
              const d = field[(j + 1) * cols + i];
              inside[0] = a >= level ? 1 : 0;
              inside[1] = b >= level ? 1 : 0;
              inside[2] = c >= level ? 1 : 0;
              inside[3] = d >= level ? 1 : 0;
              const mask = inside[0] + inside[1] + inside[2] + inside[3];
              if (mask === 4) {
                if (run < 0) run = i;
                continue;
              }
              if (run >= 0) {
                ctx.rect(run * res, j * res, (i - run) * res, res);
                run = -1;
              }
              if (mask === 0) continue;
              cx[0] = cx[3] = i * res;
              cx[1] = cx[2] = (i + 1) * res;
              cy[0] = cy[1] = j * res;
              cy[2] = cy[3] = (j + 1) * res;
              vals[0] = a;
              vals[1] = b;
              vals[2] = c;
              vals[3] = d;
              let started = false;
              for (let q = 0; q < 4; q++) {
                const n = (q + 1) % 4;
                if (inside[q]) {
                  if (started) ctx.lineTo(cx[q], cy[q]);
                  else ctx.moveTo(cx[q], cy[q]);
                  started = true;
                }
                if (inside[q] !== inside[n]) {
                  const f = (level - vals[q]) / (vals[n] - vals[q]);
                  const ex = lerp(cx[q], cx[n], f);
                  const ey = lerp(cy[q], cy[n], f);
                  if (started) ctx.lineTo(ex, ey);
                  else ctx.moveTo(ex, ey);
                  started = true;
                }
              }
              ctx.closePath();
            }
            if (run >= 0) ctx.rect(run * res, j * res, (cols - 1 - run) * res, res);
          }
          ctx.fill();
          ctx.stroke();
        }

        if (cfg.lineWidth <= 0) continue;
        link0.fill(-1);
        link1.fill(-1);
        visited.fill(0);
        const touched: number[] = [];
        const attach = (e: number, o: number) => {
          if (link0[e] === -1) {
            link0[e] = o;
            touched.push(e);
          } else link1[e] = o;
        };
        const connect = (e1: number, e2: number) => {
          attach(e1, e2);
          attach(e2, e1);
        };
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = field[j * cols + i];
            const b = field[j * cols + i + 1];
            const c = field[(j + 1) * cols + i + 1];
            const d = field[(j + 1) * cols + i];
            const index = (a >= level ? 1 : 0) | (b >= level ? 2 : 0) | (c >= level ? 4 : 0) | (d >= level ? 8 : 0);
            if (index === 0 || index === 15) continue;
            const edges = [hEdge(i, j), vEdge(i + 1, j), hEdge(i, j + 1), vEdge(i, j)];
            if (index === 5 || index === 10) {
              const centerIn = (a + b + c + d) / 4 >= level;
              const pairs = (index === 5) === centerIn ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]];
              for (const [p, q] of pairs) connect(edges[p], edges[q]);
            } else {
              const [p, q] = SEGMENTS[index];
              connect(edges[p], edges[q]);
            }
          }
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = cfg.lineWidth;
        ctx.beginPath();
        for (const start of touched) {
          if (visited[start]) continue;
          visited[start] = 1;
          const walk = (first: number) => {
            const out: number[] = [];
            let prev = start;
            let cur = first;
            while (cur !== -1 && !visited[cur]) {
              visited[cur] = 1;
              out.push(cur);
              const nxt = link0[cur] === prev ? link1[cur] : link0[cur];
              prev = cur;
              cur = nxt;
            }
            return { out, closed: cur === start };
          };
          const fwd = walk(link0[start]);
          const back = fwd.closed ? { out: [] as number[] } : walk(link1[start]);
          const chain = [...back.out.reverse(), start, ...fwd.out];
          const pts: number[] = [];
          for (const e of chain) {
            point(e);
            pts.push(px[0], px[1]);
          }
          const n = chain.length;
          if (n < 2) continue;
          if (!cfg.smooth || n < 3) {
            ctx.moveTo(pts[0], pts[1]);
            for (let q = 1; q < n; q++) ctx.lineTo(pts[q * 2], pts[q * 2 + 1]);
            if (fwd.closed) ctx.closePath();
          } else if (fwd.closed) {
            ctx.moveTo((pts[(n - 1) * 2] + pts[0]) / 2, (pts[(n - 1) * 2 + 1] + pts[1]) / 2);
            for (let q = 0; q < n; q++) {
              const r = (q + 1) % n;
              ctx.quadraticCurveTo(pts[q * 2], pts[q * 2 + 1], (pts[q * 2] + pts[r * 2]) / 2, (pts[q * 2 + 1] + pts[r * 2 + 1]) / 2);
            }
            ctx.closePath();
          } else {
            ctx.moveTo(pts[0], pts[1]);
            for (let q = 1; q < n - 1; q++) {
              ctx.quadraticCurveTo(pts[q * 2], pts[q * 2 + 1], (pts[q * 2] + pts[q * 2 + 2]) / 2, (pts[q * 2 + 1] + pts[q * 2 + 3]) / 2);
            }
            ctx.lineTo(pts[(n - 1) * 2], pts[(n - 1) * 2 + 1]);
          }
        }
        ctx.stroke();
      }
    };
    drawRef.current = draw;

    const stopSize = observeSize(root, (nw, nh) => {
      w = nw;
      h = nh;
      dpr = fitCanvas(canvas, nw, nh);
      if (!animate) draw(0);
    });
    const stopLoop = runLoop(root, draw, animate);
    return () => {
      stopLoop();
      stopSize();
      drawRef.current = undefined;
    };
  }, [seed, animate, live]);

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
