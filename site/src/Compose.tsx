import type { CSSProperties, ReactNode } from 'react';
import { Aurora, Dunes, Gradient, Waves } from 'react-animated-layouts';
import { CodeBlock, LazyMount } from './ui';

const BAND = `import { Aurora, Dunes } from 'react-animated-layouts';

<Aurora ribbons={4} height={340}>
  <Dunes
    sky={false}
    sun={false}
    layers={4}
    variant="mountains"
    colors={['#1c4a63', '#123349', '#0b2234', '#061520']}
    height={170}
    style={{ position: 'absolute', bottom: 0 }}
  />
  <h3 style={{ position: 'relative', margin: 0, padding: 32, color: '#fff' }}>
    Content sits above both layers
  </h3>
</Aurora>`;

const CARD = `import { Gradient } from 'react-animated-layouts';

<Gradient
  type="mesh"
  colors={['#6366f1', '#f472b6', '#fbbf24']}
  blobs={6}
  grain={0.2}
  height={300}
  style={{ borderRadius: 20 }}
>
  <div style={{ margin: 24, padding: 20, borderRadius: 14, color: '#fff', background: 'rgba(8, 10, 20, 0.6)' }}>
    <h3 style={{ margin: 0 }}>Card on a gradient</h3>
    <p style={{ margin: '8px 0 0' }}>Grain keeps the colors from banding.</p>
  </div>
</Gradient>`;

const DIVIDER = `import { Waves } from 'react-animated-layouts';

<div style={{ background: '#3b1650' }}>
  <p style={{ margin: 0, padding: '36px 28px 12px', color: '#fff' }}>Section A</p>
  <Waves colors={['#f472b6', '#c026d3', '#7c3aed']} opacity={1} height={110} amplitude={18} />
</div>
<p style={{ margin: 0, padding: '12px 28px 36px', background: '#7c3aed', color: '#fff' }}>Section B</p>`;

function Item({ title, text, code, children, wide, h }: { title: string; text: string; code: string; children: ReactNode; wide?: boolean; h: number }) {
  return (
    <article className={wide ? 'comp comp-wide' : 'comp'}>
      <div className="comp-head">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div className="comp-frame on-dark" style={{ '--h': `${h}px` } as CSSProperties}>
        <LazyMount fallback={<div className="skeleton" aria-hidden="true" />}>{children}</LazyMount>
      </div>
      <CodeBlock code={code} title="JSX" what={`${title} code`} />
    </article>
  );
}

export function Compose() {
  return (
    <section id="compose" className="demo compose" aria-labelledby="compose-h">
      <div className="wrap">
        <header className="demo-head">
          <h2 id="compose-h">Build layouts from them</h2>
          <p className="lede">
            Every component except Waves renders <code>children</code> above the effect. Stack them, give them a border radius, or use Waves as the edge between two sections.
          </p>
        </header>
        <div className="comp-grid">
          <Item wide h={340} title="Band with two layers" text="Aurora behind, Dunes in front, a heading above both." code={BAND}>
            <Aurora ribbons={4} height={340}>
              <Dunes
                sky={false}
                sun={false}
                layers={4}
                variant="mountains"
                colors={['#1c4a63', '#123349', '#0b2234', '#061520']}
                height={170}
                style={{ position: 'absolute', bottom: 0 }}
              />
              <h3 style={{ position: 'relative', margin: 0, padding: 32, color: '#fff' }}>Content sits above both layers</h3>
            </Aurora>
          </Item>
          <Item h={300} title="Card with grain" text="A mesh gradient with a rounded corner and a scrim for text." code={CARD}>
            <Gradient type="mesh" colors={['#6366f1', '#f472b6', '#fbbf24']} blobs={6} grain={0.2} height={300} style={{ borderRadius: 20 }}>
              <div style={{ margin: 24, padding: 20, borderRadius: 14, color: '#fff', background: 'rgba(8, 10, 20, 0.6)' }}>
                <h3 style={{ margin: 0 }}>Card on a gradient</h3>
                <p style={{ margin: '8px 0 0' }}>Grain keeps the colors from banding.</p>
              </div>
            </Gradient>
          </Item>
          <Item h={232} title="Section divider" text="Waves in the next section's color, placed at the end of the first." code={DIVIDER}>
            <div>
              <div style={{ background: '#3b1650' }}>
                <p style={{ margin: 0, padding: '36px 28px 12px', color: '#fff' }}>Section A</p>
                <Waves colors={['#f472b6', '#c026d3', '#7c3aed']} opacity={1} height={110} amplitude={18} />
              </div>
              <p style={{ margin: 0, padding: '12px 28px 36px', background: '#7c3aed', color: '#fff' }}>Section B</p>
            </div>
          </Item>
        </div>
      </div>
    </section>
  );
}
