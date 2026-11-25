import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  inverse?: boolean;
  tone?: 'default' | 'good' | 'bad' | 'warn' | 'info' | 'plain';
  className?: string;
}

const tones: Record<BadgeProps['tone'] & string, string> = {
  default: '',
  good: ' badge--good',
  bad: ' badge--bad',
  warn: ' badge--warn',
  info: ' badge--info',
  plain: ' badge--plain',
};

export function Badge({ children, inverse = false, tone = 'default', className = '' }: BadgeProps) {
  return <span className={`badge${inverse ? ' badge--inv' : ''}${tones[tone]}${className ? ` ${className}` : ''}`}>{children}</span>;
}
