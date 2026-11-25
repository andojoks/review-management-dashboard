import type { CSSProperties } from 'react';

export interface AvatarProps {
  initials: string;
  staff?: boolean;
  online?: boolean;
  size?: 'sm' | 'lg' | 'xl';
  hue?: number;
}

export function Avatar({ initials, staff = false, online = false, size, hue }: AvatarProps) {
  const sizeClass = size ? ` av--${size}` : '';
  const style = hue === undefined ? undefined : ({ '--h': `var(--h${hue % 6})` } as CSSProperties);
  return (
    <span
      className={`av${staff ? ' av--staff' : ''}${sizeClass}`}
      aria-hidden="true"
      style={style}
    >
      {initials}
      {staff || online ? <i className={online || staff ? 'av__dot' : ''} /> : null}
    </span>
  );
}
