# react-waves-layout

Animated SVG waves for React. No runtime dependencies; the animation is plain CSS.

```sh
npm install react-waves-layout
```

```jsx
import { Waves } from 'react-waves-layout';

<Waves colors={['#38bdf8', '#0ea5e9', '#0369a1']} height={200} amplitude={24} frequency={2} speed={1.2} />
```

## Props

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

Animation stops when the user prefers reduced motion.

## License

MIT
