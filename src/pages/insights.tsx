import { useMemo, useRef, useState } from 'react';
import { useConfig, useInsightsData, useSettings } from '@/stores';
import { formatHours, formatMonth, formatNumber, initials } from '@/ui/data/format';
import type { ToastOptions } from '@/ui/components/feedback';
import {
  Avatar, BarChart, Button, Card, Counter, DataTable, Delta, Heat, Icon,
  Meter, PageHeader, PlainKpi, Rating, ReputationChart, Ring, Segmented,
  SelectField, Tabs,
} from '@/ui/components';
import {
  growX, query as domQuery, reveal, rise, usePageMotion,
} from '@/ui/motion/interactions';

const twoDecimals = (value: number) => value.toFixed(2);
const oneDecimalPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
const wholePercent = (value: number) => `${Math.round(value * 100)}%`;

type Toast = (message: string, options?: ToastOptions) => void;

export function Insights({ onToast, sub = 'ratings' }: { onToast: Toast; sub?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [trade, setTrade] = useState('all');
  const [compare, setCompare] = useState('on');
  const {
    reviews, pros, team, history, tradeLabels, ratingBuckets,
  } = useInsightsData();
  const { prefs } = useSettings();
  const config = useConfig();
  const narrow = typeof window !== 'undefined' && window.innerWidth <= 760;

  const publicReviews = useMemo(() => reviews.filter((review) => review.status !== 'hidden'), [reviews]);
  const ratingCounts = ratingBuckets.map((stars) => publicReviews.filter((review) => review.stars === stars).length);
  const average = publicReviews.length
    ? publicReviews.reduce((sum, review) => sum + review.stars, 0) / publicReviews.length
    : 0;
  const fourPlus = (ratingCounts[0] + ratingCounts[1]) / (publicReviews.length || 1);
  const lowRatings = ratingCounts[3] + ratingCounts[4];
  const withPhotos = publicReviews.filter((review) => review.photos > 0).length / (publicReviews.length || 1);
  const replyRate = publicReviews.length
    ? publicReviews.filter((review) => review.reply).length / publicReviews.length
    : 0;

  const tradeRows = useMemo(() => Object.keys(tradeLabels)
    .map((id) => {
      const matched = publicReviews.filter((review) =>
        pros.find((pro) => pro.id === review.pro)?.trade === id);
      return {
        trade: id,
        count: matched.length,
        rating: matched.length ? matched.reduce((sum, review) => sum + review.stars, 0) / matched.length : 0,
        low: matched.filter((review) => review.stars <= 2).length,
      };
    })
    .filter((row) => row.count)
    .sort((a, b) => b.rating - a.rating), [publicReviews, pros, tradeLabels]);

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card, .kpi'), { stagger: .05 });
    rise(domQuery(page, '.trow, .who__row'), { delay: .25, stagger: .04 });
    growX(domQuery(page, '.trow__bar i'), { delay: .25, stagger: .05 });
  }, [sub, trade]);

  const months = history.months.map(formatMonth);
  const values = history.avgRating.map((value, index) =>
    Math.min(4.98, Number((value + (trade === 'all' ? 0 : config.insights.tradeOffsets[trade] * (1 - index / 30))).toFixed(2))));
  const maxVolume = Math.max(...history.volume);

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
            <PlainKpi
              label="Reviews, last 12 months"
              value={formatNumber(history.volume.reduce((a, b) => a + b, 0))}
              foot={<><Delta value={(history.volume.reduce((a, b) => a + b, 0) - history.lastYear.reduce((a, b) => a + b, 0)) / history.lastYear.reduce((a, b) => a + b, 0)} /> on the year before</>}
            />
            <PlainKpi label="Best month" value={`July · ${formatNumber(maxVolume)}`} foot="summer jobs, garden and roofing" />
            <PlainKpi label="Per finished job" value="41%" foot={<><Delta value={0.05} /> since text links</>} />
            <PlainKpi label="Busiest time" value="Sun, 6–8pm" foot="after the weekend’s jobs" />
          </div>
          <Card className="ins__wide">
            <div className="chead">
              <div className="chead__text">
                <h2>Reviews a month</h2>
                <p>November so far · grey is the same month last year</p>
              </div>
              <Segmented label="Compare" value={compare} onChange={setCompare} options={[
                { id: 'on', label: 'With last year' }, { id: 'off', label: 'This year' },
              ]} />
            </div>
            <BarChart
              values={history.volume}
              ghost={compare === 'on' ? history.lastYear : undefined}
              labels={months}
              height={narrow ? 200 : 260}
              ghostLabel="Last year"
              valueLabel="This year"
              format={formatNumber}
              highlight={11}
            />
          </Card>
          <Card>
            <div className="chead">
              <div className="chead__text">
                <h2>When reviews are written</h2>
                <p>Day of the week by time of day, 12 months</p>
              </div>
            </div>
            <div className="ins__heat"><Heat /></div>
          </Card>
        </>
      ) : sub === 'response' ? (
        <>
          <div className="ins__grid ins__grid--r">
            <Card>
              <div className="chead">
                <div className="chead__text">
                  <h2>Median time to reply</h2>
                  <p>Hours from review to public answer · goal under {prefs.sla}h</p>
                </div>
              </div>
              <ReputationChart
                values={history.replyHours}
                compare={[]}
                labels={months}
                format={formatHours}
                height={narrow ? 200 : 250}
                valueLabel="Median reply time"
              />
            </Card>
            <Card className="card--well ins__ring">
              <Ring value={replyRate} size={narrow ? 136 : 168} stroke={14}>
                <b className="ins__ringv"><Counter value={replyRate} format={wholePercent} /></b>
                <small>answered</small>
              </Ring>
              <p>Of every public review, <b>{wholePercent(replyRate)}</b> has a reply from the team. The rest are in the queue.</p>
              <a className="btn btn--primary" href="#/reviews/inbox"><Icon name="reply" /> Open the queue</a>
            </Card>
          </div>
          <Card className="card--flush">
            <div className="chead">
              <div className="chead__text">
                <h2>Who answers</h2>
                <p>Replies in the last 90 days and how long each takes</p>
              </div>
            </div>
            <DataTable
              className="table--stack"
              rows={team.slice().sort((a, b) => a.avgHours - b.avgHours)}
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
                      <Meter value={member.avgHours} max={8} tone={member.avgHours > 5 ? 'warn' : undefined} label={`${member.name} median reply`} />
                      <span>{formatHours(member.avgHours)}</span>
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
              <span className="kpi__label"><span className="disc disc--sm"><Icon name="star" /></span>Average rating</span>
              <span className="kpi__value"><Counter value={average} format={twoDecimals} /></span>
              <span className="kpi__foot"><Delta value={0.021} /> over 30 days</span>
            </div>
            <div className="kpi kpi--plain">
              <span className="kpi__label"><span className="disc disc--sm"><Icon name="thumb" /></span>Four stars or more</span>
              <span className="kpi__value"><Counter value={fourPlus} format={oneDecimalPercent} /></span>
              <span className="kpi__foot"><Delta value={0.034} /> over 30 days</span>
            </div>
            <div className="kpi kpi--plain">
              <span className="kpi__label"><span className="disc disc--sm"><Icon name="alert" /></span>One or two stars</span>
              <span className="kpi__value"><Counter value={lowRatings} format={formatNumber} /></span>
              <span className="kpi__foot"><Delta value={-0.18} invert /> fewer than September</span>
            </div>
            <div className="kpi kpi--plain">
              <span className="kpi__label"><span className="disc disc--sm"><Icon name="image" /></span>Reviews with photos</span>
              <span className="kpi__value"><Counter value={withPhotos} format={wholePercent} /></span>
              <span className="kpi__foot"><Delta value={0.06} /> more trusted</span>
            </div>
          </div>

          <div className="ins__grid">
            <Card>
              <div className="chead">
                <div className="chead__text">
                  <h2>Average rating, 12 months</h2>
                  <p>{trade === 'all' ? 'The whole marketplace' : `${tradeLabels[trade]}s only`} · dashed is last year</p>
                </div>
                <SelectField
                  label="Trade"
                  value={trade}
                  onChange={setTrade}
                  options={[{ id: 'all', label: 'All trades' }, ...Object.keys(tradeLabels).map((id) => ({ id, label: `${tradeLabels[id]}s` }))]}
                />
              </div>
              <ReputationChart
                values={values}
                compare={values.map((value, index) => Number((value - 0.13 - (index % 3) * 0.02).toFixed(2)))}
                labels={months}
                compareLabel="Last year"
                format={twoDecimals}
                fromZero={false}
                ceil={5}
                height={narrow ? 220 : 330}
                valueLabel="Average rating"
              />
            </Card>

            <Card className="card--well">
              <div className="chead">
                <div className="chead__text">
                  <h2>Trades, best first</h2>
                  <p>Average of public reviews</p>
                </div>
              </div>
              <ul className="trades">
                {tradeRows.map((row) => (
                  <li className="trow" key={row.trade} onClick={() => setTrade(row.trade)} aria-current={trade === row.trade ? 'true' : undefined}>
                    <span className="disc disc--sm disc--soft"><Icon name={config.pros.tradeIcons[row.trade] ?? 'wrench'} /></span>
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
