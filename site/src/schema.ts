export type Val = string | number | boolean | string[] | number[] | undefined;
export type Props = Record<string, Val>;

interface Common {
  key: string;
  label: string;
  type: string;
  desc: string;
  def: Val;
  show?: string;
}

export type Field = Common &
  (
    | { kind: 'range'; min: number; max: number; step: number }
    | { kind: 'select'; options: string[]; optional?: boolean }
    | { kind: 'toggle' }
    | { kind: 'colors'; min: number; max: number; offable?: boolean }
    | { kind: 'color' }
    | { kind: 'optcolor' }
    | { kind: 'optrange'; min: number; max: number; step: number; autoLabel: string }
    | { kind: 'pair'; min: number; max: number; step: number; names: [string, string] }
    | { kind: 'count'; max: number; trueAs: number }
    | { kind: 'seed' }
    | { kind: 'ref' }
  );

export interface Preset {
  name: string;
  props: Props;
}

export interface Spec {
  id: string;
  name: string;
  blurb: string;
  fields: Field[];
  presets: Preset[];
}

const range = (key: string, def: number, min: number, max: number, step: number, desc: string): Field => ({
  kind: 'range', key, label: key, type: 'number', def, min, max, step, desc,
});
const toggle = (key: string, def: boolean, desc: string): Field => ({
  kind: 'toggle', key, label: key, type: 'boolean', def, desc,
});
const select = (key: string, def: string | undefined, options: string[], desc: string, optional = false): Field => ({
  kind: 'select', key, label: key, type: options.map((o) => `'${o}'`).join(' | '), def, options, desc, optional,
});
const colors = (key: string, def: string[], min: number, max: number, desc: string, offable = false): Field => ({
  kind: 'colors', key, label: key, type: offable ? 'string[] | false' : 'string[]', def, min, max, desc, offable,
});
const seed = (def: number | undefined, desc: string): Field => ({
  kind: 'seed', key: 'seed', label: 'seed', type: 'number', def, desc,
  show: def === undefined ? 'fixed phases' : undefined,
});
const height = (def: number, min = 120): Field => ({
  kind: 'range', key: 'height', label: 'height', type: 'number | string', def, min, max: 480, step: 10,
  desc: 'Number (px) or any CSS length',
});
const speed = (desc = 'Animation speed; negative reverses, 0 stops'): Field => range('speed', 1, -3, 3, 0.1, desc);

const width: Field = {
  kind: 'ref', key: 'width', label: 'width', type: 'number | string', def: '100%', desc: 'Number (px) or any CSS length',
};
const root = (withChildren: boolean, el: string): Field => ({
  kind: 'ref', key: withChildren ? 'className, style, children' : 'className, style', label: 'root', type: 'string, CSSProperties' + (withChildren ? ', ReactNode' : ''),
  def: undefined, show: '', desc: `Applied to the root ${el}${withChildren ? '; children render above the effect' : ''}`,
});

export const SPECS: Spec[] = [
  {
    id: 'waves',
    name: 'Waves',
    blurb: 'Stacked SVG waves. Use it as a section divider or a footer edge.',
    fields: [
      colors('colors', ['#38bdf8', '#0ea5e9', '#0369a1'], 1, 6, 'Fill per layer, cycled when there are more layers'),
      height(160, 80),
      range('amplitude', 20, 0, 80, 1, 'Wave height in px'),
      range('frequency', 2, 1, 8, 1, 'Crests per 1200-unit tile, rounded to a whole number'),
      speed(),
      range('layers', 3, 1, 8, 1, 'Number of stacked waves'),
      range('opacity', 0.6, 0, 1, 0.05, 'Fill opacity of each layer'),
      toggle('flip', false, 'Hang the waves from the top edge'),
      seed(undefined, 'Randomizes the phase of each layer; omit for the fixed phases'),
      width,
      root(false, 'svg'),
    ],
    presets: [
      { name: 'Default', props: {} },
      { name: 'Sunset', props: { colors: ['#fb923c', '#f43f5e', '#7c3aed'], layers: 4, seed: 7 } },
      { name: 'Slate', props: { colors: ['#e2e8f0', '#94a3b8', '#475569'], amplitude: 32, speed: 0.6 } },
      { name: 'Choppy', props: { colors: ['#34d399', '#10b981', '#047857'], amplitude: 44, frequency: 4, speed: 1.6, layers: 5, seed: 3 } },
    ],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    blurb: 'Luminous curtain ribbons with an SVG glow, optional ray streaks and stars. Animated with CSS.',
    fields: [
      colors('colors', ['#34d399', '#22d3ee', '#a78bfa'], 1, 6, 'Ribbon colors; each ribbon fades toward the next color'),
      range('ribbons', 3, 1, 8, 1, 'Number of curtains (1-8)'),
      range('blur', 14, 0, 40, 1, 'Glow blur in viewBox units; 0 disables it'),
      speed(),
      range('intensity', 0.8, 0, 1, 0.05, 'Overall brightness, 0-1'),
      range('amplitude', 46, 0, 120, 1, 'Height of the waves along each ribbon'),
      { kind: 'count', key: 'rays', label: 'rays', type: 'boolean | number', def: true, max: 80, trueAs: 28, show: 'true', desc: 'true for 28 streaks, a number for a custom count, false for none' },
      { kind: 'count', key: 'stars', label: 'stars', type: 'boolean | number', def: true, max: 200, trueAs: 70, show: 'true', desc: 'true for 70 stars, a number for a custom count, false for none' },
      range('skew', 6, -30, 30, 1, 'Lean of the curtains and rays in degrees'),
      colors('background', ['#04060f', '#0a1428', '#10283a'], 1, 5, 'CSS color, or an array for a top-to-bottom sky gradient'),
      seed(1, 'Seed for ribbon shapes, rays and stars'),
      height(420, 200),
      width,
      root(true, 'div'),
    ],
    presets: [
      { name: 'Default', props: {} },
      { name: 'Teal', props: { colors: ['#5eead4', '#38bdf8', '#e0f2fe'], ribbons: 4, rays: 40 } },
      { name: 'Magenta', props: { colors: ['#f472b6', '#a78bfa', '#60a5fa'], intensity: 0.9, skew: -8, seed: 5 } },
      { name: 'Calm', props: { ribbons: 2, rays: false, stars: 20, speed: 0.4, blur: 24 } },
    ],
  },
  {
    id: 'gradient',
    name: 'Gradient',
    blurb: 'Linear, radial, conic or mesh gradient with optional grain.',
    fields: [
      select('type', 'linear', ['linear', 'radial', 'conic', 'mesh'], 'Gradient kind'),
      colors('colors', ['#1d2b64', '#5b3f9e', '#d4719a', '#f6b983'], 2, 8, 'Gradient colors; mesh cycles them across blobs'),
      range('angle', 135, 0, 360, 1, 'Degrees. Gradient direction (linear), center offset (radial), start angle (conic)'),
      { kind: 'ref', key: 'stops', label: 'stops', type: 'number[]', def: undefined, show: '', desc: 'Explicit stop positions in percent, one per color' },
      speed(),
      select('easing', 'ease-in-out', ['ease-in-out', 'ease', 'ease-in', 'ease-out', 'linear'], 'Any CSS timing function; used by pan and drift animations'),
      range('grain', 0.12, 0, 1, 0.01, 'Noise overlay strength, 0-1; 0 disables it'),
      select('blend', undefined, ['overlay', 'soft-light', 'screen', 'multiply', 'plus-lighter'], 'mix-blend-mode of the gradient layer', true),
      range('opacity', 1, 0, 1, 0.05, 'Opacity of the gradient layer'),
      range('blobs', 5, 1, 10, 1, 'Number of drifting blobs for mesh'),
      { kind: 'optcolor', key: 'background', label: 'background', type: 'string', def: undefined, show: 'first color (mesh)', desc: 'Base color behind the gradient; mesh falls back to the first color' },
      seed(1, 'Seed for mesh layout and the grain pattern'),
      height(320),
      width,
      root(true, 'div'),
    ],
    presets: [
      { name: 'Default', props: {} },
      { name: 'Mesh', props: { type: 'mesh', colors: ['#6366f1', '#f472b6', '#fbbf24'], blobs: 6, grain: 0.18 } },
      { name: 'Conic', props: { type: 'conic', colors: ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4'], angle: 200, grain: 0.08 } },
      { name: 'Radial', props: { type: 'radial', colors: ['#fde68a', '#f97316', '#7c2d12'], angle: 60 } },
    ],
  },
  {
    id: 'blob',
    name: 'Blob',
    blurb: 'Morphing organic shapes. Control points render as a closed Catmull-Rom curve and their radii animate per frame.',
    fields: [
      range('blobs', 3, 1, 8, 1, 'Number of stacked shapes (1-8)'),
      range('points', 6, 3, 12, 1, 'Control points per shape (3-12)'),
      range('randomness', 0.4, 0, 1, 0.05, 'Irregularity and morph depth, 0-1'),
      range('smoothness', 1, 0, 1.5, 0.05, '0 draws straight edges, 1 is Catmull-Rom, up to 1.5'),
      range('size', 0.7, 0.1, 1, 0.05, 'Size of the largest shape relative to the shorter side, 0.1-1'),
      speed('Morph speed; negative reverses, 0 stops'),
      range('rotate', 0, -90, 90, 1, 'Rotation in degrees per second; alternate shapes spin the other way'),
      colors('colors', ['#6366f1', '#14b8a6', '#f472b6'], 1, 8, 'Fill per shape, cycled'),
      toggle('gradient', true, 'Fill each shape with a gradient toward the next color'),
      { kind: 'optcolor', key: 'stroke', label: 'stroke', type: 'string', def: undefined, show: 'shape color', desc: 'Stroke color' },
      range('strokeWidth', 0, 0, 6, 0.5, 'Stroke width in viewBox units (200 across)'),
      range('blur', 0, 0, 60, 1, 'CSS blur in px'),
      range('opacity', 0.85, 0, 1, 0.05, 'Fill opacity'),
      seed(1, 'Seed for point layout and morph phases'),
      { kind: 'optcolor', key: 'background', label: 'background', type: 'string', def: undefined, show: 'none', desc: 'Root background' },
      height(360),
      width,
      root(true, 'div'),
    ],
    presets: [
      { name: 'Default', props: {} },
      { name: 'Ember', props: { blobs: 4, points: 8, randomness: 0.55, colors: ['#f97316', '#e11d48'], blur: 18, rotate: 6 } },
      { name: 'Outline', props: { blobs: 5, gradient: false, colors: ['#38bdf8', '#818cf8'], stroke: '#e2e8f0', strokeWidth: 1.5, opacity: 0.25, randomness: 0.6 } },
      { name: 'Soft', props: { blobs: 6, size: 0.9, blur: 40, opacity: 0.7, colors: ['#fda4af', '#fcd34d', '#86efac'], seed: 4 } },
    ],
  },
  {
    id: 'particles',
    name: 'Particles',
    blurb: 'Canvas particles with connecting lines. Links use a spatial grid, so large counts stay cheap. Move the pointer over the preview.',
    fields: [
      range('count', 90, 10, 1000, 10, 'Number of particles (max 4000)'),
      colors('colors', ['#94a3b8', '#7dd3fc', '#c4b5fd'], 1, 8, 'Particle colors, picked per particle'),
      { kind: 'pair', key: 'size', label: 'size', type: 'number | [number, number]', def: [1, 3], min: 0.5, max: 8, step: 0.5, names: ['min', 'max'], show: '[1, 3]', desc: 'Radius in px; a number or a [min, max] pair' },
      speed('Speed multiplier; negative reverses, 0 stops'),
      range('linkDistance', 120, 20, 300, 5, 'Maximum distance for a link in px'),
      range('linkWidth', 1, 0.5, 4, 0.5, 'Link width in px'),
      range('linkOpacity', 0.35, 0, 1, 0.05, 'Link opacity at distance 0, fading to 0 at linkDistance'),
      toggle('links', true, 'Draw links'),
      select('interaction', 'repel', ['none', 'repel', 'attract'], 'Pointer behavior'),
      range('interactionRadius', 140, 40, 300, 5, 'Pointer influence radius in px'),
      select('pointerTarget', 'element', ['element', 'window'], 'Where the pointer is tracked; use window for a fixed background under other content'),
      range('depth', 0, 0, 1, 0.05, '0-1. Far particles get smaller, slower and dimmer, and shift with the pointer'),
      { kind: 'optrange', key: 'direction', label: 'direction', type: 'number', def: undefined, min: 0, max: 360, step: 5, autoLabel: 'Random headings', show: 'random headings', desc: 'Drift angle in degrees (0 is right, 90 is down); omit for random headings' },
      select('shape', 'circle', ['circle', 'square'], 'Particle shape'),
      { kind: 'optcolor', key: 'background', label: 'background', type: 'string', def: undefined, show: 'none', desc: 'Root background' },
      seed(1, 'Seed for positions, velocities and colors'),
      height(360),
      width,
      root(true, 'div'),
    ],
    presets: [
      { name: 'Default', props: {} },
      { name: 'Snow', props: { count: 160, links: false, depth: 0.8, direction: 100, colors: ['#ffffff', '#dbeafe'], speed: 0.6 } },
      { name: 'Fireflies', props: { count: 60, links: false, colors: ['#fde68a', '#fbbf24'], size: [1.5, 4], interaction: 'attract', depth: 0.5, speed: 0.5, background: '#07140f' } },
      { name: 'Squares', props: { shape: 'square', count: 120, linkDistance: 90, colors: ['#f472b6', '#fb7185'], background: '#12091a' } },
    ],
  },
  {
    id: 'contours',
    name: 'Contours',
    blurb: 'Flowing topographic lines: marching squares over an animated noise field.',
    fields: [
      range('levels', 12, 1, 40, 1, 'Number of iso-lines (1-40)'),
      range('scale', 240, 40, 600, 10, 'Feature size of the noise field in px'),
      speed('Flow speed; negative reverses, 0 stops'),
      range('lineWidth', 1, 0, 4, 0.5, 'Line width in px; 0 hides lines'),
      colors('colors', ['#1d3b5c', '#3f87a6', '#b8e0d2'], 1, 8, 'Colors interpolated across levels'),
      { kind: 'color', key: 'background', label: 'background', type: 'string', def: '#0a0f1c', desc: 'Root background' },
      toggle('smooth', true, 'Round the lines with quadratic curves'),
      range('resolution', 10, 6, 30, 1, 'Grid cell size in px (minimum 6); lower is finer and slower'),
      toggle('fill', false, 'Fill the bands between levels'),
      seed(1, 'Seed for the noise field'),
      height(360),
      width,
      root(true, 'div'),
    ],
    presets: [
      { name: 'Default', props: {} },
      { name: 'Paper', props: { levels: 16, colors: ['#6b5b4b', '#a8927c'], background: '#f3ede2' } },
      { name: 'Heat', props: { fill: true, levels: 14, colors: ['#1e1b4b', '#be185d', '#fbbf24'], background: '#0b0615' } },
      { name: 'Fine', props: { levels: 30, lineWidth: 0.5, scale: 160, colors: ['#94a3b8', '#e2e8f0'] } },
    ],
  },
  {
    id: 'dunes',
    name: 'Dunes',
    blurb: 'Layered silhouettes with parallax drift. Layers tile seamlessly, and nearer layers move faster.',
    fields: [
      range('layers', 5, 1, 10, 1, 'Number of silhouettes (1-10)'),
      select('variant', 'dunes', ['dunes', 'mountains'], 'dunes (smooth) or mountains (jagged)'),
      range('roughness', 0.5, 0, 1, 0.05, 'Detail added on top of the base shape, 0-1'),
      colors('colors', ['#c98a76', '#a96a6e', '#7f4c65', '#58355a', '#33223f'], 1, 10, 'Far to near; spread across the layers'),
      speed('Drift speed; negative reverses, 0 stops'),
      colors('sky', ['#1f2a52', '#7a4a7e', '#e8957a', '#f6d2a0'], 2, 6, 'Top-to-bottom gradient colors, or false for a transparent sky', true),
      toggle('sun', true, 'Draw a sun behind the layers'),
      { kind: 'color', key: 'sunColor', label: 'sunColor', type: 'string', def: '#fff1d0', desc: 'Sun and glow color' },
      range('sunSize', 110, 20, 300, 5, 'Sun diameter in px'),
      { kind: 'pair', key: 'sunPosition', label: 'sunPosition', type: '[number, number]', def: [0.7, 0.4], min: 0, max: 1, step: 0.05, names: ['x', 'y'], show: '[0.7, 0.4]', desc: 'Sun center as [x, y] fractions of the width and height' },
      range('fog', 0.35, 0, 1, 0.05, 'Haze strength between layers, 0-1'),
      toggle('flip', false, 'Hang the silhouettes from the top edge'),
      seed(1, 'Seed for the silhouettes'),
      height(360),
      width,
      root(true, 'div'),
    ],
    presets: [
      { name: 'Default', props: {} },
      { name: 'Mountains', props: { variant: 'mountains', colors: ['#b7c6d8', '#8aa0bb', '#5d7595', '#3a506f', '#1f2f4a'], fog: 0.5 } },
      { name: 'Night', props: { sky: ['#050816', '#111a3c', '#2b2f6b'], sunColor: '#dbeafe', colors: ['#2b2f6b', '#1f2457', '#161a42', '#0e1230', '#080a1f'], sunPosition: [0.25, 0.3], fog: 0.2 } },
      { name: 'Hanging', props: { flip: true, sky: false, layers: 4, variant: 'mountains', colors: ['#334155', '#475569', '#64748b', '#94a3b8'] } },
    ],
  },
];
