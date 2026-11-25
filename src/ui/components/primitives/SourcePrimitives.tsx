import { useRef, type ReactNode } from 'react';
import { usePillGroup } from '@/hooks/usePillGroup';
import { chipShake, iconPop } from '@/ui/motion/interactions';
import { Icon, type IconName } from './Icon';

export interface TabsProps {
  items: Array<{ id: string; label: string; href: string; count?: string | number }>;
  active: string;
}

export function Tabs({ items, active }: TabsProps) {
  const nav = useRef<HTMLElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  usePillGroup(nav, line, '[aria-current="page"]', active, { radius: 2, line: true, scroll: true });

  return (
    <nav className="tabs" aria-label="Sections" ref={nav}>
      {items.map((item) => (
        <a key={item.id} href={item.href} aria-current={active === item.id ? 'page' : undefined}>
          {item.label}
          {item.count !== undefined ? <span className="badge">{item.count}</span> : null}
        </a>
      ))}
      <span className="tabs__line" ref={line} />
    </nav>
  );
}

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function SearchField({ value, onChange, placeholder = 'Search', ariaLabel = 'Search' }: SearchFieldProps) {
  return (
    <label className="inwrap">
      <Icon name="search" size={16} />
      <input className="input" aria-label={ariaLabel} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export interface SegmentedProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; label: string; icon?: IconName; title?: string }>;
  accent?: boolean;
  className?: string;
}

export function Segmented({ label, value, onChange, options, accent = false, className = '' }: SegmentedProps) {
  const root = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  usePillGroup(root, thumb, '[aria-pressed="true"]', value, { radius: 99 });

  return (
    <div
      className={`seg${accent ? ' seg--accent' : ''}${className ? ` ${className}` : ''}`}
      role="group"
      aria-label={label}
      ref={root}
    >
      <span className="seg__thumb" ref={thumb} />
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          aria-pressed={value === option.id}
          title={option.title}
          onClick={(event) => {
            iconPop(event.currentTarget);
            onChange(option.id);
          }}
        >
          {option.icon ? <Icon name={option.icon} size={14} /> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; label: string }>;
  className?: string;
}

export function SelectField({ label, value, onChange, options, className = '' }: SelectFieldProps) {
  return (
    <select className={`select select--sm${className ? ` ${className}` : ''}`} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
    </select>
  );
}

export interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Chip({ active = false, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={active}
      onClick={(event) => {
        chipShake(event.currentTarget);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export interface PlainKpiProps {
  label: string;
  value: ReactNode;
  foot: ReactNode;
}

export function PlainKpi({ label, value, foot }: PlainKpiProps) {
  return (
    <div className="kpi kpi--plain">
      <span className="kpi__label">{label}</span>
      <span className="kpi__value">{value}</span>
      <span className="kpi__foot">{foot}</span>
    </div>
  );
}

export interface DeltaProps {
  value: number;
  invert?: boolean;
}

export function Delta({ value, invert = false }: DeltaProps) {
  const up = value >= 0;
  const good = invert ? !up : up;
  const change = Math.abs(value * 100);
  return <span className={`delta delta--${good ? 'up' : 'down'}`}>{up ? '↑' : '↓'} {change.toFixed(Math.abs(value) < .1 ? 1 : 0)}%</span>;
}

export interface EmptyProps {
  icon?: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}

export function Empty({ icon = 'search', title, body, action }: EmptyProps) {
  return (
    <div className="empty">
      <span className="empty__icon"><Icon name={icon} /></span>
      <b>{title}</b>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return <a className="linkbtn" href={href}>{children}</a>;
}
