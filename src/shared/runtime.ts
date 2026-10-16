import { useEffect, useRef, useState, type MutableRefObject } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export function runLoop(el: Element, draw: (dt: number) => void, animate: boolean): () => void {
  draw(0);
  if (!animate) return () => {};
  let raf = 0;
  let last = 0;
  const tick = (now: number) => {
    draw(last ? Math.min((now - last) / 1000, 0.05) : 0);
    last = now;
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  if (typeof IntersectionObserver === 'undefined') {
    start();
    return stop;
  }
  const io = new IntersectionObserver((entries) => {
    if (entries[entries.length - 1].isIntersecting) start();
    else stop();
  });
  io.observe(el);
  return () => {
    stop();
    io.disconnect();
  };
}

export function observeSize(el: Element, onSize: (width: number, height: number) => void): () => void {
  const rect = el.getBoundingClientRect();
  onSize(rect.width, rect.height);
  if (typeof ResizeObserver === 'undefined') return () => {};
  const ro = new ResizeObserver((entries) => {
    const { width, height } = entries[entries.length - 1].contentRect;
    onSize(width, height);
  });
  ro.observe(el);
  return () => ro.disconnect();
}

export function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number): number {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  return dpr;
}
