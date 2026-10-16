import { CopyButton, Icon } from './ui';

export const REPO = 'https://github.com/Bardolog1/react-animated-layouts';
export const INSTALL = 'npm install react-animated-layouts';

const FACTS = ['7 components', '0 runtime dependencies', 'SSR-safe', 'Honors reduced motion', 'Seedable'];

export function Hero() {
  return (
    <section className="hero" aria-labelledby="top-h">
      <div className="wrap hero-inner">
        <h1 id="top-h">Animated layouts for React, in one import.</h1>
        <p className="hero-sub">
          Seven components that draw animated backgrounds behind your content. Pass props, nest children, and the effect stays underneath.
        </p>
        <div className="install">
          <code>
            <span aria-hidden="true">$ </span>
            {INSTALL}
          </code>
          <CopyButton text={INSTALL} what="the install command" />
        </div>
        <div className="hero-cta">
          <a className="btn btn-primary" href="#waves">
            Try the components
            <Icon name="arrow" />
          </a>
          <a className="btn btn-outline" href={REPO}>
            <Icon name="github" />
            GitHub
          </a>
        </div>
        <ul className="facts" aria-label="Library facts">
          {FACTS.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className="hero-cap">
          This background: <code>Particles</code> with <code>shape="square"</code>.
        </p>
      </div>
    </section>
  );
}
