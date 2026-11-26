import { useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { usePillGroup } from '@/hooks/usePillGroup';
import { chipShake, iconPop, motionDuration, motionEnabled } from '@/ui/motion/interactions';
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

export interface AccordionItem {
  id: string;
  question: ReactNode;
  answer: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  active: string | null;
  onChange: (id: string | null) => void;
  className?: string;
}

/**
 * Source help-page expansion card: one answer open at a time, with a clipped
 * GSAP reveal and a chevron rotated by the .is-open CSS rule.
 */
export function Accordion({ items, active, onChange, className = '' }: AccordionProps) {
  return (
    <div className={`faq${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          open={active === item.id}
          onToggle={() => onChange(active === item.id ? null : item.id)}
        />
      ))}
    </div>
  );
}

function AccordionRow({ item, open, onToggle }: { item: AccordionItem; open: boolean; onToggle: () => void }) {
  const answer = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const element = answer.current;
    if (!element) return;
    // The source skips the reveal for the answer that is open on first paint.
    if (first.current) {
      first.current = false;
      return;
    }
    if (!motionEnabled()) return;
    gsap.fromTo(element,
      { clipPath: 'inset(0 0 100% 0)', y: -6, opacity: 0 },
      {
        clipPath: 'inset(0 0 0% 0)', y: 0, opacity: 1,
        duration: .45, ease: 'power3.out',
        clearProps: 'clipPath,transform,opacity',
      });
  }, [open]);

  return (
    <div className={`faq__item${open ? ' is-open' : ''}`}>
      <button type="button" aria-expanded={open} onClick={onToggle}>
        <span>{item.question}</span>
        <Icon name="down" />
      </button>
      {open ? <div className="faq__a" ref={answer}>{item.answer}</div> : null}
    </div>
  );
}

export interface StepsProps {
  steps: string[];
  at: number;
  compact?: boolean;
}

/** Source `Mc()`: compact onboarding progress bar with animated fills/dots. */
export function Steps({ steps, at, compact = false }: StepsProps) {
  const list = useRef<HTMLOListElement>(null);
  const previous = useRef(at);

  useLayoutEffect(() => {
    const root = list.current;
    if (!root) return;
    const changed = previous.current !== at;
    root.querySelectorAll<HTMLElement>('.steps__fill').forEach((fill, index) => {
      gsap.to(fill, {
        scaleX: Number(index < at),
        duration: motionDuration(changed ? .6 : .9),
        delay: motionDuration(changed ? .2 + index * .12 : 0),
        ease: 'expo.out',
      });
    });
    if (changed) {
      const dot = root.querySelectorAll<HTMLElement>('.steps__dot')[Math.min(at, steps.length - 1)];
      if (dot) {
        gsap.fromTo(dot, { scale: .5 }, {
          scale: 1, duration: motionDuration(.6), ease: 'back.out(3)', clearProps: 'transform',
        });
      }
    }
    previous.current = at;
  }, [at, steps.length]);

  return (
    <ol className={`steps${compact ? ' steps--compact' : ''}`} ref={list}>
      {steps.map((step, index) => (
        <li key={step} className={index < at ? 'is-done' : index === at ? 'is-now' : ''}>
          <span className="steps__dot">{index < at ? <Icon name="check" /> : null}</span>
          {index < steps.length - 1 ? (
            <span className="steps__bar"><i className="steps__fill" style={{ transform: 'scaleX(0)' }} /></span>
          ) : null}
          <small>{step}</small>
        </li>
      ))}
    </ol>
  );
}

export interface MeterProps {
  value: number;
  max: number;
  tone?: 'good' | 'warn' | 'bad';
  label?: string;
}

/** Source `Nc()`: reusable horizontal progress meter. */
export function Meter({ value, max, tone, label }: MeterProps) {
  const fill = useRef<HTMLSpanElement>(null);
  const factor = Math.max(0, Math.min(1, value / (max || 1)));

  useLayoutEffect(() => {
    gsap.to(fill.current, {
      scaleX: factor, duration: motionDuration(1), ease: 'expo.out', delay: motionDuration(.15),
    });
  }, [factor]);

  return (
    <span className={`meter${tone ? ` is-${tone}` : ''}`} role="meter" aria-label={label}
      aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={Math.round(max)}>
      <i ref={fill} style={{ transform: 'scaleX(0)' }} />
    </span>
  );
}

export interface StepperProps {
  value: number;
  onDec: () => void;
  onInc: () => void;
  label: string;
  max?: number;
  format?: (value: number) => string;
}

/** Source `Dc()`: count stepper with a GSAP flip on the live output. */
export function Stepper({ value, onDec, onInc, label, max, format }: StepperProps) {
  const output = useRef<HTMLOutputElement>(null);
  const previous = useRef(value);

  useLayoutEffect(() => {
    if (previous.current === value || !output.current) {
      previous.current = value;
      return;
    }
    gsap.fromTo(output.current,
      { yPercent: value > previous.current ? 60 : -60, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: motionDuration(.35),
        ease: 'back.out(2)',
        clearProps: 'transform,opacity',
      });
    previous.current = value;
  }, [value]);

  return (
    <span className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`One fewer ${label}`} onClick={(event) => {
        event.stopPropagation();
        iconPop(event.currentTarget);
        onDec();
      }}><Icon name="minus" /></button>
      <output ref={output} aria-live="polite">{format ? format(value) : value}</output>
      <button
        type="button"
        className="is-add"
        aria-label={`One more ${label}`}
        disabled={max !== undefined && value >= max}
        onClick={(event) => {
          event.stopPropagation();
          iconPop(event.currentTarget);
          onInc();
        }}
      ><Icon name="plus" /></button>
    </span>
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
      <Icon name="search" />
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
      className={`seg${accent ? ' seg--accent' : ''} ${className}`}
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
          {option.icon ? <Icon name={option.icon} size="sm" /> : null}
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
