import { navGroups, routeMeta, subMap, type RouteKey } from '@/router';
import { routeIcon } from '@/config/navigation';
import type { Notice } from '@/types';
import { Icon, Switch } from '@/ui/components/primitives';

export interface AllPagesProps {
  route: RouteKey;
  sub?: string;
  dark: boolean;
  notices: Notice[];
  inboxUnread: number;
  reviewCount: number;
  onToast: (message: string) => void;
  onTheme: (dark: boolean) => void;
}

const newActions: [string, string, string][] = [
  ['send', 'Ask for a review', 'Review request started'],
  ['userPlus', 'Invite a pro', 'Pro invitation ready'],
  ['upload', 'Upload document', 'Document draft created'],
];

export function AllPages({
  route,
  sub,
  dark,
  notices,
  inboxUnread,
  reviewCount,
  onToast,
  onTheme,
}: AllPagesProps) {
  return (
    <div className="allpages">
      <div className="allpages__new" role="group" aria-label="New">
        {newActions.map(([icon, label, message]) => (
          <button key={label} type="button" className="allpages__btn" onClick={() => onToast(message)}>
            <Icon name={icon as 'send' | 'userPlus' | 'upload'} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {navGroups.flatMap((group) => group.items).map((id) => (
        <section key={id} className={`allpages__area${id === route ? ' is-on' : ''}`}>
          <a className="allpages__head" href={`#/${id}`}>
            <span className="allpages__ico"><Icon name={routeIcon[id]} size="sm" /></span>
            <b>{routeMeta[id].label}</b>
            {(id === 'inbox' ? inboxUnread : id === 'reviews' ? reviewCount : routeMeta[id].count || 0) > 0 ? (
              <span className="snav__count">
                {id === 'inbox' ? inboxUnread : id === 'reviews' ? reviewCount : routeMeta[id].count}
              </span>
            ) : null}
          </a>
          {subMap[id] ? (
            <div className="allpages__subs">
              {subMap[id].map((item) => (
                <a
                  key={item.id}
                  href={`#/${id}/${item.id}`}
                  aria-current={id === route && item.id === sub ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </section>
      ))}
      <div className="allpages__theme">
        <span><Icon name="moon" size="sm" /> Dark mode</span>
        <Switch checked={dark} onChange={onTheme} label="Dark mode" />
      </div>
      <div className="sr">{notices.length} notifications</div>
    </div>
  );
}
