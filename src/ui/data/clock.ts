export const clockBase = new Date(2026, 10, 9, 10, 24, 0).getTime();
export const clockStart = Date.now();
export const dayStart = new Date(clockBase).setHours(0, 0, 0, 0);

/** The demo clock runs from a fixed Monday 10:24 base at real-time speed. */
export function sourceNow() {
  return clockBase + (Date.now() - clockStart);
}

export function clockParts() {
  const date = new Date(sourceNow());
  return {
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    day: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).split(',')[0],
  };
}

export function noticeTime(at: number) {
  const elapsed = sourceNow() - at;
  if (elapsed < 60_000) return 'just now';
  const minutes = Math.round(elapsed / 60_000);
  const hours = Math.round(elapsed / 3_600_000);
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24 && at >= dayStart) return `${hours} h ago`;
  const time = new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (at >= dayStart - 86_400_000) return `Yesterday, ${time}`;
  if (at >= dayStart - 6 * 86_400_000) return `${new Date(at).toLocaleDateString('en-US', { weekday: 'short' })}, ${time}`;
  return new Date(at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
