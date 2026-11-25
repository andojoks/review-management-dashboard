import { navGroups, routeMeta, type RouteKey } from '@/router';
import { routeIcon } from '@/config/navigation';
import { Avatar, Icon } from '@/ui/components/primitives';

export interface SidebarProps {
  route: RouteKey;
  rail: boolean;
  unread: number;
  reviewCount: number;
  onFinder: () => void;
  onAccount: (anchor: HTMLElement) => void;
  onRail: (next: boolean) => void;
}

export function Sidebar({ route, rail, unread, reviewCount, onFinder, onAccount, onRail }: SidebarProps) {
  return (
    <aside className="side" aria-label="Sidebar">
      <div className="side__head">
        <a className="brand" href="#/overview" aria-label="Raveno — Overview">
          <span className="mark"><Icon name="logo" /></span>
          <span className="brand__text"><b>Raveno</b><small>Review desk · Handwell</small></span>
        </a>
        <button
          type="button"
          className="collapse"
          aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={rail}
          aria-keyshortcuts="["
          data-tip={rail ? 'Expand  [' : 'Collapse  ['}
          onClick={() => onRail(!rail)}
        >
          <Icon name="panel" />
        </button>
      </div>
      <button
        type="button"
        className="side__search"
        onClick={onFinder}
        aria-label="Search"
        aria-keyshortcuts="Meta+K"
        data-tip={rail ? 'Search  ⌘K' : undefined}
      >
        <Icon name="search" />
        <span>Search reviews…</span>
        <span className="kbd">⌘K</span>
      </button>
      <nav className="snav" aria-label="Main">
        <span className="snav__pill" />
        {navGroups.map((group, index) => (
          <div className={`snav__group${index === navGroups.length - 1 ? ' snav__group--end' : ''}`} key={group.label}>
            <span className="side__group">{group.label}</span>
            {group.items.map((id) => {
              const count = id === 'inbox' ? unread : id === 'reviews' ? reviewCount : routeMeta[id].count || 0;
              return (
                <a
                  key={id}
                  className="snav__item"
                  data-id={id}
                  href={`#/${id}`}
                  aria-current={id === route ? 'page' : undefined}
                  aria-label={rail ? routeMeta[id].label : undefined}
                  data-tip={rail ? `${routeMeta[id].label}${count ? ` · ${count}` : ''}` : undefined}
                >
                  <Icon name={routeIcon[id]} />
                  <span className="snav__label">{routeMeta[id].label}</span>
                  {count > 0 ? <span className="snav__count">{count}</span> : null}
                </a>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="side__foot">
        <button
          type="button"
          className="side__me"
          onClick={(event) => onAccount(event.currentTarget)}
          aria-label="Odile Mensah — account"
          data-tip={rail ? 'Odile Mensah' : undefined}
        >
          <Avatar initials="OM" staff />
          <span className="cell__text"><b>Odile Mensah</b><small>Trust &amp; reviews lead</small></span>
          <Icon name="sort" size="sm" />
        </button>
        <p className="side__note"><b>© Raveno 2026</b> The review desk for Handwell’s pros and their clients.</p>
      </div>
    </aside>
  );
}
