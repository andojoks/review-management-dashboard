import { useRef } from 'react';
import { useSplitMotion } from '@/ui/motion/charts';

export interface SplitPart {
  name: string;
  value: number;
  color: string;
}

export interface SplitProps {
  parts?: SplitPart[];
  values?: number[];
  labels?: string[];
  label?: string;
  format?: (value: number) => string;
}

const colors = [
  'var(--data)',
  'color-mix(in oklab, var(--data) 62%, var(--card))',
  'var(--data-2)',
  'var(--data-3)',
];

const defaultValues = [38, 32, 14, 9];
const defaultLabels = ['Mobile app', 'Website', 'Email request', 'Text link'];
const defaultFormat = (value: number) => String(value);

export function Split({
  parts,
  values = defaultValues,
  labels = defaultLabels,
  label = 'Channels',
  format = defaultFormat,
}: SplitProps) {
  const root = useRef<HTMLDivElement>(null);
  const segments: SplitPart[] = parts ?? values.map((value, index) => ({
    name: labels[index] ?? String(index + 1),
    value,
    color: colors[index % colors.length],
  }));
  const total = segments.reduce((sum, part) => sum + part.value, 0) || 1;

  useSplitMotion(root, segments.map((part) => part.value).join(','));

  return (
    <div
      className="split"
      ref={root}
      role="img"
      aria-label={`${label}: ${segments.map((part) => `${part.name} ${format(part.value)}`).join(', ')}`}
    >
      {segments.map((part) => (
        <span
          className="split__seg"
          key={part.name}
          title={`${part.name} · ${format(part.value)}`}
          style={{ flexGrow: part.value / total }}
        >
          <i style={{ background: part.color }} />
        </span>
      ))}
    </div>
  );
}

export const Donut = Split;
export type DonutProps = SplitProps;
