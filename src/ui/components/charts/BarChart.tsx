import { useRef, useState } from 'react';
import { niceTicks, useBarsMotion } from '@/ui/motion/charts';

export interface BarChartProps {
  values?: number[];
  labels?: string[];
  ghost?: number[];
  ariaLabel?: string;
  height?: number;
  highlight?: number;
  compact?: boolean;
  format?: (value: number) => string;
  ghostLabel?: string;
  valueLabel?: string;
  hi?: [number, number];
}

const defaultValues = [0, 1, 3, 3, 0, 0, 0, 7, 3, 4, 5, 5, 5, 7];
const defaultLabels = ['27', '28', '29', '30', '31', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const defaultFormat = (value: number) => String(value);

export function BarChart({
  values = defaultValues,
  labels = defaultLabels,
  ghost,
  ariaLabel,
  height = 220,
  highlight = -1,
  compact = false,
  format = defaultFormat,
  ghostLabel = 'Last year',
  valueLabel = 'Values',
  hi,
}: BarChartProps) {
  const root = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<number | null>(null);
  const max = Math.max(...values, ...(ghost ?? []), 1) * 1.08;
  const integers = values.every(Number.isInteger) && (ghost ?? []).every(Number.isInteger) && niceTicks(max)[1] < 1;
  const ticks = integers
    ? Array.from({ length: Math.max(1, Math.ceil(max)) + 1 }, (_, index) => index)
    : niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;

  useBarsMotion(root, values, ghost, top);

  return (
    <div
      className={`bars${compact ? ' bars--compact' : ''}`}
      ref={root}
      style={{ height }}
      onPointerLeave={() => setTip(null)}
    >
      <div className="bars__grid" aria-hidden="true">
        {ticks.slice().reverse().map((tick) => <div key={tick}><span>{format(tick)}</span></div>)}
      </div>
      <div
        className="bars__cols"
        role="img"
        aria-label={ariaLabel ?? `${valueLabel}: ${labels.map((label, index) => `${label} ${format(values[index] ?? 0)}`).join(', ')}`}
      >
        {values.map((value, index) => {
          const highlighted = index === highlight || (!!hi && index >= hi[0] && index < hi[1]);
          return (
            <div
              className={`bars__col${highlighted ? ' is-hi' : ''}${tip === index ? ' is-tip' : ''}`}
              key={`${labels[index]}-${index}`}
              onPointerEnter={() => setTip(index)}
            >
              <div className="bars__track">
                {ghost ? <span className="bars__ghost" style={{ transform: 'scaleY(0)' }} /> : null}
                <span className="bars__bar" style={{ transform: 'scaleY(0)' }} />
              </div>
              <span className="bars__label">{labels[index]}</span>
              {tip === index ? (
                <span
                  className="charttip"
                  style={{ bottom: `calc(${Math.max(value, ghost?.[index] ?? 0) / top * 100}% + 34px)` }}
                >
                  <b>{format(value)}</b>
                  <small> {valueLabel}</small>
                  {ghost ? <small>{ghostLabel}: {format(ghost[index] ?? 0)}</small> : null}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
