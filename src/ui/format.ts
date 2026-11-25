export function formatNumber(value: number) { return new Intl.NumberFormat('en-GB').format(value); }
export function formatRating(value: number) { return value.toFixed(value % 1 ? 2 : 2); }
export function initials(name: string) { return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(); }
