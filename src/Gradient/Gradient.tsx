import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { palette as normalize } from '../shared/palette.js';
import { clamp, createRandom } from '../shared/random.js';

export interface GradientProps {
  type?: 'linear' | 'radial' | 'conic' | 'mesh';
  colors?: string[];
  angle?: number;
  stops?: number[];
  speed?: number;
  easing?: string;
  grain?: number;
  blend?: CSSProperties['mixBlendMode'];
  opacity?: number;
  blobs?: number;
  background?: string;
  seed?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const DEFAULT_COLORS = ['#1d2b64', '#5b3f9e', '#d4719a', '#f6b983'];

const CSS = [
  '@keyframes gr-pan{from{background-position:0% 30%}to{background-position:100% 70%}}',
  '@keyframes gr-drift{from{transform:translate(0,0) scale(1)}to{transform:translate(var(--dx),var(--dy)) scale(var(--s))}}',
  '@keyframes gr-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}',
  '@media (prefers-reduced-motion:reduce){.gr-anim{animation:none!important}}',
].join('');

function grainImage(seed: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" seed="${Math.floor(seed)}"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function Gradient({
  type = 'linear',
  colors = DEFAULT_COLORS,
  angle = 135,
  stops,
  speed = 1,
  easing = 'ease-in-out',
  grain = 0.12,
  blend,
  opacity = 1,
  blobs = 5,
  background,
  seed = 1,
  height = 320,
  width = '100%',
  className,
  style,
  children,
}: GradientProps) {
  const palette = normalize(colors, DEFAULT_COLORS, 2);
  const list = (loop: boolean) =>
    (loop ? [...palette, palette[0]] : palette)
      .map((c, i) => (stops && stops[i] !== undefined ? `${c} ${clamp(stops[i], 0, 100)}%` : c))
      .join(',');
  const rate = Math.abs(speed);
  const dir = speed < 0 ? 'alternate-reverse' : 'alternate';
  const motion = (name: string, seconds: number, direction = dir) =>
    speed ? `${name} ${seconds / rate}s ${easing} infinite ${direction}` : 'none';

  const count = Math.round(clamp(blobs, 1, 12));
  const mesh = useMemo(() => {
    const rng = createRandom(seed);
    return Array.from({ length: count }, (_, i) => ({
      left: rng.range(-10, 80),
      top: rng.range(-20, 70),
      size: rng.range(55, 90),
      dx: rng.range(-18, 18),
      dy: rng.range(-18, 18),
      scale: rng.range(0.85, 1.25),
      dur: rng.range(12, 22),
      delay: rng.range(0, 10),
      color: i,
    }));
  }, [count, seed]);
  const noise = grain > 0 ? grainImage(seed) : undefined;

  const layer: CSSProperties = { position: 'absolute', inset: 0, opacity, mixBlendMode: blend };

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', isolation: 'isolate', containerType: type === 'conic' || type === 'mesh' ? 'size' : undefined, width, height, background, ...style }}
    >
      <style>{CSS}</style>
      {type === 'linear' && (
        <div
          aria-hidden="true"
          className="gr-anim"
          style={{
            ...layer,
            backgroundImage: `linear-gradient(${angle}deg,${list(false)})`,
            backgroundSize: '260% 260%',
            animation: motion('gr-pan', 16),
          }}
        />
      )}
      {type === 'radial' && (
        <div
          aria-hidden="true"
          className="gr-anim"
          style={
            {
              ...layer,
              inset: '-25%',
              backgroundImage: `radial-gradient(circle at ${50 + Math.cos((angle * Math.PI) / 180) * 18}% ${50 + Math.sin((angle * Math.PI) / 180) * 18}%,${list(false)})`,
              '--dx': '8%',
              '--dy': '-6%',
              '--s': 1.18,
              animation: motion('gr-drift', 14),
            } as CSSProperties
          }
        />
      )}
      {type === 'conic' && (
        <div
          aria-hidden="true"
          className="gr-anim"
          style={{
            ...layer,
            inset: 'auto',
            top: '50%',
            left: '50%',
            width: '150cqmax',
            height: '150cqmax',
            transform: 'translate(-50%,-50%)',
            backgroundImage: `conic-gradient(from ${angle}deg at 50% 50%,${list(true)})`,
            animation: speed ? `gr-spin ${60 / rate}s linear infinite ${speed < 0 ? 'reverse' : 'normal'}` : 'none',
          }}
        />
      )}
      {type === 'mesh' && (
        <div aria-hidden="true" style={{ ...layer, backgroundColor: background ?? palette[0] }}>
          {mesh.map((b, i) => (
            <div
              key={i}
              className="gr-anim"
              style={
                {
                  position: 'absolute',
                  left: `${b.left}%`,
                  top: `${b.top}%`,
                  width: `${b.size}cqmax`,
                  aspectRatio: '1',
                  borderRadius: '50%',
                  backgroundImage: `radial-gradient(circle closest-side,${palette[b.color % palette.length]},transparent)`,
                  '--dx': `${b.dx}%`,
                  '--dy': `${b.dy}%`,
                  '--s': b.scale,
                  animation: speed ? `gr-drift ${b.dur / rate}s ${easing} ${-b.delay}s infinite ${dir}` : 'none',
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
      {noise && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: noise,
            backgroundSize: '220px 220px',
            mixBlendMode: 'overlay',
            opacity: clamp(grain, 0, 1),
          }}
        />
      )}
      {children && <div style={{ position: 'relative', height: '100%' }}>{children}</div>}
    </div>
  );
}
