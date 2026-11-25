import type { ReactNode } from 'react';

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="filterbar">{children}</div>;
}
