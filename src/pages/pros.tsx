import { useMemo, useRef, useState } from 'react';
import { sourceSnapshot } from '@/data/source';
import { formatDate, formatNumber, initials, shortName } from '@/ui/data/format';
import {
  Avatar, Button, Card, Counter, Icon, PageHeader, Pill, Rating, SearchField,
  Segmented, SelectField, Stars, Tabs,
} from '@/ui/components';
import { query, reveal, useFlip, usePageMotion } from '@/ui/motion/interactions';
import type { IconName } from '@/ui/components';

const tradeLabels: Record<string, string> = {
  electric: 'Electrician', carpentry: 'Carpenter', plumbing: 'Plumber', painting: 'Painter',
  tiling: 'Tiler', roofing: 'Roofer', garden: 'Gardener', locks: 'Locksmith',
};
const tradeIcons: Record<string, IconName> = {
  electric: 'wrench', carpentry: 'wrench', plumbing: 'wrench', painting: 'spark',
  tiling: 'grid', roofing: 'grid', garden: 'heart', locks: 'key',
};

const prosById = new Map(sourceSnapshot.pros.map((pro) => [pro.id, pro]));
const onboardingSteps = ['Check photo ID', 'Check insurance', 'Check licence', 'Run background check'];
const twoDecimals = (value: number) => value.toFixed(2);

function ratingFor(proId: string) {
  const rated = sourceSnapshot.reviews.filter((review) => review.pro === proId && review.status !== 'hidden');
  return { count: rated.length, value: rated.reduce((sum, review) => sum + review.stars, 0) / (rated.length || 1) };
}

export function Pros({ onToast, sub = 'directory', detailId }: { onToast: (message: string) => void; sub?: string; detailId?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [trade, setTrade] = useState('all');
  const [status, setStatus] = useState('all');

  const capture = useFlip(grid, '.pcard', [search, trade, status, sub]);
  const change = (update: () => void) => { capture(); update(); };

  usePageMotion(root, (page) => {
    reveal(query(page, '.card, .pcard, .lane'), { stagger: .035 });
  }, [sub]);

  const list = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sourceSnapshot.pros
      .filter((pro) => (trade === 'all' || pro.trade === trade) && (status === 'all' || pro.status === status))
      .filter((pro) => !term || [pro.name, pro.city, tradeLabels[pro.trade]].some((value) => value.toLowerCase().includes(term)))
      .map((pro) => ({ pro, ...ratingFor(pro.id) }))
      .sort((a, b) => b.value - a.value || b.count - a.count);
  }, [search, trade, status]);

  const onboarding = sourceSnapshot.pros.filter((pro) => pro.status === 'onboarding');
  const selected = detailId ? prosById.get(detailId) : undefined;

  if (sub === 'onboarding') {
    return (
      <div className="page pros" ref={root}>
        <PageHeader
          title="Pros"
          description="Every tradesperson on Handwell — how they’re rated, and who is still being verified."
          actions={<Button variant="primary" className="magnetic" icon="userPlus" onClick={() => onToast('Invite sent')}>Invite a pro</Button>}
        />
        <Tabs
          active={sub}
          items={[
            { id: 'directory', label: 'Directory', href: '#/pros/directory' },
            { id: 'onboarding', label: 'Onboarding', href: '#/pros/onboarding', count: onboarding.length },
          ]}
        />
        <div className="lanes">
          {onboardingSteps.map((step, index) => {
            const items = onboarding.filter((pro) => pro.step === index);
            return (
              <section className="lane" aria-label={step} key={step}>
                <header className="lane__head"><span className="lane__n">{index + 1}</span><b>{step}</b><span className="badge">{items.length}</span></header>
                <div className="lane__list">
                  {items.map((pro) => {
                    const docs = sourceSnapshot.verifications.filter((item) => item.pro === pro.id);
                    return (
                      <article className="ob" key={pro.id}>
                        <span className="cell"><Avatar initials={initials(pro.name)} hue={pro.hue} /><span className="cell__text"><b>{pro.name}</b><small>{tradeLabels[pro.trade]} · {pro.city}</small></span></span>
                        <div className="steps"><i className="is-on" /><i /><i /><i /></div>
                        <small className="ob__docs"><Icon name="file" size={14} /> {docs.filter((doc) => doc.status === 'approved').length} of {docs.length} documents approved</small>
                        <Button variant="primary" icon="check" onClick={() => onToast(`${step} completed for ${shortName(pro.name)}`)}>{step}</Button>
                      </article>
                    );
                  })}
                  {!items.length ? <p className="lane__empty">Nobody at this step</p> : null}
                </div>
              </section>
            );
          })}
          <section className="lane lane--live" aria-label="Recently live">
            <header className="lane__head"><span className="lane__n"><Icon name="check" size={14} /></span><b>Live</b><span className="badge">{sourceSnapshot.pros.filter((pro) => pro.status !== 'onboarding').length}</span></header>
            <div className="lane__list">
              <Pill tone="good">Ready to take bookings</Pill>
              <p className="lane__empty">Approving the last document puts a pro live and sends them their welcome pack.</p>
              <Button icon="userPlus" onClick={() => onToast('Invite sent')}>Invite another</Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page pros">
      <PageHeader
        title="Pros"
        description="Every tradesperson on Handwell — how they’re rated, and who is still being verified."
        actions={<Button variant="primary" className="magnetic" icon="userPlus" onClick={() => onToast('Invite sent')}>Invite a pro</Button>}
      />
      <Tabs
        active={sub}
        items={[
          { id: 'directory', label: 'Directory', href: '#/pros/directory' },
          { id: 'onboarding', label: 'Onboarding', href: '#/pros/onboarding', count: onboarding.length },
        ]}
      />

      {selected ? (
        <Card className="prof">
          <div className="prof__head">
            <Avatar initials={initials(selected.name)} size="xl" hue={selected.hue} />
            <div>
              <div className="prof__rate"><b><Counter value={ratingFor(selected.id).value} format={twoDecimals} /></b><Stars value={ratingFor(selected.id).value} size={16} /></div>
              <small className="muted">{ratingFor(selected.id).count} public reviews · on Handwell since {formatDate(selected.joined, true)}</small>
            </div>
          </div>
          <p className="prof__bio">“{selected.bio}”</p>
          <div className="dstats">
            <div><small>Jobs</small><b>{formatNumber(selected.jobs)}</b></div>
            <div><small>Reply rate</small><b>{Math.round(selected.responseRate * 100)}%</b></div>
            <div><small>Status</small><b>{selected.status === 'live' ? 'Live' : selected.status === 'paused' ? 'Paused' : 'Onboarding'}</b></div>
          </div>
          <a className="linkbtn" href="#/pros/directory">Back to directory</a>
        </Card>
      ) : null}

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
              <Avatar initials={initials(pro.name)} size="lg" hue={pro.hue} />
              <span className={`pcard__status is-${pro.status}`}>{pro.status === 'live' ? 'Live' : pro.status === 'paused' ? 'Paused' : 'Onboarding'}</span>
            </span>
            <b className="pcard__name">{pro.name}</b>
            <small className="pcard__sub"><Icon name={tradeIcons[pro.trade] ?? 'wrench'} size={14} /> {tradeLabels[pro.trade]} · {pro.city}</small>
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
    </div>
  );
}
