import { useRef, useState } from 'react';
import { sourceSnapshot } from '@/data/source';
import { tradeLabels } from '@/store';
import { formatMonth, formatNumber, initials } from '@/ui/data/format';
import {
  Avatar, BarChart, Button, Card, CardHeader, Counter, DataTable, Delta, Heat,
  Icon, PageHeader, PlainKpi, Rating, ReputationChart, Ring, Segmented,
  SelectField, Tabs,
} from '@/ui/components';
import type { IconName } from '@/ui/components';
import {
  growX, query as domQuery, reveal, rise, usePageMotion,
} from '@/ui/motion/interactions';

const tradeIcons: Record<string, IconName> = {
  electric: 'wrench', carpentry: 'wrench', plumbing: 'wrench', painting: 'spark',
  tiling: 'grid', roofing: 'grid', garden: 'heart', locks: 'key',
};

const twoDecimals = (value: number) => value.toFixed(2);
const oneDecimalPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
const wholePercent = (value: number) => `${Math.round(value * 100)}%`;

const tradeOffsets: Record<string, number> = {
  electric: 0.06, carpentry: 0.09, plumbing: -0.11, painting: 0.04,
  tiling: 0.02, roofing: -0.16, garden: 0.12, locks: -0.05,
};

const reviews = sourceSnapshot.reviews;
const average = reviews.reduce((sum, review) => sum + review.stars, 0) / (reviews.length || 1);
const fourPlus = reviews.filter((review) => review.stars >= 4).length / (reviews.length || 1);
const lowRatings = reviews.filter((review) => review.stars <= 2).length;
const withPhotos = reviews.filter((review) => review.photos > 0).length / (reviews.length || 1);
const replyRate = reviews.filter((review) => review.reply).length / (reviews.length || 1);

const tradeRows = Object.keys(tradeLabels)
  .map((trade) => {
    const matched = reviews.filter((review) => sourceSnapshot.pros.find((pro) => pro.id === review.pro)?.trade === trade);
    return {
      trade,
      count: matched.length,
      rating: matched.reduce((sum, review) => sum + review.stars, 0) / (matched.length || 1),
      low: matched.filter((review) => review.stars <= 2).length,
    };
  })
  .filter((row) => row.count)
  .sort((a, b) => b.rating - a.rating);

export function Insights({ onToast, sub = 'ratings' }: { onToast: (message: string) => void; sub?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [trade, setTrade] = useState('all');
  const [compare, setCompare] = useState('on');

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card, .kpi'), { stagger: .05 });
    rise(domQuery(page, '.trow, .who__row'), { delay: .25, stagger: .04 });
    growX(domQuery(page, '.trow__bar i'), { delay: .25, stagger: .05 });
  }, [sub, trade]);

  const months = sourceSnapshot.history.months.map(formatMonth);
  const values = sourceSnapshot.history.avgRating.map((value, index) =>
    Math.min(4.98, Number((value + (trade === 'all' ? 0 : tradeOffsets[trade] * (1 - index / 30))).toFixed(2))));

  return (
    <div className="page ins" ref={root}>
      <PageHeader
        title="Insights"
        description="How Handwell’s pros are rated, how many reviews arrive and how quickly the team answers."
        actions={<Button icon="download" onClick={() => onToast(`insights-${sub}.csv downloaded`)}>Export</Button>}
      />
      <Tabs
        active={sub}
        items={[
          { id: 'ratings', label: 'Ratings', href: '#/insights/ratings' },
          { id: 'volume', label: 'Volume', href: '#/insights/volume' },
          { id: 'response', label: 'Response', href: '#/insights/response' },
        ]}
      />

      {sub === 'volume' ? (
        <>
          <div className="kpis">
            <PlainKpi label="Reviews, last 12 months" value={formatNumber(sourceSnapshot.history.volume.reduce((a, b) => a + b, 0))} foot={<><Delta value={(sourceSnapshot.history.volume.reduce((a, b) => a + b, 0) - sourceSnapshot.history.lastYear.reduce((a, b) => a + b, 0)) / sourceSnapshot.history.lastYear.reduce((a, b) => a + b, 0)} /> on the year before</>} />
            <PlainKpi label="Best month" value="July · 498" foot="summer jobs, garden and roofing" />
            <PlainKpi label="Per finished job" value="0.41" foot={<><Delta value={0.05} /> since text links</>} />
            <PlainKpi label="Busiest time" value="Sun, 6–8pm" foot="after the weekend’s jobs" />
          </div>
          <Card className="ins__wide">
            <CardHeader
              title="Reviews a month"
              subtitle="November so far · grey is the same month last year"
              action={<Segmented label="Compare" value={compare} onChange={setCompare} options={[{ id: 'on', label: 'With last year' }, { id: 'off', label: 'This year' }]} />}
            />
            <BarChart
              values={sourceSnapshot.history.volume}
              ghost={compare === 'on' ? sourceSnapshot.history.lastYear : undefined}
              labels={months}
              height={260}
              highlight={11}
              ariaLabel="Reviews per month"
            />
          </Card>
          <Card>
            <CardHeader title="When reviews are written" subtitle="Day of the week by time of day, 12 months" />
            <div className="ins__heat"><Heat /></div>
          </Card>
        </>
      ) : sub === 'response' ? (
        <>
          <div className="ins__grid ins__grid--r">
            <Card>
              <CardHeader title="Median time to reply" subtitle="Hours from review to public answer · goal under 24h" />
              <ReputationChart values={sourceSnapshot.history.replyHours.map((value) => 4.5 - value / 8)} compare={[]} labels={months} height={250} />
            </Card>
            <Card className="card--well ins__ring">
              <Ring value={replyRate}>
                <b className="ins__ringv">{Math.round(replyRate * 100)}%</b>
                <small>answered</small>
              </Ring>
              <p>Of every public review, <b>{Math.round(replyRate * 100)}%</b> has a reply from the team. The rest are in the queue.</p>
              <a className="btn btn--primary" href="#/reviews/inbox"><Icon name="reply" /> Open the queue</a>
            </Card>
          </div>
          <Card className="card--flush">
            <CardHeader title="Who answers" subtitle="Replies in the last 90 days and how long each takes" />
            <DataTable
              className="table--stack"
              rows={sourceSnapshot.team.slice().sort((a, b) => a.avgHours - b.avgHours)}
              rowKey={(member) => member.id}
              rowClassName={() => 'who__row'}
              columns={[
                {
                  key: 'member', header: 'Teammate', className: 'm-main',
                  render: (member) => (
                    <span className="cell">
                      <Avatar initials={initials(member.name)} staff online={member.online} hue={member.hue} />
                      <span className="cell__text"><b>{member.name}</b><small className="m-only">{member.role}</small></span>
                    </span>
                  ),
                },
                { key: 'role', header: 'Role', className: 'muted', render: (member) => member.role },
                { key: 'replies', header: 'Replies', headerClassName: 'r', className: 'r m-end', render: (member) => formatNumber(member.replies) },
                {
                  key: 'median', header: 'Median reply', className: 'm-sub',
                  render: (member) => (
                    <span className="who__time">
                      <span className="meter"><i style={{ transform: `scaleX(${member.avgHours / 8})` }} /></span>
                      <span>{member.avgHours}h</span>
                    </span>
                  ),
                },
                {
                  key: 'quality', header: 'Quality', className: 'm-tag',
                  render: (_, index) => <Rating value={4.9 - index * 0.12} size={12} showValue={false} />,
                },
              ]}
            />
          </Card>
        </>
      ) : (
        <>
          <div className="kpis">
            <div className="kpi kpi--plain">
              <span className="kpi__label"><span className="disc disc--sm"><Icon name="star" size={14} /></span>Average rating</span>
              <span className="kpi__value"><Counter value={average} format={twoDecimals} /></span>
              <span className="kpi__foot"><Delta value={0.021} /> over 30 days</span>
            </div>
            <div className="kpi kpi--plain">
              <span className="kpi__label"><span className="disc disc--sm"><Icon name="check" size={14} /></span>Four stars or more</span>
              <span className="kpi__value"><Counter value={fourPlus} format={oneDecimalPercent} /></span>
              <span className="kpi__foot"><Delta value={0.034} /> over 30 days</span>
            </div>
            <div className="kpi kpi--plain">
              <span className="kpi__label"><span className="disc disc--sm"><Icon name="alert" size={14} /></span>One or two stars</span>
              <span className="kpi__value"><Counter value={lowRatings} format={formatNumber} /></span>
              <span className="kpi__foot"><Delta value={-0.18} invert /> fewer than September</span>
            </div>
            <div className="kpi kpi--plain">
              <span className="kpi__label"><span className="disc disc--sm"><Icon name="image" size={14} /></span>Reviews with photos</span>
              <span className="kpi__value"><Counter value={withPhotos} format={wholePercent} /></span>
              <span className="kpi__foot"><Delta value={0.06} /> more trusted</span>
            </div>
          </div>

          <div className="ins__grid">
            <Card>
              <CardHeader
                title="Average rating, 12 months"
                subtitle={trade === 'all' ? 'The whole marketplace · dashed is last year' : `${tradeLabels[trade]}s only · dashed is last year`}
                action={
                  <SelectField
                    label="Trade"
                    value={trade}
                    onChange={setTrade}
                    options={[{ id: 'all', label: 'All trades' }, ...Object.entries(tradeLabels).map(([id, label]) => ({ id, label: `${label}s` }))]}
                  />
                }
              />
              <ReputationChart values={values} compare={values.map((value, index) => Number((value - 0.13 - (index % 3) * 0.02).toFixed(2)))} labels={months} height={330} />
            </Card>

            <Card className="card--well">
              <CardHeader title="Trades, best first" subtitle="Average of public reviews" />
              <ul className="trades">
                {tradeRows.map((row) => (
                  <li className="trow" key={row.trade} onClick={() => setTrade(row.trade)} aria-current={trade === row.trade ? 'true' : undefined}>
                    <span className="disc disc--sm disc--soft"><Icon name={tradeIcons[row.trade] ?? 'wrench'} size={14} /></span>
                    <span className="cell__text"><b>{tradeLabels[row.trade]}s</b><small>{row.count} reviews{row.low ? ` · ${row.low} low` : ''}</small></span>
                    <span className="trow__bar"><i style={{ '--f': (row.rating - 3) / 2 } as React.CSSProperties} /></span>
                    <b className="trow__v">{row.rating.toFixed(2)}</b>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
