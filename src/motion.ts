export const ease = 'cubic-bezier(.22, 1, .36, 1)';

export function stagger(index: number, base = 55) {
  return { '--delay': `${index * base}ms` } as React.CSSProperties;
}

export function splitWords(text: string) {
  return text.split(' ');
}
