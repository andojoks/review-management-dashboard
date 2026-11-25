import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return <section className={`card${className ? ` ${className}` : ''}`} {...props}>{children}</section>;
}
