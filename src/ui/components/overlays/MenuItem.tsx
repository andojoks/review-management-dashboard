import { Icon, type IconName } from '@/ui/components/primitives';

export interface MenuItemProps {
  icon: IconName;
  label: string;
  kbd?: string;
  danger?: boolean;
  onClick: () => void;
}

export function MenuItem({ icon, label, kbd, danger = false, onClick }: MenuItemProps) {
  return (
    <button type="button" className={`menu__item${danger ? ' menu__item--danger' : ''}`} onClick={onClick}>
      <Icon name={icon} />
      <span>{label}</span>
      {kbd ? <span className="kbd">{kbd}</span> : null}
    </button>
  );
}
