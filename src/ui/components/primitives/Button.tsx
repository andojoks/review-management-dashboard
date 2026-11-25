import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;
  icon?: IconName;
  variant?: 'default' | 'primary' | 'quiet';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, icon, variant = 'default', className = '', type = 'button', ...props },
  ref,
) {
  const variantClass = variant === 'primary' ? ' btn--primary' : variant === 'quiet' ? ' btn--quiet' : '';
  return (
    <button ref={ref} type={type} className={`btn${variantClass}${className ? ` ${className}` : ''}`} {...props}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
});
