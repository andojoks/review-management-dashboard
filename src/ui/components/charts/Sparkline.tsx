import { useRef } from 'react';
import { smoothPath, useSparkMotion } from '@/ui/motion/charts';

export interface SparklineProps {
  values?: number[];
  tone?: 'dark' | 'muted' | 'good';
  color?: string;
  w?: number;
  h?: number;
  area?: boolean;
  className?: string;
}

const fallbacks: Record<NonNullable<SparklineProps['tone']>, number[]> = {
  dark: [2, 3, 2, 6, 4, 8, 5, 9],
  muted: [3, 6, 4, 7, 5, 9, 6, 8],
  good: [2, 4, 3, 6, 5, 8, 7, 11],
};

function sparkPaths(values: number[], width: number, height: number) {
  const padding = 2;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => [
    padding + index / Math.max(1, values.length - 1) * (width - padding * 2),
    height - padding - (value - min) / span * (height - padding * 2),
  ] as [number, number]);
  const line = smoothPath(points);
  return {
    line,
    area: `${line} L${(width - padding).toFixed(1)},${height} L${padding},${height} Z`,
  };
}

export function Sparkline({
  values,
  tone = 'dark',
  color,
  w = 92,
  h = 30,
  area = true,
  className = '',
}: SparklineProps) {
  const line = useRef<SVGPathElement>(null);
  const source = values?.length ? values : fallbacks[tone];
  const { line: path, area: areaPath } = sparkPaths(source, w, h);
  useSparkMotion(line, path);

  return (
    <svg
      className={`spark${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={color ? { color } : undefined}
      aria-hidden="true"
    >
      {area ? <path className="spark__area" d={areaPath} /> : null}
      <path ref={line} d={path} />
    </svg>
  );
}
