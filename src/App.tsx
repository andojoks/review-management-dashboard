import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type LazyExoticComponent,
} from 'react';
import gsap from 'gsap';
import {
  go,
  navGroups,
  normalizeHash,
  routeMeta,
  routePosition,
  subMap,
  subLabel,
  type RouteKey,
} from './router';
import { Icon, type IconName } from './ui/icons';
import { Avatar } from './ui/kit';
import { placePill } from './ui/navPill';
import { refreshPills, isRail, setRail } from './ui/rail';
import { ViewTransition } from './ui/pageTransition';
import { Drawer } from './ui/drawer';
import { Overlay, initialNotices, type Notice, type OverlayKind, type ThemeChoice } from './ui/overlay';
import { Finder } from './finder';
import { clockParts, sourceNow } from './ui/clock';
import { startLiveFeed } from './ui/liveFeed';

type Toast = { id: number; message: string };

type PageProps = {
  onToast: (message: string) => void;
  sub?: string;
  detailId?: string;
  dark: boolean;
  onTheme: () => void;
};

function routePage(id: RouteKey, load: () => Promise<Record<string, ComponentType<PageProps>>>) {
  return lazy(() => load().then((module) => ({ default: module[id.charAt(0).toUpperCase() + id.slice(1)] })));
}

const pageModules: Record<RouteKey, LazyExoticComponent<ComponentType<PageProps>>> = {
  overview: routePage('overview', () => import('./pages/overview')),
  insights: routePage('insights', () => import('./pages/insights')),
  pros: routePage('pros', () => import('./pages/pros')),
  reviews: routePage('reviews', () => import('./pages/reviews')),
  clients: routePage('clients', () => import('./pages/clients')),
  documents: routePage('documents', () => import('./pages/documents')),
  inbox: routePage('inbox', () => import('./pages/inbox')),
  settings: routePage('settings', () => import('./pages/settings')),
  help: routePage('help', () => import('./pages/help')),
};

const iconFor: Record<RouteKey, IconName> = {
  overview: 'grid',
  insights: 'chart',
  reviews: 'star',
  pros: 'wrench',
  clients: 'users',
  documents: 'file',
  inbox: 'inbox',
  settings: 'gear',
  help: 'help',
};

const quick: RouteKey[] = ['overview', 'reviews', 'pros', 'inbox'];

function initialTheme(): ThemeChoice {
  try {
    const value = JSON.parse(localStorage.getItem('raveno:theme') || '"light"');
    return value === 'dark' || value === 'light' || value === 'system' ? value : 'light';
  } catch {
    return 'light';
  }
}

function resolvedTheme(choice: ThemeChoice) {
  return choice === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : choice;
}

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || '#/overview');
  useEffect(() => {
    const update = () => setHash(window.location.hash || '#/overview');
    window.addEventListener('hashchange', update);
    if (!window.location.hash) window.location.hash = '#/overview';
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return hash;
}

function Sidebar({
  route,
  rail,
  unread,
  reviewCount,
  onFinder,
  onAccount,
}: {
  route: RouteKey;
  rail: boolean;
  unread: number;
  reviewCount: number;
  onFinder: () => void;
  onAccount: (anchor: HTMLElement) => void;
}) {
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
          onClick={() => setRail(!rail)}
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
                  <Icon name={iconFor[id]} />
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

function TopBar({
  route,
  sub,
  dark,
  unread,
  onMenu,
  onTheme,
  onNotifications,
  onNew,
}: {
  route: RouteKey;
  sub?: string;
  dark: boolean;
  unread: number;
  onMenu: () => void;
  onTheme: () => void;
  onNotifications: (anchor: HTMLElement) => void;
  onNew: (anchor: HTMLElement) => void;
}) {
  const [clock, setClock] = useState(clockParts);
  const badge = useRef<HTMLSpanElement>(null);
  const bell = useRef<HTMLButtonElement>(null);
  const previousUnread = useRef(unread);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(clockParts()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    if (unread > previousUnread.current && bell.current && badge.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(bell.current.querySelector('svg'), { rotation: 0 }, {
        keyframes: { rotation: [0, 16, -14, 10, -6, 0] }, duration: 0.8, ease: 'power2.out', transformOrigin: '50% 10%',
      });
      gsap.fromTo(badge.current, { scale: 0.4 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
    }
    previousUnread.current = unread;
  }, [unread]);

  const subText = sub ? subLabel(route, sub) : undefined;
  return (
    <header className="top">
      <div className="top__in">
        <button type="button" className="ibtn ibtn--flat top__menu" aria-label="Open menu" onClick={onMenu}>
          <Icon name="menu" />
        </button>
        <a className="brand top__brand" href="#/overview" aria-label="Raveno — Overview">
          <span className="mark"><Icon name="logo" /></span>
        </a>
        <nav className="crumbs" aria-label="Breadcrumb">
          <span>Handwell</span>
          <Icon name="chevR" />
          {subText ? <>
            <a href={`#/${route}`}>{routeMeta[route].label}</a>
            <Icon name="chevR" />
            <b>{subText}</b>
          </> : <b>{routeMeta[route].label}</b>}
        </nav>
        <span className="top__title">{routeMeta[route].label}</span>
        <div className="tools">
          <span className="clockpill" title="Leeds time">
            <span className="clockpill__dot live" />
            {clock.time}
            <span className="clockpill__date"> · {clock.day}</span>
          </span>
          <button
            type="button"
            className="ibtn top__theme"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            data-tip={dark ? 'Light mode' : 'Dark mode'}
            onClick={onTheme}
          >
            <Icon name={dark ? 'sun' : 'moon'} />
          </button>
          <button
            type="button"
            className="ibtn"
            ref={bell}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            data-tip="Notifications"
            onClick={(event) => onNotifications(event.currentTarget)}
          >
            <Icon name="bell" />
            {unread > 0 ? <span className="ibtn__badge" ref={badge}>{unread}</span> : null}
          </button>
          <button
            type="button"
            className="btn btn--primary top__new magnetic"
            aria-haspopup="menu"
            aria-keyshortcuts="N"
            onClick={(event) => onNew(event.currentTarget)}
            onMouseMove={(event) => {
              if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
              const box = event.currentTarget.getBoundingClientRect();
              gsap.to(event.currentTarget, {
                x: (event.clientX - (box.left + box.width / 2)) * 0.2,
                y: (event.clientY - (box.top + box.height / 2)) * 0.28,
                duration: 0.5,
                ease: 'power3.out',
              });
            }}
            onMouseLeave={(event) => gsap.to(event.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' })}
          >
            <Icon name="plus" />
            <span className="d-only">New</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileTabbar({ route, onMore }: { route: RouteKey; onMore: () => void }) {
  const active = quick.includes(route);
  return (
    <nav className="tabbar" aria-label="Quick">
      <span className="tabbar__pill" />
      {quick.map((id) => (
        <a key={id} data-id={id} href={`#/${id}`} aria-current={id === route ? 'page' : undefined}>
          <Icon name={iconFor[id]} />
          <span>{routeMeta[id].label}</span>
        </a>
      ))}
      <button type="button" className="tabbar__more" aria-current={active ? undefined : 'page'} onClick={onMore}>
        <Icon name="more" />
        <span>More</span>
      </button>
    </nav>
  );
}

function AllPages({
  route,
  sub,
  dark,
  notices,
  inboxUnread,
  reviewCount,
  onToast,
  onTheme,
}: {
  route: RouteKey;
  sub?: string;
  dark: boolean;
  notices: Notice[];
  inboxUnread: number;
  reviewCount: number;
  onToast: (message: string) => void;
  onTheme: (dark: boolean) => void;
}) {
  return (
    <div className="allpages">
      <div className="allpages__new" role="group" aria-label="New">
        {([
          ['send', 'Ask for a review', 'Review request started'],
          ['userPlus', 'Invite a pro', 'Pro invitation ready'],
          ['upload', 'Upload document', 'Document draft created'],
        ] as [IconName, string, string][]).map(([icon, label, message]) => (
          <button key={label} type="button" className="allpages__btn" onClick={() => onToast(message)}>
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {navGroups.flatMap((group) => group.items).map((id) => (
        <section key={id} className={`allpages__area${id === route ? ' is-on' : ''}`}>
          <a className="allpages__head" href={`#/${id}`}>
            <span className="allpages__ico"><Icon name={iconFor[id]} size="sm" /></span>
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
                <a key={item.id} href={`#/${id}/${item.id}`} aria-current={id === route && item.id === sub ? 'page' : undefined}>
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </section>
      ))}
      <div className="allpages__theme">
        <span><Icon name="moon" size="sm" /> Dark mode</span>
        <button
          type="button"
          className={`switch${dark ? ' is-on' : ''}`}
          aria-label="Dark mode"
          aria-checked={dark}
          role="switch"
          onClick={() => onTheme(!dark)}
        />
      </div>
      <div className="sr">{notices.length} notifications</div>
    </div>
  );
}

function ShortcutModal({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ['⌘ K', 'Search reviews, pros, clients'],
    ['/', 'Search'],
    ['N', 'New…'],
    ['G then O', 'Overview'],
    ['G then I', 'Insights'],
    ['G then R', 'Reviews'],
    ['G then P', 'Pros'],
    ['G then C', 'Clients'],
    ['G then D', 'Documents'],
    ['G then M', 'Inbox'],
    ['[', 'Fold the sidebar'],
    ['Esc', 'Close'],
    ['?', 'This list'],
  ];
  return (
    <div className="modal-wrap" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal__head">
          <h2>Keyboard shortcuts</h2>
          <button type="button" className="ibtn ibtn--flat ibtn--sm" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="modal__body">
          <div className="keys">
            {rows.map(([keys, label]) => (
              <div className="row-set" key={keys}>
                <span className="row-set__text"><b>{label}</b></span>
                <span className="kbd">{keys}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignIn({ onEnter }: { onEnter: () => void }) {
  const card = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('odile@handwell.co');
  const [password, setPassword] = useState('five-stars-26');
  const [busy, setBusy] = useState(false);
  useLayoutEffect(() => {
    if (!card.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(card.current.children, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'expo.out', clearProps: 'transform,opacity',
    });
  }, []);
  return (
    <div className="signin" role="dialog" aria-modal="true" aria-label="Sign in to Raveno">
      <form
        className="signin__card"
        ref={card}
        onSubmit={(event) => {
          event.preventDefault();
          if (busy || !email.includes('@') || password.length < 4) return;
          setBusy(true);
          window.setTimeout(() => {
            if (!card.current) return;
            gsap.to(card.current, { scale: 0.96, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onEnter });
          }, 700);
        }}
      >
        <span className="mark mark--lg"><Icon name="logo" /></span>
        <h1>Sign in to Raveno</h1>
        <p>Handwell’s review desk. In this demo the details are filled in — press Sign in.</p>
        <label className="field"><span>Email</span><input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" /></label>
        <label className="field"><span>Password</span><input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
        <button type="submit" className="btn btn--primary btn--block" aria-busy={busy}>Sign in</button>
        <span className="signin__date">Monday, 9 November</span>
      </form>
    </div>
  );
}

export default function App() {
  const hash = useHash();
  const parsed = useMemo(() => normalizeHash(hash), [hash]);
  const route = parsed.route;
  const sub = parsed.sub;
  const detail = parsed.detail;
  const [rail, setRailState] = useState(isRail);
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>(initialTheme);
  const [signedIn, setSignedIn] = useState(true);
  const [overlay, setOverlay] = useState<{ kind: OverlayKind; anchor: HTMLElement | null }>({ kind: null, anchor: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [newReviewCount, setNewReviewCount] = useState(16);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tip, setTip] = useState<{ text: string; x: number; y: number; side: boolean } | null>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const gKeyAt = useRef(0);
  const toastId = useRef(0);
  const started = useRef(false);
  const previousHash = useRef({ route, sub });
  const dark = resolvedTheme(themeChoice) === 'dark';
  const noticeUnread = notices.filter((notice) => !notice.read).length;
  const inboxUnread = 4;

  const pushToast = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  }, []);

  useEffect(() => startLiveFeed((event, index) => {
    setNewReviewCount((count) => count + 1);
    setNotices((items) => [{
      id: `live-${Date.now()}-${index}`,
      icon: 'star',
      tone: 'good',
      title: `New ${event.stars}-star review`,
      body: event.body,
      at: sourceNow(),
      read: false,
      href: '#/reviews/inbox',
    }, ...items]);
  }), []);

  useEffect(() => {
    const canonical = `#/${route}${sub ? `/${sub}` : ''}${detail ? `/${detail}` : ''}`;
    if (hash !== canonical) window.location.hash = canonical;
  }, [hash, route, sub, detail]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('raveno:theme', JSON.stringify(themeChoice)); } catch { /* storage may be blocked */ }
  }, [themeChoice, dark]);

  useEffect(() => {
    const label = sub ? subLabel(route, sub) : undefined;
    document.title = `${label ? `${label} · ` : ''}${routeMeta[route].label} — Raveno`;
  }, [route, sub]);

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', drawerOpen || finderOpen || shortcutsOpen || !signedIn);
    return () => document.documentElement.classList.remove('is-locked');
  }, [drawerOpen, finderOpen, shortcutsOpen, signedIn]);

  useEffect(() => {
    const onScroll = () => document.querySelector('.top')?.classList.toggle('is-stuck', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width) return;
      const previous = width;
      width = window.innerWidth;
      const root = document.documentElement;
      if (width > 760 && width < 1280) root.classList.add('is-rail');
      else if (width <= 760) root.classList.remove('is-rail');
      else if (previous < 1280 && width >= 1280) {
        let saved = false;
        try { saved = localStorage.getItem('raveno:rail') === '1'; } catch { /* storage may be blocked */ }
        root.classList.toggle('is-rail', saved);
      }
      setRailState(isRail());
      refreshPills();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onPointer = (event: Event) => {
      const target = (event.target as HTMLElement | null)?.closest?.('.side [data-tip], .top [data-tip]') as HTMLElement | null;
      if (!target || window.innerWidth <= 760) return;
      const box = target.getBoundingClientRect();
      const side = !!target.closest('.side');
      setTip({
        text: target.dataset.tip || '',
        x: side ? box.right + 12 : box.left + box.width / 2,
        y: side ? box.top + box.height / 2 : box.bottom + 10,
        side,
      });
    };
    const clear = () => setTip(null);
    document.addEventListener('pointerover', onPointer);
    document.addEventListener('focusin', onPointer);
    document.addEventListener('pointerout', clear);
    document.addEventListener('focusout', clear);
    return () => {
      document.removeEventListener('pointerover', onPointer);
      document.removeEventListener('focusin', onPointer);
      document.removeEventListener('pointerout', clear);
      document.removeEventListener('focusout', clear);
    };
  }, []);

  useLayoutEffect(() => {
    if (!tip || !tipRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(tipRef.current, { opacity: 0, x: tip.side ? -4 : 0, y: tip.side ? 0 : -4 }, {
      opacity: 1, x: 0, y: 0, duration: 0.25, ease: 'power3.out',
    });
  }, [tip?.text]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setFinderOpen(true);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable]') || event.metaKey || event.ctrlKey || event.altKey || !signedIn) return;
      if (event.key === '/') {
        event.preventDefault();
        setFinderOpen(true);
      } else if (event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
      } else if (event.key === '[' && window.innerWidth >= 1280) {
        const next = !isRail();
        setRail(next);
        setRailState(next);
      } else if (event.key.toLowerCase() === 'g') {
        gKeyAt.current = performance.now();
      } else if (performance.now() - gKeyAt.current < 900) {
        const map: Record<string, RouteKey> = {
          o: 'overview', i: 'insights', r: 'reviews', p: 'pros', c: 'clients',
          d: 'documents', m: 'inbox', s: 'settings',
        };
        const destination = map[event.key.toLowerCase()];
        if (destination) {
          go(destination);
          gKeyAt.current = 0;
        }
      } else if (event.key.toLowerCase() === 'n') {
        const anchor = document.querySelector('.top__new') as HTMLElement | null;
        if (anchor?.offsetParent) openOverlay('new', anchor);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [signedIn]);

  useLayoutEffect(() => {
    if (!started.current) {
      started.current = true;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        document.documentElement.classList.add('is-started');
        return;
      }
      const mobile = window.innerWidth <= 760;
      const tl = gsap.timeline({ onComplete: () => document.documentElement.classList.add('is-started') });
      if (!mobile) {
        tl.fromTo('.side', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out', clearProps: 'transform,opacity' }, 0);
        tl.fromTo('.side__head > *, .side__search, .side__group, .snav__item, .side__foot > *', { opacity: 0, x: -10 }, {
          opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.025, clearProps: 'transform,opacity',
        }, 0.1);
        tl.fromTo('.snav__pill', { scaleX: 0.3, opacity: 0 }, {
          scaleX: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)', transformOrigin: '0 50%', clearProps: 'transform',
        }, 0.45);
      }
      tl.fromTo('.top__in > *', { y: -12, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity',
      }, 0.15);
      if (mobile) tl.fromTo('.tabbar', { y: 90 }, { y: 0, duration: 0.7, ease: 'expo.out', clearProps: 'transform' }, 0.2);
    }
  }, []);

  useEffect(() => {
    placePill(document.querySelector('.snav__pill') as HTMLElement, document.querySelector('.snav__item[aria-current="page"]') as HTMLElement, { animate: document.documentElement.classList.contains('is-started'), radius: 11 });
    placePill(document.querySelector('.tabbar__pill') as HTMLElement, document.querySelector('.tabbar [aria-current="page"]') as HTMLElement, { animate: document.documentElement.classList.contains('is-started'), radius: 12 });
  }, [route, sub, rail, themeChoice]);

  useEffect(() => {
    if (previousHash.current.route === route && previousHash.current.sub === sub) return;
    previousHash.current = { route, sub };
  }, [route, sub]);

  const openOverlay = (kind: OverlayKind, anchor?: HTMLElement | null) => {
    setOverlay((current) => current.kind === kind ? { kind: null, anchor: null } : { kind, anchor: anchor || null });
  };
  const toggleTheme = (next: boolean) => setThemeChoice(next ? 'dark' : 'light');
  const Page = pageModules[route];
  const transitionKey = `${route}:${sub || ''}`;

  return (
    <div className="app" ref={appRef}>
      <Sidebar
        route={route}
        rail={rail}
        unread={inboxUnread}
        reviewCount={newReviewCount}
        onFinder={() => setFinderOpen(true)}
        onAccount={(anchor) => openOverlay('account', anchor)}
      />
      <div className="main">
        <TopBar
          route={route}
          sub={sub}
          dark={dark}
          unread={noticeUnread}
          onMenu={() => setDrawerOpen(true)}
          onTheme={() => toggleTheme(!dark)}
          onNotifications={(anchor) => openOverlay('notifications', anchor)}
          onNew={(anchor) => openOverlay('new', anchor)}
        />
        <main className="content" id="main">
          <ViewTransition
            className="view"
            k={transitionKey}
            order={routePosition(route, sub)}
            onSwap={() => {
              if (document.documentElement.classList.contains('is-started')) window.scrollTo({ top: 0 });
            }}
          >
            <Suspense fallback={null}>
              <Page
                onToast={pushToast}
                sub={sub}
                detailId={detail}
                dark={dark}
                onTheme={() => toggleTheme(!dark)}
              />
            </Suspense>
          </ViewTransition>
        </main>
      </div>
      <MobileTabbar route={route} onMore={() => setDrawerOpen(true)} />
      <Overlay
        kind={overlay.kind}
        anchor={overlay.anchor}
        themeChoice={themeChoice}
        setThemeChoice={setThemeChoice}
        notices={notices}
        onMarkAll={() => setNotices((items) => items.map((item) => ({ ...item, read: true })))}
        onRead={(id) => setNotices((items) => items.map((item) => item.id === id ? { ...item, read: true } : item))}
        onClose={() => setOverlay({ kind: null, anchor: null })}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onToast={pushToast}
        onSignOut={() => {
          setSignedIn(false);
          pushToast('Welcome back, Odile');
        }}
      />
      {drawerOpen ? (
        <Drawer
          title="Raveno"
          sub="Handwell review desk · every page"
          onClose={() => setDrawerOpen(false)}
        >
          {(close) => <AllPages
            route={route}
            sub={sub}
            dark={dark}
            notices={notices}
            inboxUnread={inboxUnread}
            reviewCount={newReviewCount}
            onToast={(message) => { close(); pushToast(message); }}
            onTheme={(next) => toggleTheme(next)}
          />}
        </Drawer>
      ) : null}
      <Finder open={finderOpen} onClose={() => setFinderOpen(false)} />
      {shortcutsOpen ? <ShortcutModal onClose={() => setShortcutsOpen(false)} /> : null}
      {tip ? (
        <span
          ref={tipRef}
          className="tip"
          style={{ left: tip.x, top: tip.y, translate: tip.side ? '0 -50%' : '-50% 0' } as CSSProperties}
        >
          {tip.text}
        </span>
      ) : null}
      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id}>
            <Icon name="check" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      {!signedIn ? <SignIn onEnter={() => setSignedIn(true)} /> : null}
    </div>
  );
}
