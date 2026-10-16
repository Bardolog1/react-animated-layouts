import type { Field, Props, Spec, Val } from './schema';

export const eq = (a: Val, b: Val) => JSON.stringify(a) === JSON.stringify(b);

export function changedProps(spec: Spec, over: Props): Props {
  const out: Props = {};
  for (const f of spec.fields) {
    if (f.kind === 'ref') continue;
    const v = over[f.key];
    if (v !== undefined && !eq(v, f.def)) out[f.key] = v;
  }
  return out;
}

const list = (a: (string | number)[]) =>
  `[${a.map((x) => (typeof x === 'string' ? `'${x}'` : x)).join(', ')}]`;

function attr(key: string, v: Val): string {
  if (typeof v === 'string') return `${key}="${v}"`;
  if (typeof v === 'number') return `${key}={${v}}`;
  if (v === true) return key;
  if (v === false) return `${key}={false}`;
  return `${key}={${list(v as (string | number)[])}}`;
}

export function toJsx(spec: Spec, over: Props): string {
  const p = changedProps(spec, over);
  const attrs = Object.entries(p).map(([k, v]) => attr(k, v));
  const head = `import { ${spec.name} } from 'react-animated-layouts';\n\n`;
  const oneLine = `<${spec.name}${attrs.length ? ' ' + attrs.join(' ') : ''} />`;
  if (oneLine.length <= 76) return head + oneLine;
  return head + `<${spec.name}\n${attrs.map((a) => `  ${a}`).join('\n')}\n/>`;
}

export function fmtDefault(f: Field): string {
  if (f.show !== undefined) return f.show || '-';
  const d = f.def;
  if (d === undefined) return '-';
  if (typeof d === 'string') return `'${d}'`;
  if (Array.isArray(d)) return list(d as (string | number)[]);
  return String(d);
}

export function shortList(f: Field): string {
  const d = f.def;
  if (!Array.isArray(d)) return fmtDefault(f);
  const s = list(d as (string | number)[]);
  return s;
}

const RE = /('(?:[^'\\]|\\.)*'|"[^"]*"|<\/?[A-Za-z]\w*|\b\d+(?:\.\d+)?\b|\b(?:import|from)\b|\b[a-zA-Z]+(?==))/g;

export interface Token {
  t: string;
  c?: 'str' | 'tag' | 'num' | 'kw' | 'attr';
}

export function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of src.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: src.slice(last, i) });
    const s = m[0];
    const c = s[0] === "'" || s[0] === '"' ? 'str' : s[0] === '<' ? 'tag' : /^\d/.test(s) ? 'num' : s === 'import' || s === 'from' ? 'kw' : 'attr';
    out.push({ t: s, c });
    last = i + s.length;
  }
  if (last < src.length) out.push({ t: src.slice(last) });
  return out;
}
