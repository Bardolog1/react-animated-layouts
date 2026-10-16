import { useId, useMemo, useState, type ComponentType, type CSSProperties } from 'react';
import * as Lib from 'react-animated-layouts';
import { changedProps, eq, fmtDefault, toJsx } from './code';
import { Icon, CodeBlock, LazyMount } from './ui';
import type { Field, Props, Spec, Val } from './schema';

const round = (n: number) => Number(n.toFixed(4));
const fmt = (n: number) => String(round(n));
const POOL = ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb7185', '#22d3ee', '#f97316'];
const rnd = () => 1 + Math.floor(Math.random() * 9998);

interface CtlProps<F extends Field> {
  f: F;
  value: Val;
  onChange: (v: Val) => void;
}
type Of<K extends Field['kind']> = Extract<Field, { kind: K }>;

function RangeRow({ id, label, value, min, max, step, onChange, disabled }: {
  id: string; label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; disabled?: boolean;
}) {
  const p = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className="ctl">
      <div className="ctl-row">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{fmt(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ '--p': `${p}%` } as CSSProperties}
        onChange={(e) => onChange(round(Number(e.target.value)))}
      />
    </div>
  );
}

function Switch({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="ctl ctl-switch">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
}

function ColorPill({ id, label, value, onChange, onRemove, removeDisabled }: {
  id: string; label: string; value: string; onChange: (c: string) => void; onRemove?: () => void; removeDisabled?: boolean;
}) {
  return (
    <li className="pill">
      <input id={id} type="color" value={value} aria-label={label} onChange={(e) => onChange(e.target.value)} />
      <code>{value}</code>
      {onRemove && (
        <button type="button" className="icon-btn" aria-label={`Remove ${label.toLowerCase()}`} disabled={removeDisabled} onClick={onRemove}>
          <Icon name="x" size={16} />
        </button>
      )}
    </li>
  );
}

function Colors({ f, value, onChange }: CtlProps<Of<'colors'>>) {
  const uid = useId();
  const off = f.offable && value === false;
  const list = (off ? f.def : value) as string[];
  const set = (next: string[]) => onChange(next);
  return (
    <fieldset className="ctl ctl-colors">
      <legend>
        {f.label}
        {f.offable && (
          <span className="legend-switch">
            <input
              id={`${uid}-on`}
              type="checkbox"
              role="switch"
              checked={!off}
              aria-label={`Enable ${f.label}`}
              onChange={(e) => onChange(e.target.checked ? (f.def as string[]) : false)}
            />
          </span>
        )}
      </legend>
      <ul className={off ? 'pills is-off' : 'pills'}>
        {list.map((c, i) => (
          <ColorPill
            key={i}
            id={`${uid}-${i}`}
            label={`${f.label} color ${i + 1}`}
            value={c}
            onChange={(n) => set(list.map((x, j) => (j === i ? n : x)))}
            onRemove={() => set(list.filter((_, j) => j !== i))}
            removeDisabled={off || list.length <= f.min}
          />
        ))}
      </ul>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={off || list.length >= f.max}
        onClick={() => set([...list, POOL[list.length % POOL.length]])}
      >
        <Icon name="plus" size={16} />
        <span>Add color</span>
      </button>
    </fieldset>
  );
}

function Control({ f, value, onChange }: CtlProps<Field>) {
  const id = useId();
  switch (f.kind) {
    case 'range':
      return <RangeRow id={id} label={f.label} value={value as number} min={f.min} max={f.max} step={f.step} onChange={onChange} />;
    case 'toggle':
      return <Switch id={id} label={f.label} checked={value as boolean} onChange={onChange} />;
    case 'select':
      return (
        <div className="ctl ctl-select">
          <label htmlFor={id}>{f.label}</label>
          <select id={id} value={(value as string | undefined) ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
            {f.optional && <option value="">none</option>}
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    case 'colors':
      return <Colors f={f} value={value} onChange={onChange} />;
    case 'color':
      return (
        <div className="ctl ctl-color">
          <label htmlFor={id}>{f.label}</label>
          <ul className="pills one">
            <ColorPill id={id} label={f.label} value={value as string} onChange={onChange} />
          </ul>
        </div>
      );
    case 'optcolor': {
      const on = value !== undefined;
      return (
        <div className="ctl ctl-color">
          <div className="ctl-row">
            <label htmlFor={`${id}-on`}>{f.label}</label>
            <input id={`${id}-on`} type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked ? (f.key === 'stroke' ? '#e2e8f0' : '#0b1020') : undefined)} />
          </div>
          {on && (
            <ul className="pills one">
              <ColorPill id={id} label={f.label} value={value as string} onChange={onChange} />
            </ul>
          )}
        </div>
      );
    }
    case 'optrange': {
      const on = value !== undefined;
      return (
        <div className="ctl">
          <div className="ctl-row">
            <label htmlFor={`${id}-on`}>{f.label}</label>
            <span className="ctl-hint">{on ? '' : f.autoLabel}</span>
            <input id={`${id}-on`} type="checkbox" role="switch" aria-label={`Set ${f.label}`} checked={on} onChange={(e) => onChange(e.target.checked ? 90 : undefined)} />
          </div>
          {on && <RangeRow id={id} label="degrees" value={value as number} min={f.min} max={f.max} step={f.step} onChange={onChange} />}
        </div>
      );
    }
    case 'pair': {
      const [a, b] = value as number[];
      const ordered = f.key === 'size';
      return (
        <fieldset className="ctl ctl-pair">
          <legend>{f.label}</legend>
          <RangeRow id={`${id}-a`} label={f.names[0]} value={a} min={f.min} max={f.max} step={f.step} onChange={(n) => onChange([n, ordered ? Math.max(n, b) : b])} />
          <RangeRow id={`${id}-b`} label={f.names[1]} value={b} min={f.min} max={f.max} step={f.step} onChange={(n) => onChange([ordered ? Math.min(n, a) : a, n])} />
        </fieldset>
      );
    }
    case 'count': {
      const n = value === true ? f.trueAs : value === false ? 0 : (value as number);
      return (
        <div className="ctl">
          <RangeRow id={id} label={f.label} value={n} min={0} max={f.max} step={1} onChange={(v) => onChange(v === 0 ? false : v)} />
        </div>
      );
    }
    case 'seed':
      return (
        <div className="ctl ctl-seed">
          <div className="ctl-row">
            <span id={id}>seed</span>
            <output aria-labelledby={id}>{value === undefined ? 'fixed phases' : String(value)}</output>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => onChange(rnd())}>
            <Icon name="shuffle" size={16} />
            <span>Shuffle seed</span>
          </button>
        </div>
      );
    default:
      return null;
  }
}

function Stage({ spec, over }: { spec: Spec; over: Props }) {
  const Comp = (Lib as unknown as Record<string, ComponentType<Props>>)[spec.name];
  const hField = spec.fields.find((f) => f.key === 'height')!;
  const h = typeof over.height === 'number' ? over.height : (hField.def as number);
  const waves = spec.id === 'waves';
  const bottom = !(over.flip === true);
  return (
    <div className="stage on-dark" style={{ height: Math.max(240, h), '--ai': waves ? (bottom ? 'flex-end' : 'flex-start') : 'center' } as CSSProperties}>
      <LazyMount fallback={<div className="skeleton" aria-hidden="true" />}>
        <Comp {...over} />
      </LazyMount>
      <span className="stage-tag">
        {spec.name} / {h}px
      </span>
    </div>
  );
}

function RefTable({ spec }: { spec: Spec }) {
  return (
    <details className="ref">
      <summary>
        <span>Props reference</span>
        <span className="ref-count">{spec.fields.length} rows</span>
      </summary>
      <table>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {spec.fields.map((f) => (
            <tr key={f.key}>
              <th scope="row" data-label="Prop">
                <code>{f.key}</code>
              </th>
              <td data-label="Type">
                <code>{f.type}</code>
              </td>
              <td data-label="Default">{fmtDefault(f) === '-' ? <span className="dash">none</span> : <code>{fmtDefault(f)}</code>}</td>
              <td data-label="Description">{f.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function Playground({ spec }: { spec: Spec }) {
  const [over, setOver] = useState<Props>({});
  const controls = spec.fields.filter((f) => f.kind !== 'ref');
  const valueOf = (f: Field): Val => (f.key in over ? over[f.key] : f.def);
  const set = (key: string, v: Val) =>
    setOver((o) => {
      const n = { ...o };
      if (v === undefined) delete n[key];
      else n[key] = v;
      return n;
    });
  const code = useMemo(() => toJsx(spec, over), [spec, over]);
  const diff = changedProps(spec, over);
  const dirty = Object.keys(diff).length > 0;
  const swatches = (spec.fields.find((f) => f.key === 'colors')?.def as string[] | undefined)?.slice(0, 4) ?? [];
  const uid = useId();

  return (
    <section id={spec.id} className="demo" aria-labelledby={`${spec.id}-h`}>
      <div className="wrap">
        <header className="demo-head">
          <h2 id={`${spec.id}-h`}>
            {spec.name}
            <span className="dots" aria-hidden="true">
              {swatches.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
          </h2>
          <p className="lede">{spec.blurb}</p>
        </header>

        <div className="demo-grid">
          <div className="demo-main">
            <Stage spec={spec} over={over} />
            <CodeBlock code={code} title="Usage" what={`${spec.name} code`} />
          </div>

          <div className="panel" role="group" aria-label={`${spec.name} controls`}>
            <div className="panel-sec">
              <h3 id={`${uid}-p`}>Presets</h3>
              <div className="chips" role="group" aria-labelledby={`${uid}-p`}>
                {spec.presets.map((p) => {
                  const active = eq(changedProps(spec, p.props) as unknown as Val, diff as unknown as Val);
                  return (
                    <button key={p.name} type="button" className="chip" aria-pressed={active} onClick={() => setOver({ ...p.props })}>
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="panel-sec">
              <div className="panel-head">
                <h3>Controls</h3>
                <button type="button" className="btn btn-ghost" disabled={!dirty} onClick={() => setOver({})}>
                  <Icon name="reset" size={16} />
                  <span>Reset</span>
                </button>
              </div>
              <div className="ctls">
                {controls.map((f) => (
                  <Control key={f.key} f={f} value={valueOf(f)} onChange={(v) => set(f.key, v)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <RefTable spec={spec} />
      </div>
    </section>
  );
}
