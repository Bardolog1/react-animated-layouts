import { useEffect, useRef, useState } from 'react';
import { SPECS } from './schema';
import { Playground } from './Playground';
import { Hero, INSTALL, REPO } from './Hero';
import { Compose } from './Compose';
import { SiteBackground } from './Background';
import { AnnounceProvider, CopyButton, Icon } from './ui';

type Theme = 'dark' | 'light';

const LINKS = [...SPECS.map((s) => ({ id: s.id, label: s.name })), { id: 'compose', label: 'Compose' }];

function useActive(ids: string[]) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    els.forEach((e) => io.observe(e));
    const onTop = () => window.scrollY < 200 && setActive('');
    window.addEventListener('scroll', onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onTop);
    };
  }, [ids]);
  return active;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'));
  const ids = useRef(LINKS.map((l) => l.id)).current;
  const active = useActive(ids);
  const linksRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const row = linksRef.current;
    const cur = row?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!row || !cur) return;
    row.scrollTo({ left: cur.offsetLeft - row.clientWidth / 2 + cur.clientWidth / 2, behavior: 'auto' });
  }, [active]);

  const flip = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('ral-theme', next);
    } catch {
      /* storage can be blocked */
    }
  };

  return (
    <AnnounceProvider>
      <SiteBackground theme={theme} />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <div className="wrap topbar-in">
          <a className="brand" href="#top-h" aria-label="react-animated-layouts, back to top">
            <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M3 20c4-6 8-6 12 0s8 6 14 0v9H3z" fill="var(--accent)" />
              <path d="M3 13c4-6 8-6 12 0s8 6 14 0" fill="none" stroke="var(--text)" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
            <span>react-animated-layouts</span>
          </a>
          <nav className="sections" aria-label="Sections">
            <ul ref={linksRef}>
              {LINKS.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} aria-current={active === l.id ? 'location' : undefined}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="topbar-tools">
            <button type="button" className="icon-btn" aria-pressed={theme === 'light'} aria-label="Light theme" onClick={flip}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
            </button>
            <a className="icon-btn" href={REPO} aria-label="GitHub repository">
              <Icon name="github" size={20} />
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        <Hero />
        {SPECS.map((s) => (
          <Playground key={s.id} spec={s} />
        ))}
        <Compose />
      </main>

      <footer className="footer">
        <div className="wrap footer-in">
          <div>
            <p className="footer-brand">react-animated-layouts</p>
            <p className="footer-meta">
              MIT License. Built by Libardo Lozano.{' '}
              <a href={REPO}>Source on GitHub</a>
            </p>
          </div>
          <div className="install">
            <code>
              <span aria-hidden="true">$ </span>
              {INSTALL}
            </code>
            <CopyButton text={INSTALL} what="the install command" />
          </div>
        </div>
      </footer>
    </AnnounceProvider>
  );
}
