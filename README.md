# react-animated-layouts

Animated, customizable layout components for React. No runtime dependencies. Every component is SSR-safe, respects `prefers-reduced-motion` (a static frame is rendered), cleans up its listeners and frame loops on unmount, and pauses canvas/JS animation while off-screen.

```sh
npm install react-animated-layouts
```

```jsx
import { Waves, Aurora, Gradient, Blob, Particles, Contours, Dunes } from 'react-animated-layouts';

<Waves colors={['#38bdf8', '#0ea5e9', '#0369a1']} height={200} amplitude={24} frequency={2} />

<Aurora height={420}>
  <h1>Hello</h1>
</Aurora>
```

Run `npm run storybook` to try every component with live controls.

## Conventions

- `speed`: animation speed; negative reverses, `0` stops.
- `seed`: deterministic randomness. The same seed always renders the same layout.
- `height` and `width`: number (px) or any CSS length. `width` defaults to `'100%'`.
- `className` and `style` are applied to the root element.
- Aurora, Gradient, Blob, Particles, Contours and Dunes render `children` above the effect. Give them an explicit `height`; they do not size from their content. Gradient is the exception: `linear` and `radial` can use `height: 'auto'`, while `conic` and `mesh` need an explicit height.

## Waves

Stacked SVG waves.

```jsx
<Waves colors={['#fb923c', '#f43f5e', '#7c3aed']} layers={4} seed={7} />
```

| Prop        | Default                           | Description                                          |
| ----------- | --------------------------------- | ---------------------------------------------------- |
| `colors`    | `['#38bdf8','#0ea5e9','#0369a1']` | Fill per layer, cycled when there are more layers    |
| `height`    | `160`                             | Height in px                                         |
| `width`     | `'100%'`                          | Number (px) or any CSS length                        |
| `amplitude` | `20`                              | Wave height in px                                    |
| `frequency` | `2`                               | Crests per 1200-unit tile, rounded to a whole number |
| `speed`     | `1`                               | Animation speed; negative reverses, `0` stops        |
| `layers`    | `3`                               | Number of stacked waves (1-12)                       |
| `opacity`   | `0.6`                             | Fill opacity of each layer                           |
| `flip`      | `false`                           | Hang the waves from the top edge                     |
| `seed`      |                                   | Randomizes the phase of each layer; omit for the fixed phases |
| `className`, `style` |                          | Applied to the root `svg`                            |

## Aurora

Luminous curtain ribbons with an SVG glow, optional ray streaks and stars. Animated with CSS.

```jsx
<Aurora colors={['#5eead4', '#38bdf8', '#e0f2fe']} ribbons={4} rays={40} />
```

| Prop         | Default                                | Description                                              |
| ------------ | -------------------------------------- | -------------------------------------------------------- |
| `colors`     | `['#34d399','#22d3ee','#a78bfa']`      | Ribbon colors; each ribbon fades toward the next color   |
| `ribbons`    | `3`                                    | Number of curtains (1-8)                                 |
| `blur`       | `14`                                   | Glow blur in viewBox units; `0` disables it              |
| `speed`      | `1`                                    | Animation speed; negative reverses, `0` stops            |
| `intensity`  | `0.8`                                  | Overall brightness, 0-1                                  |
| `amplitude`  | `46`                                   | Height of the waves along each ribbon                    |
| `rays`       | `true`                                 | `true` for 28 streaks, a number for a custom count, `false` for none |
| `stars`      | `true`                                 | `true` for 70 stars, a number for a custom count, `false` for none |
| `skew`       | `6`                                    | Lean of the curtains and rays in degrees                 |
| `background` | `['#04060f','#0a1428','#10283a']`      | CSS color, or an array for a top-to-bottom sky gradient  |
| `seed`       | `1`                                    | Seed for ribbon shapes, rays and stars                   |
| `height`     | `420`                                  | Number (px) or any CSS length                            |
| `width`      | `'100%'`                               | Number (px) or any CSS length                            |
| `className`, `style`, `children` |                    | Applied to the root `div`                                |

## Gradient

Linear, radial, conic or mesh gradient with optional grain.

```jsx
<Gradient type="mesh" colors={['#6366f1', '#f472b6', '#fbbf24']} blobs={6} grain={0.18} />
```

| Prop         | Default                                         | Description                                                        |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------ |
| `type`       | `'linear'`                                      | `'linear'`, `'radial'`, `'conic'` or `'mesh'`                      |
| `colors`     | `['#1d2b64','#5b3f9e','#d4719a','#f6b983']`     | Gradient colors; mesh cycles them across blobs                     |
| `angle`      | `135`                                           | Degrees. Gradient direction (linear), center offset (radial), start angle (conic) |
| `stops`      |                                                 | Explicit stop positions in percent, one per color                  |
| `speed`      | `1`                                             | Animation speed; negative reverses, `0` stops                      |
| `easing`     | `'ease-in-out'`                                 | Any CSS timing function; used by pan and drift animations          |
| `grain`      | `0.12`                                          | Noise overlay strength, 0-1; `0` disables it                       |
| `blend`      |                                                 | `mix-blend-mode` of the gradient layer                             |
| `opacity`    | `1`                                             | Opacity of the gradient layer                                      |
| `blobs`      | `5`                                             | Number of drifting blobs for `'mesh'`                              |
| `background` |                                                 | Base color behind the gradient; mesh falls back to the first color |
| `seed`       | `1`                                             | Seed for mesh layout and the grain pattern                         |
| `height`     | `320`                                           | Number (px) or any CSS length                                      |
| `width`      | `'100%'`                                        | Number (px) or any CSS length                                      |
| `className`, `style`, `children` |                             | Applied to the root `div`                                          |

## Blob

Morphing organic shapes. Control points are rendered as a closed Catmull-Rom curve and their radii are animated per frame.

```jsx
<Blob blobs={4} points={8} randomness={0.55} colors={['#f97316', '#e11d48']} blur={18} rotate={6} />
```

| Prop          | Default                           | Description                                                    |
| ------------- | --------------------------------- | -------------------------------------------------------------- |
| `blobs`       | `3`                               | Number of stacked shapes (1-8)                                 |
| `points`      | `6`                               | Control points per shape (3-12)                                |
| `randomness`  | `0.4`                             | Irregularity and morph depth, 0-1                              |
| `smoothness`  | `1`                               | `0` draws straight edges, `1` is Catmull-Rom, up to `1.5`      |
| `size`        | `0.7`                             | Size of the largest shape relative to the shorter side, 0.1-1  |
| `speed`       | `1`                               | Morph speed; negative reverses, `0` stops                      |
| `rotate`      | `0`                               | Rotation in degrees per second; alternate shapes spin the other way |
| `colors`      | `['#6366f1','#14b8a6','#f472b6']` | Fill per shape, cycled                                         |
| `gradient`    | `true`                            | Fill each shape with a gradient toward the next color          |
| `stroke`      | shape color                       | Stroke color                                                   |
| `strokeWidth` | `0`                               | Stroke width in viewBox units (200 across)                     |
| `blur`        | `0`                               | CSS blur in px                                                 |
| `opacity`     | `0.85`                            | Fill opacity                                                   |
| `seed`        | `1`                               | Seed for point layout and morph phases                         |
| `background`  |                                   | Root background                                                |
| `height`      | `360`                             | Number (px) or any CSS length                                  |
| `width`       | `'100%'`                          | Number (px) or any CSS length                                  |
| `className`, `style`, `children` |                | Applied to the root `div`                                      |

## Particles

Canvas particles with connecting lines. Links use a spatial grid, so large counts stay cheap.

```jsx
<Particles count={160} links={false} depth={0.8} direction={100} colors={['#ffffff', '#dbeafe']} />
```

| Prop                | Default                           | Description                                                    |
| ------------------- | --------------------------------- | -------------------------------------------------------------- |
| `count`             | `90`                              | Number of particles (max 4000)                                 |
| `colors`            | `['#94a3b8','#7dd3fc','#c4b5fd']` | Particle colors, picked per particle                           |
| `size`              | `[1, 3]`                          | Radius in px; a number or a `[min, max]` pair                  |
| `speed`             | `1`                               | Speed multiplier; negative reverses, `0` stops                 |
| `linkDistance`      | `120`                             | Maximum distance for a link in px                              |
| `linkWidth`         | `1`                               | Link width in px                                               |
| `linkOpacity`       | `0.35`                            | Link opacity at distance 0, fading to 0 at `linkDistance`      |
| `links`             | `true`                            | Draw links                                                     |
| `interaction`       | `'repel'`                         | Pointer behavior: `'none'`, `'repel'` or `'attract'`           |
| `interactionRadius` | `140`                             | Pointer influence radius in px                                 |
| `pointerTarget`     | `'element'`                       | `'element'` tracks the pointer over the component; `'window'` tracks it anywhere, for fixed backgrounds under other content |
| `depth`             | `0`                               | 0-1. Far particles get smaller, slower and dimmer, and shift with the pointer |
| `direction`         |                                   | Drift angle in degrees (0 is right, 90 is down); omit for random headings |
| `shape`             | `'circle'`                        | `'circle'` or `'square'`                                       |
| `background`        |                                   | Root background                                                |
| `seed`              | `1`                               | Seed for positions, velocities and colors                      |
| `height`            | `360`                             | Number (px) or any CSS length                                  |
| `width`             | `'100%'`                          | Number (px) or any CSS length                                  |
| `className`, `style`, `children` |                      | Applied to the root `div`                                      |

Pointer events are scoped to the component's root element.

## Contours

Flowing topographic lines: marching squares over an animated noise field.

```jsx
<Contours levels={16} colors={['#6b5b4b', '#a8927c']} background="#f3ede2" />
```

| Prop         | Default                           | Description                                              |
| ------------ | --------------------------------- | -------------------------------------------------------- |
| `levels`     | `12`                              | Number of iso-lines (1-40)                               |
| `scale`      | `240`                             | Feature size of the noise field in px                    |
| `speed`      | `1`                               | Flow speed; negative reverses, `0` stops                 |
| `lineWidth`  | `1`                               | Line width in px; `0` hides lines                        |
| `colors`     | `['#1d3b5c','#3f87a6','#b8e0d2']` | Colors interpolated across levels                        |
| `background` | `'#0a0f1c'`                       | Root background                                          |
| `smooth`     | `true`                            | Round the lines with quadratic curves                    |
| `resolution` | `10`                              | Grid cell size in px (minimum 6); lower is finer and slower |
| `fill`       | `false`                           | Fill the bands between levels                            |
| `seed`       | `1`                               | Seed for the noise field                                 |
| `height`     | `360`                             | Number (px) or any CSS length                            |
| `width`      | `'100%'`                          | Number (px) or any CSS length                            |
| `className`, `style`, `children` |                   | Applied to the root `div`                                |

## Dunes

Layered silhouettes with parallax drift. Layers tile seamlessly, and nearer layers move faster.

```jsx
<Dunes variant="mountains" colors={['#b7c6d8', '#8aa0bb', '#5d7595', '#3a506f', '#1f2f4a']} fog={0.5} />
```

| Prop          | Default                                          | Description                                                  |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `layers`      | `5`                                              | Number of silhouettes (1-10)                                 |
| `variant`     | `'dunes'`                                        | `'dunes'` (smooth) or `'mountains'` (jagged)                 |
| `roughness`   | `0.5`                                            | Detail added on top of the base shape, 0-1                   |
| `colors`      | `['#c98a76','#a96a6e','#7f4c65','#58355a','#33223f']` | Far to near; spread across the layers                   |
| `speed`       | `1`                                              | Drift speed; negative reverses, `0` stops                    |
| `sky`         | `['#1f2a52','#7a4a7e','#e8957a','#f6d2a0']`      | Top-to-bottom gradient colors, or `false` for a transparent sky |
| `sun`         | `true`                                           | Draw a sun behind the layers                                 |
| `sunColor`    | `'#fff1d0'`                                      | Sun and glow color                                           |
| `sunSize`     | `110`                                            | Sun diameter in px                                           |
| `sunPosition` | `[0.7, 0.4]`                                     | Sun center as `[x, y]` fractions of the width and height     |
| `fog`         | `0.35`                                           | Haze strength between layers, 0-1                            |
| `flip`        | `false`                                          | Hang the silhouettes from the top edge                       |
| `seed`        | `1`                                              | Seed for the silhouettes                                     |
| `height`      | `360`                                            | Number (px) or any CSS length                                |
| `width`       | `'100%'`                                         | Number (px) or any CSS length                                |
| `className`, `style`, `children` |                               | Applied to the root `div`                                    |

## License

MIT
