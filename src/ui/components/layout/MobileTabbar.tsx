import { quickRoutes, routeIcon } from '@/config/navigation';
import { routeMeta, type RouteKey } from '@/router';
import { Icon } from '@/ui/components/primitives';

export interface MobileTabbarProps {
  route: RouteKey;
  onMore: () => void;
}

export function MobileTabbar({ route, onMore }: MobileTabbarProps) {
  const active = quickRoutes.includes(route);

  return (
    <nav className="tabbar" aria-label="Quick">
      <span className="tabbar__pill" />
      {quickRoutes.map((id) => (
        <a key={id} data-id={id} href={`#/${id}`} aria-current={id === route ? 'page' : undefined}>
          <Icon name={routeIcon[id]} />
          <span>{routeMeta[id].label}</span>
        </a>
      ))}
      <button
        type="button"
        className="tabbar__more"
        aria-current={active ? undefined : 'page'}
        onClick={onMore}
      >
        <Icon name="more" />
        <span>More</span>
      </button>
    </nav>
  );
}
