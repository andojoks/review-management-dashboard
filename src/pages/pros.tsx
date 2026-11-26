import { useMemo, useRef, useState } from 'react';
import { advancePro, togglePro, useProsState, type Mutation, type Pro } from '@/data/prosStore';
import { useReviews, type Review } from '@/data/reviewStore';
import { sourceSnapshot } from '@/data/source';
import { go } from '@/router';
import type { ToastOptions } from '@/ui/components/feedback';
import { formatDate, formatNumber, formatRelative, initials } from '@/ui/data/format';
import { Drawer } from '@/ui/components/overlays';
import {
  Avatar, Button, Card, Counter, Icon, PageHeader, Pill, Rating, SearchField,
  Segmented, SelectField, Stars, Steps, Tabs,
} from '@/ui/components';
import { iconPop, query, reveal, useFlip, usePageMotion } from '@/ui/motion/interactions';
import type { IconName } from '@/ui/components';

const tradeLabels: Record<string, string> = {
  electric: 'Electrician', carpentry: 'Carpenter', plumbing: 'Plumber', painting: 'Painter',
  tiling: 'Tiler', roofing: 'Roofer', garden: 'Gardener', locks: 'Locksmith',
};
const tradeIcons: Record<string, IconName> = {
  electric: 'bolt', carpentry: 'chair', plumbing: 'drop', painting: 'pen',
  tiling: 'grid', roofing: 'home', garden: 'leaf', locks: 'key',
};

const progressSteps = ['Applied', 'ID checked', 'Insured', 'Licence', 'Live'];
const laneSteps = progressSteps.slice(0, 4);
const actionLabels = ['Check photo ID', 'Check insurance', 'Check licence', 'Run background check'];
const twoDecimals = (value: number) => value.toFixed(2);

const reviewSub = (status: string) => status === 'new' ? 'inbox' : status === 'replied' ? 'published' : 'flagged';

function ProProfile({ pro, reviews }: { pro: Pro; reviews: Review[] }) {
  const rated = reviews.filter((review) => review.pro === pro.id)
    .filter((review) => review.status !== 'hidden')
    .sort((a, b) => b.t - a.t);
  const value = rated.reduce((sum, review) => sum + review.stars, 0) / (rated.length || 1);
  const mix = [5, 4, 3, 2, 1].map((stars) => rated.filter((review) => review.stars === stars).length);

  return (
    <>
      <div className="prof__head">
        <Avatar initials={initials(pro.name)} staff size="xl" hue={pro.hue} />
        <div>
          <div className="prof__rate"><b><Counter value={value} format={twoDecimals} /></b><Stars value={value} size={16} pop /></div>
          <small className="muted">{rated.length} public reviews · on Handwell since {formatDate(pro.joined, true)}</small>
        </div>
      </div>
      <p className="prof__bio">“{pro.bio}”</p>
      <div className="dstats">
        <div><small>Jobs</small><b>{formatNumber(pro.jobs)}</b></div>
        <div><small>Reply rate</small><b>{Math.round(pro.responseRate * 100)}%</b></div>
        <div><small>Status</small><b>{pro.status === 'live' ? 'Live' : pro.status === 'paused' ? 'Paused' : 'Onboarding'}</b></div>
      </div>
      <div className="section-label">Star mix</div>
      <ul className="prof__mix">
        {mix.map((count, index) => (
          <li key={index}>
            <span>{5 - index}★</span>
            <span className="prof__bar"><i style={{ transform: `scaleX(${rated.length ? count / rated.length : 0})` }} /></span>
            <b>{count}</b>
          </li>
        ))}
      </ul>
      <div className="section-label">Latest reviews</div>
      {rated.slice(0, 4).map((review) => (
        <a className="prof__rev" href={`#/reviews/${reviewSub(review.status)}/${review.id}`} key={review.id}>
          <span className="prof__revtop"><Stars value={review.stars} size={12} /><small>{sourceSnapshot.clients.find((client) => client.id === review.client)?.name} · {formatRelative(review.t)}</small></span>
          <b>{review.title}</b>
          <span>{review.text}</span>
        </a>
      ))}
      {!rated.length ? <p className="muted">No reviews yet — they arrive after the first finished job.</p> : null}
    </>
  );
}

export function Pros({ onToast, sub = 'directory', detailId }: { onToast: (message: string, options?: ToastOptions) => void; sub?: string; detailId?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const lanes = useRef<HTMLDivElement>(null);
  const { pros, verifications } = useProsState();
  const reviews = useReviews();
  const [search, setSearch] = useState('');
  const [trade, setTrade] = useState('all');
  const [status, setStatus] = useState('all');

  const prosById = useMemo(() => new Map(pros.map((pro) => [pro.id, pro])), [pros]);
  const capture = useFlip(grid, '.pcard', [search, trade, status, sub]);
  const change = (update: () => void) => { capture(); update(); };
  const captureLanes = useFlip(lanes, '.ob', [pros], {
    duration: .6, zIndex: 5, leaveDuration: .3, leaveScale: .9,
  });

  usePageMotion(root, (page) => {
    reveal(query(page, '.card, .pcard, .lane'), { stagger: .035 });
  }, [sub]);

  const list = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rated = (proId: string) => {
      const items = reviews.filter((review) => review.pro === proId && review.status !== 'hidden');
      return { count: items.length, value: items.reduce((sum, review) => sum + review.stars, 0) / (items.length || 1) };
    };
    return pros
      .filter((pro) => (trade === 'all' || pro.trade === trade) && (status === 'all' || pro.status === status))
      .filter((pro) => !term || [pro.name, pro.city, tradeLabels[pro.trade]].some((value) => value.toLowerCase().includes(term)))
      .map((pro) => ({ pro, ...rated(pro.id) }))
      .sort((a, b) => b.value - a.value || b.count - a.count);
  }, [pros, reviews, search, trade, status]);

  const onboarding = pros.filter((pro) => pro.status === 'onboarding');
  const selected = sub === 'directory' && detailId ? prosById.get(detailId) : undefined;

  const notify = (mutation: Mutation | null) => {
    if (!mutation) return;
    onToast(mutation.message, { warn: mutation.warn, undo: mutation.undo });
  };

  const advance = (id: string, button: HTMLElement | null) => {
    iconPop(button);
    captureLanes();
    notify(advancePro(id));
  };

  const tabs = (
    <Tabs
      active={sub}
      items={[
        { id: 'directory', label: 'Directory', href: '#/pros/directory' },
        { id: 'onboarding', label: 'Onboarding', href: '#/pros/onboarding', count: onboarding.length },
      ]}
    />
  );

  if (sub === 'onboarding') {
    return (
      <div className="page pros" ref={root}>
        <PageHeader
          title="Pros"
          description="Every tradesperson on Handwell — how they’re rated, and who is still being verified."
          actions={<Button variant="primary" className="magnetic" icon="userPlus" onClick={() => onToast('Invite sent')}>Invite a pro</Button>}
        />
        {tabs}
        <div className="lanes" ref={lanes}>
          {laneSteps.map((step, index) => {
            const items = onboarding.filter((pro) => pro.step === index);
            return (
              <section className="lane" aria-label={step} key={step}>
                <header className="lane__head"><span className="lane__n">{index + 1}</span><b>{step}</b><span className="badge">{items.length}</span></header>
                <div className="lane__list">
                  {items.map((pro) => {
                    const docs = verifications.filter((item) => item.pro === pro.id);
                    return (
                      <article className="ob" key={pro.id} data-flip-id={pro.id}>
                        <span className="cell"><Avatar initials={initials(pro.name)} staff hue={pro.hue} /><span className="cell__text"><b>{pro.name}</b><small>{tradeLabels[pro.trade]} · {pro.city}</small></span></span>
                        <Steps steps={progressSteps} at={pro.step} compact />
                        <small className="ob__docs"><Icon name="file" size="sm" /> {docs.filter((doc) => doc.status === 'approved').length} of {docs.length} documents approved</small>
                        <button type="button" className="btn btn--sm btn--primary btn--block" onClick={(event) => advance(pro.id, event.currentTarget)}><Icon name="check" /> {actionLabels[Math.min(pro.step, actionLabels.length - 1)]}</button>
                      </article>
                    );
                  })}
                  {!items.length ? <p className="lane__empty">Nobody at this step</p> : null}
                </div>
              </section>
            );
          })}
          <section className="lane lane--live" aria-label="Recently live">
            <header className="lane__head"><span className="lane__n"><Icon name="check" size="sm" /></span><b>Live</b><span className="badge">{pros.filter((pro) => pro.status !== 'onboarding').length}</span></header>
            <div className="lane__list">
              <Pill tone="good">Ready to take bookings</Pill>
              <p className="lane__empty">Approving the last document puts a pro live and sends them their welcome pack.</p>
              <button type="button" className="btn btn--sm" onClick={() => onToast('Invite sent')}><Icon name="userPlus" /> Invite another</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page pros" ref={root}>
      <PageHeader
        title="Pros"
        description="Every tradesperson on Handwell — how they’re rated, and who is still being verified."
        actions={<Button variant="primary" className="magnetic" icon="userPlus" onClick={() => onToast('Invite sent')}>Invite a pro</Button>}
      />
      {tabs}

      <div className="toolbar">
        <SearchField value={search} onChange={(value) => change(() => setSearch(value))} placeholder="Search name, trade or town" />
        <SelectField
          label="Trade"
          value={trade}
          onChange={(value) => change(() => setTrade(value))}
          options={[{ id: 'all', label: 'All trades' }, ...Object.entries(tradeLabels).map(([id, label]) => ({ id, label: `${label}s` }))]}
        />
        <span className="toolbar__spacer" />
        <Segmented label="Status" value={status} onChange={(value) => change(() => setStatus(value))} options={[
          { id: 'all', label: 'All' }, { id: 'live', label: 'Live' }, { id: 'onboarding', label: 'Onboarding' }, { id: 'paused', label: 'Paused' },
        ]} />
      </div>

      <div className="pgrid" ref={grid}>
        {list.map(({ pro, count, value }) => (
          <a className="pcard" href={`#/pros/directory/${pro.id}`} data-flip-id={pro.id} data-lift key={pro.id}>
            <span className="pcard__top">
              <Avatar initials={initials(pro.name)} staff size="lg" hue={pro.hue} />
              <span className={`pcard__status is-${pro.status}`}>{pro.status === 'live' ? 'Live' : pro.status === 'paused' ? 'Paused' : 'Onboarding'}</span>
            </span>
            <b className="pcard__name">{pro.name}</b>
            <small className="pcard__sub"><Icon name={tradeIcons[pro.trade] ?? 'wrench'} size="sm" /> {tradeLabels[pro.trade]} · {pro.city}</small>
            {count ? (
              <Rating value={value} count={count} size={13} className="pcard__rate" />
            ) : (
              <span className="pcard__rate"><small className="muted">No reviews yet</small></span>
            )}
            <span className="pcard__stats">
              <span><b>{formatNumber(pro.jobs)}</b>jobs</span>
              <span><b>{Math.round(pro.responseRate * 100)}%</b>replies</span>
              <span><b>{new Date(pro.joined).getFullYear()}</b>joined</span>
            </span>
          </a>
        ))}
      </div>
      {!list.length ? <Card><b>No pros match</b><p>Try another trade or clear the search.</p><Button onClick={() => { setSearch(''); setTrade('all'); setStatus('all'); }}>Clear filters</Button></Card> : null}

      {selected ? (
        <Drawer
          title={selected.name}
          sub={`${tradeLabels[selected.trade]} · ${selected.city}`}
          onClose={() => go('pros/directory')}
          foot={(close) => (
            <>
              {selected.status !== 'onboarding' ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => notify(togglePro(selected.id))}
                >
                  <Icon name={selected.status === 'paused' ? 'play' : 'pause'} />
                  {selected.status === 'paused' ? 'Resume bookings' : 'Pause bookings'}
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => { close(); go('pros/onboarding'); }}>See onboarding</button>
              )}
              <button type="button" className="btn btn--primary" onClick={() => { close(); onToast('Review request started'); }}>
                <Icon name="send" /> Ask for a review
              </button>
            </>
          )}
        >
          {() => <ProProfile pro={selected} reviews={reviews} />}
        </Drawer>
      ) : null}
    </div>
  );
}
