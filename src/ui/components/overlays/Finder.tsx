import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { routeIcon } from '@/config/navigation';
import {
  useBootstrap, useConfig, useDocs, useProsState, useReviews,
} from '@/stores';
import { go, routeMeta, subMap, type RouteKey } from '@/router';
import { formatDate, initials } from '@/ui/data/format';
import type { ModalRequest, OpenModal } from '@/types';
import { Avatar, Icon, type IconName } from '@/ui/components/primitives';

const findRoutes: RouteKey[] = [
  'overview', 'insights', 'reviews', 'pros', 'clients', 'documents', 'inbox', 'settings', 'help',
];

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface FinderResult {
  id: string;
  group: string;
  title: string;
  sub: string;
  lead: ReactNode;
  run: () => void;
  alt?: { label: string; run: () => void };
}

export interface FinderProps {
  open: boolean;
  onClose: () => void;
  openModal?: OpenModal;
}

export function Finder({ open, onClose, openModal }: FinderProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const state = useBootstrap();
  const config = useConfig();
  const reviews = useReviews();
  const { pros } = useProsState();
  const { docs } = useDocs();
  const tradeLabels = config.pros.tradeLabels;
  const limits = config.finder.limits;
  const clientById = useMemo(
    () => new Map(state.clients.map((client) => [client.id, client])),
    [state.clients],
  );
  const proById = useMemo(() => new Map(pros.map((pro) => [pro.id, pro])), [pros]);

  const results = useMemo<FinderResult[]>(() => {
    const needle = query.trim().toLowerCase();
    const matches = (...parts: string[]) => !needle || parts.some((part) => part.toLowerCase().includes(needle));
    const iconLead = (name: IconName) => (
      <span className="finder__ico"><Icon name={name} /></span>
    );
    const personLead = (name: string, hue?: number) => (
      <Avatar initials={initials(name)} hue={hue} />
    );
    const found: FinderResult[] = [];

    pros
      .filter((pro) => matches(pro.name, tradeLabels[pro.trade] ?? pro.trade, pro.city))
      .slice(0, needle ? limits.prosPicked : limits.pros)
      .forEach((pro) => found.push({
        id: `p${pro.id}`,
        group: 'Pros',
        title: pro.name,
        sub: `${tradeLabels[pro.trade] ?? pro.trade} · ${pro.city}`,
        lead: personLead(pro.name, pro.hue),
        run: () => go(`pros/directory/${pro.id}`),
        alt: { label: 'Message', run: () => go('inbox') },
      }));

    if (needle) {
      reviews
        .filter((review) => matches(
          review.id,
          review.title,
          review.text,
          review.job,
          proById.get(review.pro)?.name ?? '',
          clientById.get(review.client)?.name ?? '',
        ))
        .slice(0, limits.reviews)
        .forEach((review) => found.push({
          id: `r${review.id}`,
          group: 'Reviews',
          title: `${review.id} · ${'★'.repeat(review.stars)} ${review.title}`,
          sub: `${clientById.get(review.client)?.name ?? ''} on ${proById.get(review.pro)?.name ?? ''} · ${formatDate(review.t)}`,
          lead: iconLead('star'),
          run: () => go(`reviews/${config.clients.reviewFolders[review.status] ?? 'flagged'}/${review.id}`),
        }));

      state.clients
        .filter((client) => matches(client.name, client.city, client.email))
        .slice(0, limits.clients)
        .forEach((client) => found.push({
          id: `c${client.id}`,
          group: 'Clients',
          title: client.name,
          sub: `${client.city} · ${client.email}`,
          lead: personLead(client.name, client.hue),
          run: () => go(`clients/${client.id}`),
          alt: { label: 'Ask for review', run: () => openModal?.({ kind: 'review', clientId: client.id }) },
        }));

      docs
        .filter((doc) => matches(doc.name, doc.folder))
        .slice(0, limits.documents)
        .forEach((doc) => found.push({
          id: `d${doc.id}`,
          group: 'Documents',
          title: doc.name,
          sub: `${doc.folder} · ${formatDate(doc.updated)}`,
          lead: iconLead(doc.kind === 'sheet' ? 'sheet' : doc.kind === 'image' ? 'image' : 'file'),
          run: () => go('documents/library'),
        }));
    }

    findRoutes.forEach((route) => {
      if (matches(routeMeta[route].label)) found.push({
        id: `g${route}`,
        group: 'Go to',
        title: routeMeta[route].label,
        sub: subMap[route]?.map((item) => item.label).join(' · ') ?? 'Page',
        lead: iconLead(routeIcon[route]),
        run: () => go(route),
      });
      if (needle) subMap[route]?.forEach((sub) => {
        if (matches(sub.label)) found.push({
          id: `g${route}${sub.id}`,
          group: 'Go to',
          title: `${routeMeta[route].label} › ${sub.label}`,
          sub: 'Page',
          lead: iconLead(routeIcon[route]),
          run: () => go(`${route}/${sub.id}`),
        });
      });
    });

    config.finder.actions.forEach(({ label, icon, modal }) => {
      if (matches(label)) found.push({
        id: `a${label}`,
        group: 'Actions',
        title: label,
        sub: 'Action',
        lead: iconLead(icon),
        run: () => openModal?.({ kind: modal } as ModalRequest),
      });
    });

    return found;
  }, [
    query, reviews, pros, docs, state.clients, config,
    tradeLabels, limits.pros, limits.prosPicked, limits.reviews, limits.clients, limits.documents,
    clientById, proById, openModal,
  ]);

  const requestClose = (action?: () => void) => {
    action?.();
    setClosing(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    previous.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setSelected(0);
    setClosing(false);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || reduce()) return;
    gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: .25 });
    gsap.fromTo(panel.current,
      { y: -18, scale: .97, opacity: 0 },
      {
        y: 0, scale: 1, opacity: 1, duration: .45, ease: 'back.out(1.6)',
        clearProps: 'transform,opacity',
      });
    input.current?.focus();
  }, [open]);

  useLayoutEffect(() => {
    if (!open || reduce() || !list.current) return;
    gsap.fromTo(
      [...list.current.querySelectorAll('.finder__item')].slice(0, 8),
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: .55, ease: 'power3.out', stagger: .02, clearProps: 'transform,opacity' },
    );
  }, [open, query]);

  useLayoutEffect(() => {
    if (!open) return;
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, selected]);

  useLayoutEffect(() => {
    if (!open || !closing) return;
    if (reduce()) {
      onCloseRef.current();
      previous.current?.focus?.({ preventScroll: true });
      return;
    }
    gsap.to(scrim.current, { opacity: 0, duration: .18 });
    gsap.to(panel.current, {
      y: -10, scale: .97, opacity: 0, duration: .18, ease: 'power2.in',
      onComplete: () => {
        onCloseRef.current();
        previous.current?.focus?.({ preventScroll: true });
      },
    });
  }, [open, closing]);

  if (!open) return null;

  let lastGroup = '';

  return (
    <>
      <div className="scrim" ref={scrim} style={{ zIndex: 74 }} onClick={() => requestClose()} />
      <div
        className="finder"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelected((value) => Math.min(results.length - 1, value + 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelected((value) => Math.max(0, value - 1));
          } else if (event.key === 'Enter') {
            event.preventDefault();
            const result = results[selected];
            if (result) requestClose(() => (event.shiftKey && result.alt ? result.alt.run : result.run)());
          } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            requestClose();
          }
        }}
      >
        <div className="finder__in">
          <Icon name="search" />
          <input
            ref={input}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setSelected(0); }}
            placeholder="Search reviews, pros, clients, documents…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="finder-list"
            aria-activedescendant={results[selected] ? `fh-${results[selected].id}` : undefined}
          />
          <span className="kbd">esc</span>
        </div>
        <div className="finder__list" id="finder-list" role="listbox" ref={list}>
          {!results.length ? (
            <div className="empty">
              <span className="empty__icon"><Icon name="search" size="lg" /></span>
              <b>Nothing for “{query}”</b>
              <p>Try a pro like Marcus, a job like boiler, or a review number like R-4810.</p>
            </div>
          ) : null}
          {results.map((result, index) => {
            const header = result.group === lastGroup ? null : result.group;
            lastGroup = result.group;
            return (
              <div key={result.id}>
                {header ? <div className="finder__group">{header}</div> : null}
                <div
                  id={`fh-${result.id}`}
                  role="option"
                  aria-selected={index === selected}
                  className="finder__item"
                  onPointerMove={() => setSelected(index)}
                  onClick={() => requestClose(result.run)}
                >
                  {result.lead}
                  <span className="cell__text"><b>{result.title}</b><small>{result.sub}</small></span>
                  {result.alt && index === selected ? (
                    <button
                      type="button"
                      className="btn btn--sm btn--primary"
                      onClick={(event) => { event.stopPropagation(); requestClose(result.alt?.run); }}
                    >
                      {result.alt.label}
                    </button>
                  ) : <Icon name="arrowR" />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="finder__foot">
          <span><span className="kbd">↑↓</span> move</span>
          <span><span className="kbd">↵</span> open</span>
          <span><span className="kbd">⇧↵</span> quick action</span>
        </div>
      </div>
    </>
  );
}
