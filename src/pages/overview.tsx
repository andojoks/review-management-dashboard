import { useRef, useState, type CSSProperties } from 'react';
import { formatNumber, initials, shortName } from '@/ui/data/format';
import { formatDuration, overviewData } from '@/ui/data/overview';
import { tradeLabels } from '@/store';
import {
  Avatar, Badge, BarChart, Button, Card, CardHeader, Counter, Delta, DetailCard,
  DetailListCard, Icon, MetricTile, PageHeader, Pill, Rating, ReputationChart,
  Split, Stars,
} from '@/ui/components';
import {
  growX, popIn, query, reveal, rise, usePageMotion,
} from '@/ui/motion/interactions';

const twoDecimals = (value: number) => value.toFixed(2);
const whole = (value: number) => formatNumber(value);
const percentWhole = (value: number) => `${(value * 100).toFixed(0)}%`;
const day = 86400000;
const baseTime = new Date(2026, 10, 9, 10, 24, 0).getTime();
const shortDate = (time: number) =>
  new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export function Overview({ onToast }: { onToast: (message: string) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(overviewData.metrics[0].id);
  const metric = overviewData.metrics.find((item) => item.id === selected) ?? overviewData.metrics[0];

  usePageMotion(root, (page) => {
    reveal(query(page, '.card, .kpi'), { stagger: .05 });
    rise(query(page, '.queue__row, .lead__row, .feed__row'), { delay: .35, stagger: .035 });
    growX(query(page, '.mix__bar i'), { delay: .3, stagger: .06 });
    popIn(query(page, '.kpi .disc'), { delay: .3, stagger: .06 });
  }, []);

  return (
    <div className="page ov" ref={root}>
      <PageHeader
        title={`Good morning, ${shortName(overviewData.userName)}`}
        description={`${overviewData.unanswered} reviews are waiting for a reply and ${overviewData.flagged} are held for a check. Ratings are up for the fourth month running.`}
        actions={
          <>
            <Button icon="send" onClick={() => onToast('Review request composer opened')}>Ask for a review</Button>
            <a className="btn btn--primary magnetic" href="#/reviews/inbox">
              <Icon name="reply" /> Reply queue <Badge inverse>{overviewData.unanswered}</Badge>
            </a>
          </>
        }
      />

      <div className="ov__top">
        <Card className="hero" aria-label="Reputation score">
          <div className="hero__head">
            <div>
              <span className="hero__label">Reputation score · November</span>
              <div className="hero__score">
                <Counter value={overviewData.rating} format={twoDecimals} className="hero__fig" />
                <span className="hero__of">/ 5</span>
              </div>
              <div className="hero__stars">
                <Stars value={overviewData.rating} size={18} pop />
                {' '}
                <Delta value={(overviewData.rating - overviewData.previousRating) / overviewData.previousRating} />
                {' '}
                <small className="hero__vs">vs October</small>
              </div>
            </div>
            <dl className="hero__stats">
              <div><dt>Reviews this month</dt><dd><Counter value={Number(overviewData.monthReviews.replace(/,/g, ''))} format={whole} /></dd></div>
              <div><dt>Answered</dt><dd><Counter value={Number(overviewData.answered.replace('%', '')) / 100} format={percentWhole} /></dd></div>
              <div><dt>Median reply</dt><dd>{formatDuration(overviewData.medianReply)}</dd></div>
            </dl>
          </div>
          <div className="hero__chart">
            <ReputationChart
              values={overviewData.heroValues}
              compare={overviewData.heroCompare}
              labels={overviewData.months}
              format={twoDecimals}
              compareLabel="Last year"
              valueLabel="Average rating"
              fromZero={false}
              ceil={5}
              height={typeof window !== 'undefined' && window.innerWidth <= 760 ? 150 : 170}
            />
          </div>
        </Card>

        <Card className="card--well mix" aria-label="Star mix">
          <CardHeader
            title="Star mix"
            subtitle={`${overviewData.publicCount} public reviews`}
            action={<a className="ibtn ibtn--sm ibtn--flat" href="#/insights/ratings" aria-label="Open rating insights"><Icon name="arrowUR" /></a>}
          />
          <ul className="mix__list">
            {overviewData.starMix.map((entry, index) => (
              <li className="mix__row" key={entry.stars}>
                <span className="mix__k">{5 - index}<Icon name="star" size="sm" /></span>
                <span className="mix__bar"><i style={{ '--f': entry.count / overviewData.publicCount } as CSSProperties} /></span>
                <b>{entry.percent}</b>
              </li>
            ))}
          </ul>
          <div className="mix__foot">
            <span className="disc disc--sm"><Icon name="thumb" size={14} /></span>
            <p><b>{overviewData.repeatRate}</b> of clients would book again — four or five stars.</p>
          </div>
        </Card>
      </div>

      <div className="kpis ov__kpis" role="group" aria-label="Pick what the chart shows">
        {overviewData.metrics.map((tile) => (
          <MetricTile
            key={tile.id}
            label={tile.label}
            value={tile.value}
            delta={tile.delta}
            helper={tile.note}
            icon={tile.icon}
            invert={tile.invert}
            values={tile.values}
            active={selected === tile.id}
            onClick={() => setSelected(tile.id)}
          />
        ))}
      </div>

      <div className="ov__mid">
        <Card>
          <CardHeader
            title={`${metric.label} · last 14 days`}
            subtitle={`${shortDate(baseTime - 13 * day)} – today · pick a tile above to switch`}
          />
          <BarChart
            labels={overviewData.barLabels}
            values={metric.values}
            format={whole}
            highlight={13}
            height={220}
            valueLabel={metric.label}
          />
        </Card>

        <DetailListCard
          className="card--flush queue"
          title="Needs a reply"
          subtitle="Oldest first answers keep the 24-hour promise"
          action={<a className="linkbtn" href="#/reviews/inbox">All {overviewData.unanswered}</a>}
          listClassName="queue__list"
          items={overviewData.queue}
          empty={<ul className="queue__list"><li className="queue__empty"><Icon name="check" /> Every review has an answer.</li></ul>}
          renderItem={(item) => (
            <li className="queue__row" key={item.id}>
              <a href={`#/reviews/inbox/${item.id}`}>
                <Avatar initials={initials(item.client)} />
                <span className="cell__text">
                  <b>{item.title}</b>
                  <small>{item.client} on {item.pro} · {item.time}</small>
                </span>
                <Stars value={item.stars} size={12} />
              </a>
            </li>
          )}
        />
      </div>

      <div className="ov__low">
        <DetailCard title="Where reviews come from" subtitle="Every public review, by how it was left">
          <Split
            label="Channels"
            format={whole}
            parts={overviewData.channels.map((channel) => ({
              name: channel.label,
              value: channel.count,
              color: channel.color,
            }))}
          />
          <ul className="chans">
            {overviewData.channels.map((channel) => (
              <li key={channel.key}>
                <i style={{ background: channel.color }} />
                <Icon name={channel.icon} size="sm" />
                <span>{channel.label}</span>
                <b>{whole(channel.count)}</b>
                <small>{percentWhole(channel.count / (overviewData.publicCount || 1))}</small>
              </li>
            ))}
          </ul>
        </DetailCard>

        <DetailListCard
          className="card--flush"
          title="Best rated pros"
          subtitle="Three reviews or more"
          action={<a className="linkbtn" href="#/pros/directory">Directory</a>}
          listClassName="lead"
          as="ol"
          items={overviewData.bestPros}
          renderItem={(pro, index) => (
            <li
              className="lead__row"
              key={pro.id}
              onClick={() => { window.location.hash = `#/pros/directory/${pro.id}`; }}
            >
              <span className="lead__n">{index + 1}</span>
              <Avatar initials={initials(pro.name)} />
              <span className="cell__text">
                <b>{pro.name}</b>
                <small>{tradeLabels[pro.trade] ?? pro.trade} · {pro.count} reviews</small>
              </span>
              <Rating value={pro.rating} icon plainValue className="lead__score" format={twoDecimals} />
            </li>
          )}
        />

        <DetailCard title="Team replies" subtitle="The latest answers that went public">
          <div className="feed">
            {overviewData.latestReplies.map((reply) => (
              <a className="feed__row" href={`#/reviews/published/${reply.id}`} key={reply.id}>
                <Avatar initials={reply.initials} staff size="sm" />
                <span className="feed__text">
                  <b>{reply.name} answered {reply.id}</b>
                  <small>{reply.time} · {reply.stars}★ for {reply.pro}</small>
                </span>
                <Pill tone={reply.tone}>{reply.sentiment}</Pill>
              </a>
            ))}
          </div>
          <div className="ov__docs" onClick={() => { window.location.hash = '#/documents/verification'; }}>
            <span className="disc disc--sm"><Icon name="file" size={14} /></span>
            <span><b>{formatNumber(overviewData.pendingChecks)} documents</b> waiting for a check</span>
            <Icon name="arrowR" size="sm" />
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
