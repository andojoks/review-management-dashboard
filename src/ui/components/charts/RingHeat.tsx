import { Fragment, useRef, useState, type ReactNode } from 'react';
import { useHeatMotion, useRingMotion } from '@/ui/motion/charts';

export interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}

export function Ring({ value, size = 92, stroke = 9, children }: RingProps) {
  const arc = useRef<SVGCircleElement>(null);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  useRingMotion(arc, value, circumference);

  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring__track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="ring__arc"
          ref={arc}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring__in">{children}</span>
    </span>
  );
}

export interface HeatProps {
  rows?: string[];
  cols?: string[];
  values?: number[][];
  peak?: [number, number];
  format?: (value: number) => string;
}

const defaultRows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const defaultCols = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
const defaultValues = [
  [3, 1, 1, 5, 16, 30, 30, 30, 40, 45, 46, 15],
  [2, 1, 1, 5, 14, 26, 34, 38, 41, 41, 39, 16],
  [2, 1, 1, 6, 20, 29, 26, 36, 44, 58, 43, 20],
  [3, 1, 1, 6, 19, 26, 32, 29, 48, 49, 37, 20],
  [3, 1, 1, 5, 17, 32, 32, 32, 37, 55, 33, 18],
  [3, 1, 1, 7, 23, 28, 32, 44, 60, 58, 49, 21],
  [3, 1, 1, 7, 23, 37, 37, 49, 61, 58, 41, 22],
];

export function Heat({
  rows = defaultRows,
  cols = defaultCols,
  values = defaultValues,
  peak = [6, 9],
  format = (value) => `${value} reviews`,
}: HeatProps) {
  const root = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const max = Math.max(...values.flat(), 1);
  useHeatMotion(root, rows, cols);

  return (
    <div
      className="heat"
      ref={root}
      style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(0, 1fr))` }}
      onPointerLeave={() => setHover(null)}
    >
      <span />
      {cols.map((col) => <span className="heat__col" key={col}>{col}</span>)}
      {rows.map((row, rowIndex) => (
        <Fragment key={row}>
          <span className="heat__row">{row}</span>
          {cols.map((col, colIndex) => {
            const value = values[rowIndex]?.[colIndex] ?? 0;
            const ratio = value / max;
            return (
              <span
                className={`heat__cell${peak[0] === rowIndex && peak[1] === colIndex ? ' is-peak' : ''}`}
                key={`${row}${col}`}
                onPointerEnter={() => setHover([rowIndex, colIndex])}
              >
                <i style={{ background: `color-mix(in oklab, var(--data) ${Math.round(14 + ratio * 86)}%, var(--card-3))` }} />
                {hover?.[0] === rowIndex && hover[1] === colIndex ? (
                  <span className="charttip">
                    <b>{format(value)}</b>
                    <small>{row} · {col}</small>
                  </span>
                ) : null}
              </span>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
