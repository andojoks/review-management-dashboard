import { Icon } from './Icon';
import { Stars } from './Stars';

export interface RatingProps {
  value: number;
  count?: number;
  size?: number;
  pop?: boolean;
  format?: (value: number) => string;
  className?: string;
  /** Render the source's small star icon instead of the fractional star row. */
  icon?: boolean;
  /** Render the value as plain text instead of a bold value. */
  plainValue?: boolean;
  showValue?: boolean;
  label?: string;
}

/**
 * Source-style rating display. The wrapper classes are passed in so the same
 * primitive can render hero, card, table and detail ratings without pages
 * rebuilding the markup.
 */
export function Rating({
  value,
  count,
  size = 13,
  pop = false,
  format = (rating) => rating.toFixed(2),
  className = 'rating',
  icon = false,
  plainValue = false,
  showValue = true,
  label,
}: RatingProps) {
  const text = format(value);
  return (
    <span className={className}>
      {icon ? <Icon name="star" size="sm" /> : <Stars value={value} size={size} pop={pop} label={label} />}
      {showValue ? (plainValue ? <>{text}</> : <b>{text}</b>) : null}
      {count !== undefined ? <small>({count})</small> : null}
    </span>
  );
}
