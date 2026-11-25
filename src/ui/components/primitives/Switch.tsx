export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function Switch({ checked, onChange, label, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      className={`switch${checked ? ' is-on' : ''}${className ? ` ${className}` : ''}`}
      aria-label={label}
      aria-checked={checked}
      role="switch"
      onClick={() => onChange(!checked)}
    />
  );
}
