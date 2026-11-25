const baseTime = new Date(2026, 10, 9, 10, 24, 0).getTime();

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-GB').format(Math.round(value));
}

export function formatRating(value: number) {
  return value.toFixed(2);
}

export function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export function shortName(name: string) {
  return name.split(' ')[0];
}

export function formatMoney(value: number) {
  return `$${formatNumber(value)}`;
}

export function formatDate(time: number, withYear = false) {
  return new Date(time).toLocaleDateString('en-US', withYear
    ? { month: 'short', day: 'numeric', year: 'numeric' }
    : { month: 'short', day: 'numeric' });
}

export function formatTime(time: number) {
  return new Date(time).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
}

export function formatMessageTime(time: number) {
  const relative = formatRelative(time);
  if (!relative.includes('ago')) return relative;
  const clock = new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${relative} · ${clock}`;
}

export function formatDateTime(time: number) {
  return new Date(time).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function formatRelative(time: number) {
  const minutes = Math.max(0, Math.round((baseTime - time) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 12) return `${hours} h ago`;
  return formatDocDate(time);
}

export function formatDocDate(time: number) {
  const date = new Date(time);
  const day = new Date(baseTime);
  const startOfToday = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const startOfDoc = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfToday - startOfDoc) / 86400000);
  const clock = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (days <= 0) return clock;
  if (days === 1) return `Yesterday, ${clock}`;
  if (days < 7) return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${clock}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMonth(time: number) {
  return new Date(time).toLocaleDateString('en-US', { month: 'short' });
}
