import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { go, navGroups, routeMeta, subMap, type RouteKey } from './router';
import { Icon, type IconName } from './ui/icons';

type Result = { id: string; label: string; section: string; icon: IconName; href: string };

const routeIcon: Record<RouteKey, IconName> = {
  overview: 'grid', insights: 'chart', pros: 'wrench', reviews: 'star',
  clients: 'users', documents: 'file', inbox: 'inbox', settings: 'gear', help: 'help',
};

const allResults: Result[] = [
  ...navGroups.flatMap((group) => group.items.map((id) => ({
    id,
    label: routeMeta[id].label,
    section: group.label,
    icon: routeIcon[id],
    href: id,
  }))),
  ...Object.entries(subMap).flatMap(([route, subs]) => subs.map((sub) => ({
    id: `${route}/${sub.id}`,
    label: sub.label,
    section: `${routeMeta[route as RouteKey].label} · section`,
    icon: routeIcon[route as RouteKey],
    href: `${route}/${sub.id}`,
  }))),
];

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Finder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const close = () => setClosing(true);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return allResults.slice(0, 9);
    return allResults.filter((item) => `${item.label} ${item.section}`.toLowerCase().includes(needle)).slice(0, 12);
  }, [query]);

  useLayoutEffect(() => {
    if (!open) return;
    setQuery('');
    setSelected(0);
    setClosing(false);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !panel.current) return;
    if (reduce()) return;
    gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(panel.current, { opacity: 0, y: -14, scale: 0.98 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'expo.out', clearProps: 'transform,opacity',
    });
    gsap.fromTo(panel.current.querySelectorAll('.finder__item'), { opacity: 0, y: 8 }, {
      opacity: 1, y: 0, duration: 0.35, stagger: 0.025, delay: 0.05, ease: 'power3.out', clearProps: 'transform,opacity',
    });
    input.current?.focus();
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !closing) return;
    if (reduce()) {
      onClose();
      return;
    }
    gsap.to(scrim.current, { opacity: 0, duration: 0.2 });
    gsap.to(panel.current, { opacity: 0, y: -10, duration: 0.18, ease: 'power2.in', onComplete: onClose });
  }, [open, closing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelected((value) => Math.min(results.length - 1, value + 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelected((value) => Math.max(0, value - 1));
      } else if (event.key === 'Enter' && results[selected]) {
        event.preventDefault();
        go(results[selected].href);
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, selected]);

  if (!open) return null;
  return <>
    <div className="scrim" ref={scrim} onMouseDown={close} />
    <div className="finder" ref={panel} role="dialog" aria-modal="true" aria-label="Search the review desk">
      <div className="finder__in">
        <Icon name="search" />
        <input
          ref={input}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          placeholder="Search reviews, pros, clients…"
          aria-label="Search"
        />
        <span className="kbd">ESC</span>
      </div>
      <div className="finder__list">
        <div className="finder__group">Jump to</div>
        {results.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className="finder__item"
            aria-selected={index === selected}
            onMouseEnter={() => setSelected(index)}
            onClick={() => {
              go(item.href);
              close();
            }}
          >
            <span className="finder__ico"><Icon name={item.icon} /></span>
            <span className="cell__text"><b>{item.label}</b><small>{item.section}</small></span>
            <Icon name="arrowR" size="sm" />
          </button>
        ))}
        {!results.length ? <div className="empty"><b>Nothing found</b><p>Try a page or section name.</p></div> : null}
      </div>
      <div className="finder__foot">
        <span><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
        <span><span className="kbd">↵</span> open</span>
        <span><span className="kbd">esc</span> close</span>
      </div>
    </div>
  </>;
}
