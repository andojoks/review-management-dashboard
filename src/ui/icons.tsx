import type { ReactNode } from 'react';

type IconName =
  | 'grid' | 'chart' | 'star' | 'wrench' | 'users' | 'file' | 'inbox' | 'gear' | 'help'
  | 'search' | 'chevron' | 'chevR' | 'moon' | 'sun' | 'monitor' | 'bell' | 'plus' | 'send'
  | 'reply' | 'menu' | 'panel' | 'close' | 'more' | 'download' | 'filter' | 'check' | 'clock'
  | 'alert' | 'image' | 'arrow' | 'arrowR' | 'back' | 'external' | 'logo' | 'link' | 'heart'
  | 'mail' | 'user' | 'userPlus' | 'upload' | 'logout' | 'sort' | 'chat' | 'trend'
  | 'refresh' | 'key' | 'dots' | 'spark';

const source: Partial<Record<IconName, string>> = {
  logo: '<path d="M5.5 4h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H11l-4.5 3.5V17h-1a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m12 7.2 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/>',
  chevR: '<path d="m9.5 6 6 6-6 6"/>',
  wrench: '<path d="M14.5 4.5a4.5 4.5 0 0 0-4.2 6.1l-6 6a1.8 1.8 0 0 0 2.6 2.6l6-6A4.5 4.5 0 0 0 19 7.6l-2.7 2.7-2.6-.6-.6-2.6Z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8l2 2.1 2.9-.4.7 2.8 2.6 1.4-1 2.8 1 2.8-2.6 1.4-.7 2.8-2.9-.4-2 2.1-2-2.1-2.9.4-.7-2.8-2.6-1.4 1-2.8-1-2.8 2.6-1.4.7-2.8 2.9.4Z"/>',
  sort: '<path d="M8 4v16M4.5 7.5 8 4l3.5 3.5M16 20V4M12.5 16.5 16 20l3.5-3.5"/>',
  monitor: '<rect x="3" y="4.5" width="18" height="12" rx="2.5"/><path d="M8.5 20h7M12 16.5V20"/>',
  logout: '<path d="M14 4.5h4.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H14M10 16.5 5.5 12 10 7.5M5.5 12h10"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6"/>',
  userPlus: '<circle cx="10" cy="8.5" r="3.8"/><path d="M3 20c.8-3.8 3.4-6 7-6 1.7 0 3.2.5 4.3 1.4M18 13v6M15 16h6"/>',
  upload: '<path d="M12 15.5V4M7 8.5l5-5 5 5M5 14.5v3.5A2 2 0 0 0 7 20h10a2 2 0 0 0 2-2v-3.5"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  reply: '<path d="M9.5 6.5 4 12l5.5 5.5"/><path d="M4.5 12h9a6 6 0 0 1 6 6v.5"/>',
  send: '<path d="M20.5 3.5 3.5 10.6l6.6 2.8 2.8 6.6z"/><path d="m10.1 13.4 4.2-4.2"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15M16 10l-2 2 2 2"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-8.5 8.5"/>',
  arrow: '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chat: '<path d="M4 5.5h16v11H9l-5 4z"/>',
  trend: '<path d="M3.5 17.5 9 12l3.5 3.5L20 8"/><path d="M15.5 8H20v4.5"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  chart: '<path d="M4.5 19.5h15"/><path d="M7.5 16v-4.5M12 16V7.5M16.5 16v-6.5"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.8c1.8.6 3 2.2 3.5 4.7"/>',
  file: '<path d="M6.5 3.5h7l4 4v12a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"/><path d="M13.5 3.5v4h4M9 12h6M9 15.5h6"/>',
  inbox: '<path d="M3.5 13.5 6 5.5h12l2.5 8V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z"/><path d="M3.5 13.5h5l1 2h5l1-2h5"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
  download: '<path d="M12 4v11.5M7 10.5l5 5 5-5M5 20h14"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  external: '<path d="M13 5h6v6M19 5l-8 8"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  link: '<path d="M10 13.5a4.5 4.5 0 0 0 6.4.1l1.4-1.4a4.5 4.5 0 0 0-6.4-6.4l-.8.8"/><path d="M14 10.5a4.5 4.5 0 0 0-6.4-.1l-1.4 1.4a4.5 4.5 0 0 0 6.4 6.4l.8-.8"/>',
  heart: '<path d="M20 8.8c0 5-8 10-8 10s-8-5-8-10a4.5 4.5 0 0 1 8-2.6A4.5 4.5 0 0 1 20 8.8Z"/>',
  key: '<path d="M14.5 4.5a4.5 4.5 0 0 0-4.2 6.1l-6 6a1.8 1.8 0 0 0 2.6 2.6l6-6A4.5 4.5 0 0 0 19 7.6l-2.7 2.7-2.6-.6-.6-2.6Z"/>',
  dots: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  spark: '<path d="m12 3 1.1 6.9L19 12l-5.9 2.1L12 21l-1.1-6.9L5 12l5.9-2.1Z"/><path d="m19 3 .35 1.65L21 5l-1.65.35L19 7l-.35-1.65L17 5l1.65-.35Z"/>',
};

const fallback: Record<IconName, ReactNode> = {
  logo: <path d="M5.5 4h13v16H5.5z" />, chevron: <path d="m9.5 6 6 6-6 6" />,
  grid: <rect x="4" y="4" width="16" height="16" rx="2" />, chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />,
  wrench: <path d="M14 5a4 4 0 0 0-5 5l-5 5 4 4 5-5a4 4 0 0 0 5-5l-3 3-3-1-1-3z" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>,
  inbox: <><path d="M3 13 6 5h12l3 8v6H3z" /><path d="M3 13h5l1 2h6l1-2h5" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3v1.2M12 17h.01" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  chevR: <path d="m9 5 7 7-7 7" />, moon: <path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" /></>,
  monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  bell: <><path d="M6 17v-5a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
  plus: <path d="M12 5v14M5 12h14" />, send: <path d="M21 3 3 11l7 2 2 7z" />, reply: <path d="M9 6 4 12l5 6M5 12h9a6 6 0 0 1 6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />, panel: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M9 5v14" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />, more: <><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>,
  download: <path d="M12 3v12M7 11l5 5 5-5M5 21h14" />, filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  check: <path d="m5 12 5 5L20 7" />, clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  alert: <path d="M12 4 2 20h20z" />, image: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m5 18 5-5 3 3 2-2 4 4" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />, arrowR: <path d="M5 12h14M13 6l6 6-6 6" />, back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  external: <><path d="M14 4h6v6M20 4l-8 8" /><path d="M18 14v5H5V6h5" /></>, link: <path d="M9 15l6-6" />, heart: <path d="M12 20S4 15 4 9a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6 8 6 8-6" /></>, user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  userPlus: <><circle cx="10" cy="8" r="4" /><path d="M3 21c0-4 3-6 7-6M18 13v6M15 16h6" /></>, upload: <path d="M12 16V4M7 9l5-5 5 5M5 15v4h14v-4" />,
  logout: <path d="M14 5h5v14h-5M10 16l-4-4 4-4M6 12h9" />, sort: <path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />, trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />, refresh: <path d="M20 12a8 8 0 1 1-3-6M20 4v5h-5" />,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l2 2" /></>, dots: <><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>,
  spark: <path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />,
};

export function Icon({ name, size, className = '' }: { name: IconName; size?: number | 'sm' | 'lg'; className?: string }) {
  const sizeClass = typeof size === 'string' ? ` ico--${size}` : '';
  const common = { className: `ico${sizeClass}${className ? ` ${className}` : ''}`, viewBox: '0 0 24 24', width: typeof size === 'number' ? size : undefined, height: typeof size === 'number' ? size : undefined, 'aria-hidden': true } as const;
  const markup = source[name];
  if (markup) return <svg {...common} dangerouslySetInnerHTML={{ __html: markup }} />;
  return <svg {...common}>{fallback[name]}</svg>;
}

export type { IconName };
