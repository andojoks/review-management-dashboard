import type { CSSProperties } from 'react';
import { useConfig } from '@/stores';

export interface AvatarProps {
  initials: string;
  staff?: boolean;
  online?: boolean;
  size?: 'sm' | 'lg' | 'xl';
  hue?: number;
}

export function Avatar({ initials, staff = true, online = false, size, hue }: AvatarProps) {
  const config = useConfig();
  const sizeClass = size ? ` av--${size}` : '';
  const palette = config.palette.avatarHueVars;
  const style = hue === undefined ? undefined : ({ '--h': `var(${palette[hue % palette.length]})` } as CSSProperties);
  return (
    <span
      className={`av${staff ? ' av--staff' : ''}${sizeClass}`}
      aria-hidden="true"
      style={style}
    >
      {initials}
      {online ? <i className="av__dot" /> : null}
    </span>
  );
}
