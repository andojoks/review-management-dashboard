import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { niceTicks, smoothPath, useAreaMotion } from '@/ui/motion/charts';

export interface ReputationChartProps {
  values?: number[];
  compare?: number[];
  labels?: string[];
  height?: number;
  format?: (value: number) => string;
  compareLabel?: string;
  valueLabel?: string;
  fromZero?: boolean;
  ceil?: number;
  ariaLabel?: string;
}

const defaultValues = [4.12, 4.16, 4.14, 4.19, 4.22, 4.25, 4.24, 4.28, 4.31, 4.3, 4.34, 4.44];
const defaultCompare = [3.72, 3.75, 3.79, 3.81, 3.85, 3.9, 3.92, 3.96, 3.94, 3.98, 4.01, 4.04];
const defaultLabels = ['Dec', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Nov'];
const defaultFormat = (value: number) => value.toFixed(2);

function pointsFor(values: number[], top: number, base: number, width: number, height: number) {
  return values.map((value, index) => [
    index / Math.max(1, values.length - 1) * width,
    height - 26 - (value - base) / (top - base || 1) * (height - 12 - 26),
  ] as [number, number]);
}

export function ReputationChart({
  values = defaultValues,
  compare = defaultCompare,
  labels = defaultLabels,
  height = 240,
  format = defaultFormat,
  compareLabel = 'Compare',
  valueLabel = 'Values',
  fromZero = true,
  ceil,
  ariaLabel,
}: ReputationChartProps) {
  const gradientId = `af${useId().replace(/:/g, '')}`;
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const fill = useRef<SVGPathElement>(null);
  const line = useRef<SVGPathElement>(null);
  const comparison = useRef<SVGPathElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  const maximum = ceil !== undefined ? ceil : (Math.max(...values, ...(compare ?? [])) * 1.1 || 1);
  const minimum = Math.min(...values, ...(compare ?? []));
  const step = niceTicks(Math.max(1e-12, maximum - minimum * .92))[1];
  const base = fromZero ? 0 : Math.max(0, Math.floor(minimum * .96 / step) * step);
  let ticks = fromZero ? niceTicks(maximum) : niceTicks(maximum - base).map((tick) => tick + base);
  if (ceil !== undefined) ticks = ticks.filter((tick, index) => index < 2 || tick <= ceil + 1e-9);
  const top = ticks[ticks.length - 1] || 1;

  const initialPath = smoothPath(pointsFor(values, top, base, width, height));
  const initialArea = `${initialPath} L${width},${height - 26} L0,${height - 26} Z`;
  const initialCompare = compare.length ? smoothPath(pointsFor(compare, top, base, width, height)) : '';

  useAreaMotion({ svg, fill, line, compare: comparison }, values, compare, top, base, width, height);

  useEffect(() => {
    const parent = svg.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(200, Math.round(entry.contentRect.width)));
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const onMove = useCallback((event: PointerEvent<SVGSVGElement>) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const index = Math.round((event.clientX - box.left) / box.width * (values.length - 1));
    setHover(Math.max(0, Math.min(values.length - 1, index)));
  }, [values.length]);

  const labelEvery = Math.ceil(values.length / Math.max(2, Math.floor(width / 70)));
  const cursorX = hover === null ? 0 : hover / Math.max(1, values.length - 1) * width;
  const cursorY = hover === null ? 0 : height - 26 - (values[hover] - base) / (top - base || 1) * (height - 12 - 26);

  return (
    <div className="area" ref={root} style={{ height }}>
      <div className="area__grid" style={{ top: 12, bottom: 26 }} aria-hidden="true">
        {ticks.slice().reverse().map((tick) => <div key={tick}><span>{format(tick)}</span></div>)}
      </div>
      <svg
        ref={svg}
        className="area__svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={ariaLabel ?? `${valueLabel} from ${labels[0]} to ${labels[labels.length - 1]}, peaking at ${format(Math.max(...values))}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--data)" stopOpacity=".26" />
            <stop offset="1" stopColor="var(--data)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="area__fill" ref={fill} fill={`url(#${gradientId})`} d={initialArea} />
        {compare.length ? <path className="area__cmp" ref={comparison} d={initialCompare} /> : null}
        <path className="area__line" ref={line} d={initialPath} />
        {hover !== null ? (
          <>
            <line className="area__cursor" x1={cursorX} x2={cursorX} y1={12} y2={height - 26} />
            <circle className="area__dot" cx={cursorX} cy={cursorY} r="5" />
          </>
        ) : null}
      </svg>
      <div className="area__x" aria-hidden="true">
        {labels.map((label, index) => (
          ((index % labelEvery === 0 && values.length - 1 - index >= labelEvery * .8) || index === values.length - 1)
            ? <span key={`${label}-${index}`} style={{ left: `${index / Math.max(1, values.length - 1) * 100}%` }}>{label}</span>
            : null
        ))}
      </div>
      {hover !== null ? (
        <span
          className="charttip"
          style={{ left: Math.max(60, Math.min(width - 60, cursorX)), top: Math.max(0, cursorY - 64) }}
        >
          <b>{format(values[hover] ?? 0)}</b>
          <small>{labels[hover]}</small>
          {compare.length ? <small>{compareLabel}: {format(compare[hover] ?? 0)}</small> : null}
        </span>
      ) : null}
    </div>
  );
}
