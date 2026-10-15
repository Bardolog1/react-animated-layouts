# react-animated-layouts

Animated, customizable layout components for React. No runtime dependencies; animations are plain CSS and respect `prefers-reduced-motion`.

```sh
npm install react-animated-layouts
```

```jsx
import { Waves, Aurora, Gradient } from 'react-animated-layouts';

<Waves colors={['#38bdf8', '#0ea5e9', '#0369a1']} height={200} amplitude={24} frequency={2} />

<Aurora height={400}>
  <h1>Hello</h1>
</Aurora>

<Gradient colors={['#f97316', '#ec4899', '#6366f1']} angle={135} />
```

Run `npm run storybook` to try every component with live controls.

## Waves

Stacked SVG waves.

| Prop        | Default                           | Description                                          |
| ----------- | --------------------------------- | ---------------------------------------------------- |
| `colors`    | `['#38bdf8','#0ea5e9','#0369a1']` | Fill per layer, cycled when there are more layers    |
| `height`    | `160`                             | Height in px                                         |
| `width`     | `'100%'`                          | Number (px) or any CSS length                        |
| `amplitude` | `20`                              | Wave height in px                                    |
| `frequency` | `2`                               | Crests per 1200-unit tile, rounded to a whole number |
| `speed`     | `1`                               | Animation speed; negative reverses, `0` stops        |
| `layers`    | `3`                               | Number of stacked waves                              |
| `opacity`   | `0.6`                             | Fill opacity of each layer                           |
| `flip`      | `false`                           | Hang the waves from the top edge                     |
| `className` |                                   | Class for the root `svg`                             |
| `style`     |                                   | Inline style merged into the root `svg`              |

## Aurora

Blurred, drifting color blobs. Renders `children` above the effect.

| Prop         | Default                          | Description                                  |
| ------------ | -------------------------------- | -------------------------------------------- |
| `colors`     | `['#22d3ee','#a78bfa','#f472b6']` | Blob colors, cycled                         |
| `height`     | `320`                            | Number (px) or any CSS length                |
| `blobs`      | `5`                              | Number of blobs                              |
| `blur`       | `60`                             | Blur radius in px                            |
| `speed`      | `1`                              | Animation speed; negative reverses, `0` stops |
| `opacity`    | `0.7`                            | Blob opacity                                 |
| `background` | `'#0b1020'`                      | Base color behind the blobs                  |
| `className`, `style`, `children` |              | Applied to the root `div`                    |

## Gradient

Shifting linear gradient. Renders `children` inside.

| Prop     | Default                           | Description                                   |
| -------- | --------------------------------- | --------------------------------------------- |
| `colors` | `['#f97316','#ec4899','#6366f1']` | Gradient stops; the first color closes the loop |
| `angle`  | `135`                             | Gradient angle in degrees                     |
| `height` | `320`                             | Number (px) or any CSS length                 |
| `speed`  | `1`                               | Animation speed; negative reverses, `0` stops |
| `className`, `style`, `children` |                   | Applied to the root `div`                     |

## License

MIT
