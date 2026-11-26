import type { MouseEventHandler } from 'react';
import { Sparkline } from '@/ui/components/charts';
import { formatNumber } from '@/ui/data/format';
import { Delta } from './SourcePrimitives';
import { Counter } from './Counter';
import { Icon, type IconName } from './Icon';

export interface MetricTileProps {
  label: string;
  value: string | number;
  delta: string | number;
  helper: string;
  icon: IconName;
  invert?: boolean;
  values?: number[];
  tone?: 'dark' | 'light';
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const whole = (value: number) => formatNumber(value);

export function MetricTile({
  label,
  value,
  delta,
  helper,
  icon,
  invert = false,
  values,
  tone = 'light',
  active = false,
  onClick,
}: MetricTileProps) {
  return (
    <button
      type="button"
      className={`kpi kpi--pick${active ? ' is-on' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="kpi__label">
        <span className="disc disc--sm"><Icon name={icon} /></span>
        {label}
      </span>
      <span className="kpi__value">
        {typeof value === 'number' ? <Counter value={value} format={whole} /> : <span>{value}</span>}
      </span>
      <span className="kpi__foot">
        {typeof delta === 'number' ? <Delta value={delta} invert={invert} /> : <span className="delta delta--up">{delta}</span>}
        {' '}{helper}
        <Sparkline values={values} tone={tone === 'dark' ? 'dark' : 'muted'} />
      </span>
    </button>
  );
}
