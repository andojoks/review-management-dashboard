import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { noticeTime } from '@/ui/data/clock';
import type { Notice } from '@/types';
import { Icon } from '@/ui/components/primitives';
import { Popover } from './Popover';

export interface NotificationsMenuProps {
  anchor: HTMLElement | null;
  notices: Notice[];
  onMarkAll: () => void;
  onRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationsMenu({
  anchor,
  notices,
  onMarkAll,
  onRead,
  onClose,
}: NotificationsMenuProps) {
  const list = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!list.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      [...list.current.children],
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: 'power3.out',
        stagger: 0.04,
        delay: 0.08,
        clearProps: 'transform,opacity',
      },
    );
  }, []);

  return (
    <Popover anchor={anchor} align="end" label="Notifications" className="notices" onClose={onClose}>
      {(close) => (
        <>
          <div className="notices__head">
            <b>Notifications</b>
            {notices.some((notice) => !notice.read) ? (
              <button type="button" className="linkbtn" onClick={onMarkAll}>Mark all read</button>
            ) : null}
          </div>
          <div className="notices__list" ref={list}>
            {notices.slice(0, 10).map((notice) => (
              <button
                type="button"
                key={notice.id}
                className={`notice${notice.read ? '' : ' is-unread'}`}
                onClick={() => {
                  onRead(notice.id);
                  close();
                  if (notice.href) window.location.hash = notice.href;
                }}
              >
                <span className={`notice__ico tone--${notice.tone}`}><Icon name={notice.icon} /></span>
                <span className="notice__text">
                  <b>{notice.title}</b>
                  <p>{notice.body}</p>
                  <small>{noticeTime(notice.at)}</small>
                </span>
              </button>
            ))}
          </div>
          <a className="notices__all" href="#/settings/notifications" onClick={close}>
            Notification settings <Icon name="arrowR" size="sm" />
          </a>
        </>
      )}
    </Popover>
  );
}
