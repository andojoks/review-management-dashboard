import type { AnchorHTMLAttributes, ReactNode } from 'react';

export interface PillProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  tone?: 'default' | 'good' | 'bad' | 'warn' | 'info' | 'plain';
}

const tones: Record<PillProps['tone'] & string, string> = {
  default: '',
  good: ' pill--good',
  bad: ' pill--bad',
  warn: ' pill--warn',
  info: ' pill--info',
  plain: ' pill--plain',
};

export function Pill({ children, tone = 'default', className = '', ...props }: PillProps) {
  return <span className={`pill${tones[tone]}${className ? ` ${className}` : ''}`} {...props}>{children}</span>;
}
