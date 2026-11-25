import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { routeMeta, subLabel, type RouteKey } from '@/router';
import { useClock } from '@/hooks/useClock';
import { Icon } from '@/ui/components/primitives';

export interface TopBarProps {
  route: RouteKey;
  sub?: string;
  dark: boolean;
  unread: number;
  onMenu: () => void;
  onTheme: () => void;
  onNotifications: (anchor: HTMLElement) => void;
  onNew: (anchor: HTMLElement) => void;
}

export function TopBar({
  route,
  sub,
  dark,
  unread,
  onMenu,
  onTheme,
  onNotifications,
  onNew,
}: TopBarProps) {
  const clock = useClock();
  const badge = useRef<HTMLSpanElement>(null);
  const bell = useRef<HTMLButtonElement>(null);
  const previousUnread = useRef(unread);
  const subText = sub ? subLabel(route, sub) : undefined;

  useLayoutEffect(() => {
    const animated = unread > previousUnread.current
      && bell.current
      && badge.current
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (animated) {
      gsap.fromTo(
        bell.current!.querySelector('svg'),
        { rotation: 0 },
        {
          keyframes: { rotation: [0, 16, -14, 10, -6, 0] },
          duration: 0.8,
          ease: 'power2.out',
          transformOrigin: '50% 10%',
        },
      );
      gsap.fromTo(badge.current, { scale: 0.4 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
    }
    previousUnread.current = unread;
  }, [unread]);

  const onNewMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    gsap.to(event.currentTarget, {
      x: (event.clientX - (box.left + box.width / 2)) * 0.2,
      y: (event.clientY - (box.top + box.height / 2)) * 0.28,
      duration: 0.5,
      ease: 'power3.out',
    });
  };

  const onNewLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(event.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
  };

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
          {subText ? (
            <>
              <a href={`#/${route}`}>{routeMeta[route].label}</a>
              <Icon name="chevR" />
              <b>{subText}</b>
            </>
          ) : <b>{routeMeta[route].label}</b>}
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
            onMouseMove={onNewMove}
            onMouseLeave={onNewLeave}
          >
            <Icon name="plus" />
            <span className="d-only">New</span>
          </button>
        </div>
      </div>
    </header>
  );
}
