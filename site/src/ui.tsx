import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { tokenize } from './code';

const PATHS: Record<string, ReactNode> = {
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
  shuffle: <><path d="M2 18h1.4c1.3 0 2.500-.6 3.300-1.700l6.100-8.600c.7-1.100 2-1.700 3.300-1.700H22M18 2l4 4-4 4M2 6h1.900c1.500 0 2.900.9 3.600 2.200M22 18h-5.900c-1.300 0-2.600-.7-3.300-1.800l-.5-.8M18 14l4 4-4 4" /></>,
  reset: <><path d="M4 12a8 8 0 1 0 2.700-6" /><path d="M4 4v4.500h4.500" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  github: <path d="M12 2.500a9.500 9.500 0 0 0-3 18.500c.5.100.700-.200.700-.500v-1.800c-2.700.600-3.300-1.100-3.300-1.100-.400-1.100-1.100-1.400-1.100-1.400-.900-.600.100-.600.100-.600 1 .100 1.500 1 1.500 1 .900 1.500 2.300 1.100 2.900.800.100-.600.300-1.100.600-1.300-2.100-.200-4.300-1.100-4.300-4.700 0-1 .400-1.900 1-2.500-.100-.300-.400-1.200.100-2.500 0 0 .800-.300 2.600 1a9 9 0 0 1 4.800 0c1.800-1.200 2.600-1 2.600-1 .500 1.300.200 2.200.100 2.500.600.700 1 1.500 1 2.500 0 3.600-2.200 4.400-4.300 4.700.300.300.600.900.600 1.800V20.500c0 .300.200.600.700.500A9.500 9.500 0 0 0 12 2.500Z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

export function Icon({ name, size = 18 }: { name: keyof typeof PATHS; size?: number }) {
  const filled = name === 'github';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

const Announce = createContext<(m: string) => void>(() => {});
export const useAnnounce = () => useContext(Announce);

export function AnnounceProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const announce = useCallback((m: string) => {
    setMsg('');
    window.setTimeout(() => setMsg(m), 60);
  }, []);
  return (
    <Announce.Provider value={announce}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {msg}
      </div>
    </Announce.Provider>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function CopyButton({ text, what, label = 'Copy' }: { text: string; what: string; label?: string }) {
  const announce = useAnnounce();
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onClick = async () => {
    const ok = await copyText(text);
    setState(ok ? 'ok' : 'fail');
    announce(ok ? `Copied ${what} to the clipboard` : `Could not copy ${what}. Select the text and copy it manually.`);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2000);
  };
  return (
    <button type="button" className={`btn btn-copy${state === 'ok' ? ' is-ok' : ''}`} onClick={onClick}>
      <Icon name={state === 'ok' ? 'check' : 'copy'} />
      <span>{state === 'ok' ? 'Copied' : state === 'fail' ? 'Copy failed' : label}</span>
    </button>
  );
}

export function CodeBlock({ code, title, what }: { code: string; title: string; what: string }) {
  return (
    <figure className="code on-dark">
      <figcaption className="code-bar">
        <span>{title}</span>
        <CopyButton text={code} what={what} />
      </figcaption>
      <pre tabIndex={0} aria-label={`${title} source`}>
        <code>
          {tokenize(code).map((k, i) =>
            k.c ? (
              <span key={i} className={`tk-${k.c}`}>
                {k.t}
              </span>
            ) : (
              k.t
            ),
          )}
        </code>
      </pre>
    </figure>
  );
}

export function LazyMount({ children, fallback, margin = 300 }: { children: ReactNode; fallback?: ReactNode; margin?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: `${margin}px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return (
    <div ref={ref} className="lazy">
      {on ? children : fallback}
    </div>
  );
}
