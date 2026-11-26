import { useMemo, useRef, useState } from 'react';
import { useReviews, type Review } from '@/data/reviewStore';
import { sourceSnapshot } from '@/data/source';
import { go } from '@/router';
import {
  formatDate, formatMoney, formatNumber, formatRelative, initials, plural,
} from '@/ui/data/format';
import {
  Avatar, Button, Card, Chip, Counter, DataTable, Drawer, Empty, Icon, PageHeader,
  Pill, SearchField, Stars,
} from '@/ui/components';
import { query, reveal, rise, usePageMotion } from '@/ui/motion/interactions';

const statusTone = { active: 'good', new: 'info', quiet: 'plain' } as const;
const percent = (value: number) => `${Math.round(value * 100)}%`;
const clientById = new Map(sourceSnapshot.clients.map((client) => [client.id, client]));
const proById = new Map(sourceSnapshot.pros.map((pro) => [pro.id, pro]));

const reviewFolder = (review: Review) =>
  review.status === 'new' ? 'inbox' : review.status === 'replied' ? 'published' : 'flagged';

function ClientDetail({ id }: { id: string }) {
  const reviews = useReviews();
  const client = clientById.get(id);
  if (!client) return null;
  const list = reviews.filter((review) => review.client === id).sort((a, b) => b.t - a.t);

  return (
    <>
      <div className="cl__head">
        <Avatar initials={initials(client.name)} size="xl" hue={client.hue} />
        <div>
          <b>{client.email}</b>
          <small className="muted">{plural(client.jobs, 'job')} · {formatMoney(client.spend)} booked</small>
        </div>
      </div>
      <div className="section-label">{plural(list.length, 'review')}</div>
      {list.map((review) => (
        <a
          className="prof__rev"
          href={`#/reviews/${reviewFolder(review)}/${review.id}`}
          key={review.id}
        >
          <span className="prof__revtop">
            <Stars value={review.stars} size={12} />
            <small>{proById.get(review.pro)?.name ?? 'Pro'} · {formatRelative(review.t)}</small>
          </span>
          <b>{review.title}</b>
          <span>{review.text}</span>
        </a>
      ))}
      {!list.length ? (
        <Empty icon="star" title="No reviews yet" body="Send a short link — most clients answer within a day." />
      ) : null}
    </>
  );
}

export function Clients({
  onToast, detailId, openModal,
}: {
  onToast: (message: string) => void;
  detailId?: string;
  openModal?: (request: { kind: 'review'; clientId?: string }) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reviews = useReviews();
  const [queryText, setQueryText] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<{ key: string; direction: number }>({ key: 'spend', direction: -1 });

  usePageMotion(root, (page) => {
    reveal(query(page, '.card, .kpi'), { stagger: .05 });
    rise(query(page, 'tbody tr').slice(0, 14), { delay: .25, stagger: .025 });
  }, []);

  const reviewsFor = (clientId: string) => reviews.filter((review) => review.client === clientId);

  const rows = useMemo(() => {
    const term = queryText.trim().toLowerCase();
    return sourceSnapshot.clients
      .filter((client) => (status === 'all' || client.status === status))
      .filter((client) => !term || [client.name, client.city, client.email].some((value) => value.toLowerCase().includes(term)))
      .map((client) => ({ client, reviews: reviewsFor(client.id) }))
      .sort((a, b) => {
        const value = (entry: typeof a) => {
          if (sort.key === 'name') return entry.client.name;
          if (sort.key === 'reviews') return entry.reviews.length;
          if (sort.key === 'joined') return entry.client.joined;
          return entry.client[sort.key as 'jobs' | 'spend'];
        };
        const left = value(a); const right = value(b);
        return (typeof left === 'string' ? left.localeCompare(right as string) : left - (right as number)) * sort.direction;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryText, status, sort, reviews]);

  const selected = detailId ? clientById.get(detailId) : undefined;
  const totalSpend = sourceSnapshot.clients.reduce((sum, client) => sum + client.spend, 0);
  const withReview = sourceSnapshot.clients.filter((client) => reviewsFor(client.id).length).length;
  const statusCount = (value: string) => sourceSnapshot.clients.filter((client) => client.status === value).length;

  const onSort = (key: string) => setSort((current) => ({
    key,
    direction: current.key === key ? -current.direction : key === 'name' ? 1 : -1,
  }));

  return (
    <div className="page cl" ref={root}>
      <PageHeader
        title="Clients"
        description="Households who book through Handwell and the reviews they leave."
        actions={
          <>
            <Button icon="download" onClick={() => onToast('clients.csv downloaded')}>Export</Button>
            <Button
              variant="primary"
              className="magnetic"
              icon="send"
              onClick={() => openModal?.({ kind: 'review' })}
            >Ask for a review</Button>
          </>
        }
      />

      <div className="kpis cl__kpis">
        <div className="kpi">
          <span className="kpi__label">Clients</span>
          <span className="kpi__value"><Counter value={sourceSnapshot.clients.length} format={formatNumber} /></span>
          <span className="kpi__foot">{statusCount('new')} joined this month</span>
        </div>
        <div className="kpi">
          <span className="kpi__label">Booked through Handwell</span>
          <span className="kpi__value"><Counter value={totalSpend} format={formatMoney} /></span>
          <span className="kpi__foot">since they joined</span>
        </div>
        <div className="kpi">
          <span className="kpi__label">Leave a review</span>
          <span className="kpi__value"><Counter value={withReview / sourceSnapshot.clients.length} format={percent} /></span>
          <span className="kpi__foot">at least once</span>
        </div>
        <div className="kpi">
          <span className="kpi__label">Gone quiet</span>
          <span className="kpi__value"><Counter value={statusCount('quiet')} format={formatNumber} /></span>
          <span className="kpi__foot">no booking in 6 months</span>
        </div>
      </div>

      <Card className="card--flush">
        <div className="toolbar cl__tools">
          <SearchField value={queryText} onChange={setQueryText} placeholder="Search name, town or email" />
          <div className="chips" role="group" aria-label="Status">
            {['all', 'active', 'new', 'quiet'].map((value) => (
              <Chip key={value} active={status === value} onClick={() => setStatus(value)}>
                {value === 'all' ? 'All' : value[0].toUpperCase() + value.slice(1)}
                <span className="badge">{value === 'all' ? sourceSnapshot.clients.length : statusCount(value)}</span>
              </Chip>
            ))}
          </div>
        </div>
        <DataTable
          className="table--stack"
          rows={rows}
          rowKey={(_, index) => rows[index].client.id}
          sort={sort}
          onSort={onSort}
          onRowClick={(row) => { go(`clients/${row.client.id}`); }}
          empty={<Empty title="No clients match" body="Clear the search or choose another status." action={<Button onClick={() => { setQueryText(''); setStatus('all'); }}>Clear filters</Button>} />}
          columns={[
            { key: 'name', header: 'Client', headerClassName: '', className: 'm-main', sortKey: 'name', sortable: true, render: ({ client }) => (
              <span className="cell"><Avatar initials={initials(client.name)} hue={client.hue} /><span className="cell__text"><b>{client.name}</b><small>{client.email}</small></span></span>
            ) },
            { key: 'city', header: 'Town', headerClassName: 'hide-sm', className: 'muted hide-sm', render: ({ client }) => client.city },
            { key: 'jobs', header: 'Jobs', headerClassName: 'r', className: 'r', sortKey: 'jobs', sortable: true, right: true, render: ({ client }) => client.jobs },
            { key: 'reviews', header: 'Reviews', headerClassName: 'r', className: 'r', sortKey: 'reviews', sortable: true, right: true, render: ({ reviews }) => reviews.length },
            { key: 'average', header: 'Average', className: 'm-sub', render: ({ reviews }) => {
              const average = reviews.length ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length : 0;
              return reviews.length ? <span className="cl__avg"><Stars value={average} size={12} /> {average.toFixed(1)}</span> : <span className="muted">—</span>;
            } },
            { key: 'spend', header: 'Booked', headerClassName: 'r', className: 'r m-end', sortKey: 'spend', sortable: true, right: true, render: ({ client }) => formatMoney(client.spend) },
            { key: 'joined', header: 'Joined', className: 'muted', sortKey: 'joined', sortable: true, render: ({ client }) => formatDate(client.joined, true) },
            { key: 'status', header: 'Status', className: 'm-tag', render: ({ client }) => (
              <Pill tone={statusTone[client.status as keyof typeof statusTone] ?? 'plain'}>{client.status[0].toUpperCase() + client.status.slice(1)}</Pill>
            ) },
          ]}
        />
      </Card>

      {selected ? (
        <Drawer
          title={selected.name}
          sub={`${selected.city} · client since ${formatDate(selected.joined, true)}`}
          onClose={() => go('clients')}
          foot={() => (
            <>
              <button type="button" className="btn" onClick={() => { go('clients'); go('inbox'); }}>
                <Icon name="mail" /> Message
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => { go('clients'); openModal?.({ kind: 'review', clientId: selected.id }); }}
              >
                <Icon name="send" /> Ask for a review
              </button>
            </>
          )}
        >
          {() => <ClientDetail id={selected.id} />}
        </Drawer>
      ) : null}
    </div>
  );
}
