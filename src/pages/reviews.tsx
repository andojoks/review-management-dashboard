import { useMemo, useRef, useState, type FormEvent } from 'react';
import { sourceSnapshot } from '@/data/source';
import { formatDateTime, formatRelative, initials, shortName } from '@/ui/data/format';
import {
  Avatar, Button, Card, Chip, Empty, Icon, PageHeader, Pill, Rating, SearchField,
  Segmented, Stars, Tabs,
} from '@/ui/components';
import {
  query as domQuery, reveal, rise, useFlip, usePageMotion,
} from '@/ui/motion/interactions';

const prosById = new Map(sourceSnapshot.pros.map((pro) => [pro.id, pro]));
const clientsById = new Map(sourceSnapshot.clients.map((client) => [client.id, client]));
const teamById = new Map(sourceSnapshot.team.map((member) => [member.id, member]));
const channelLabels: Record<string, string> = {
  app: 'Mobile app', web: 'Website', email: 'Email request', sms: 'Text link',
};
const tradeLabels: Record<string, string> = {
  electric: 'Electrician', carpentry: 'Carpenter', plumbing: 'Plumber', painting: 'Painter',
  tiling: 'Tiler', roofing: 'Roofer', garden: 'Gardener', locks: 'Locksmith',
};

function replyTemplates(review: (typeof sourceSnapshot.reviews)[number]) {
  const client = shortName(clientsById.get(review.client)?.name ?? 'there');
  const pro = shortName(prosById.get(review.pro)?.name ?? 'the pro');
  const job = review.job.toLowerCase();
  if (review.stars >= 4) {
    return [
      `Thank you, ${client}! We’ve passed this to ${pro}, who was really pleased to read it.`,
      `So glad the ${job} went well, ${client}. Reviews like this help neighbours find good trades.`,
    ];
  }
  return [
    `We’re sorry, ${client} — this isn’t the standard we expect. Our disputes team will call you today to put it right.`,
    `Thank you for telling us, ${client}. We’ve paused new bookings for ${pro} while we look into the ${job}.`,
  ];
}

const visibleReviews = (sub: string) => sourceSnapshot.reviews.filter((review) => {
  if (sub === 'flagged') return review.status === 'flagged' || review.status === 'hidden';
  if (sub === 'published') return review.status === 'replied';
  return review.status === 'new';
});

export function Reviews({ onToast, sub = 'inbox', detailId }: { onToast: (message: string) => void; sub?: string; detailId?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [stars, setStars] = useState(0);
  const [sort, setSort] = useState('old');
  const [reply, setReply] = useState('');
  const [sign, setSign] = useState(true);

  const capture = useFlip(listRef, '.rvl__row', [query, stars, sort, sub]);
  const change = (update: () => void) => { capture(); update(); };

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card'), { stagger: .06 });
    rise(domQuery(page, '.rvl__row').slice(0, 9), { y: 10, delay: .2, stagger: .03 });
  }, [sub]);

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    return visibleReviews(sub)
      .filter((review) => (!stars || review.stars === stars))
      .filter((review) => !term || [review.title, review.text, review.id, review.job, prosById.get(review.pro)?.name, clientsById.get(review.client)?.name]
        .some((value) => value?.toLowerCase().includes(term)))
      .sort((a, b) => (sort === 'new' ? b.t - a.t : sort === 'low' ? a.stars - b.stars || b.t - a.t : a.t - b.t));
  }, [query, stars, sort, sub]);

  const selected = list.find((review) => review.id === detailId) ?? list[0];

  const postReply = (event: FormEvent) => {
    event.preventDefault();
    if (reply.trim().length < 12) {
      onToast('Write a few more words before posting');
      return;
    }
    onToast(`Reply posted to ${selected?.id ?? 'review'}`);
    setReply('');
  };

  return (
    <div className={`page rv${detailId ? ' has-sel' : ''}`} ref={root}>
      <PageHeader
        title="Reviews"
        description="Answer every review within a day, hold the ones that break the rules, and keep pros’ pages honest."
      />
      <Tabs
        active={sub}
        items={[
          { id: 'inbox', label: 'To reply', href: '#/reviews/inbox', count: sourceSnapshot.reviews.filter((review) => review.status === 'new').length },
          { id: 'flagged', label: 'Flagged', href: '#/reviews/flagged', count: sourceSnapshot.reviews.filter((review) => review.status === 'flagged' || review.status === 'hidden').length },
          { id: 'published', label: 'Answered', href: '#/reviews/published', count: sourceSnapshot.reviews.filter((review) => review.status === 'replied').length },
        ]}
      />

      <div className="rv__grid">
        <Card className="card--flush rvl" aria-label="Review list">
          <div className="rvl__tools">
            <SearchField value={query} onChange={(value) => change(() => setQuery(value))} placeholder="Search text, pro, client…" />
            <div className="rvl__row2">
              <div className="chips" role="group" aria-label="Stars">
                {[0, 5, 4, 3, 2, 1].map((value) => (
                  <Chip key={value} active={stars === value} onClick={() => change(() => setStars(value))}>
                    {value ? <>{value}<Icon name="star" size={12} /></> : 'All'}
                  </Chip>
                ))}
              </div>
              <Segmented
                label="Sort"
                value={sort}
                onChange={(value) => change(() => setSort(value))}
                options={[{ id: 'old', label: 'Oldest', title: 'Oldest first' }, { id: 'new', label: 'Newest', title: 'Newest first' }, { id: 'low', label: 'Lowest', title: 'Lowest rating first' }]}
              />
            </div>
          </div>
          <ul className="rvl__list" ref={listRef}>
            {list.map((review) => {
              const client = clientsById.get(review.client);
              return (
                <li className={`rvl__row${review.id === selected?.id ? ' is-on' : ''}${review.status === 'new' ? ' is-new' : ''}`} data-flip-id={review.id} key={review.id}>
                  <a href={`#/reviews/${sub}/${review.id}`}>
                    <span className="rvl__top"><Avatar initials={initials(client?.name ?? 'Client')} size="sm" /><b>{client?.name}</b><time>{formatRelative(review.t)}</time></span>
                    <span className="rvl__meta"><Stars value={review.stars} size={12} /><small>for {prosById.get(review.pro)?.name}</small></span>
                    <span className="rvl__title">{review.title}</span>
                    <span className="rvl__text">{review.text}</span>
                    {review.flag ? <span className="rvl__flag"><Icon name="alert" size={12} /> {review.status === 'hidden' ? 'Removed' : review.flag}</span> : null}
                  </a>
                </li>
              );
            })}
          </ul>
          {!list.length ? <Empty icon="check" title="Inbox zero" body="Every review has a reply. New ones land here the moment they’re written." /> : null}
        </Card>

        <Card className="rvd" aria-label="Review">
          {selected ? (
            <div className="rvd__in">
              <div className="rvd__bar">
                <a className="btn btn--sm btn--ghost m-only rvd__back" href={`#/reviews/${sub}`}><Icon name="back" size={14} /> Reviews</a>
                <span className="rvd__id">{selected.id}</span>
                <Pill tone="plain"><Icon name="chat" size={14} /> {channelLabels[selected.channel] ?? selected.channel}</Pill>
                <span className="rvd__sp" />
                <Button onClick={() => onToast(`Held · ${selected.flag ?? 'manual check'}`)}><Icon name="alert" size={14} /> Flag</Button>
              </div>
              <header className="rvd__head">
                <Avatar initials={initials(clientsById.get(selected.client)?.name ?? 'Client')} size="lg" />
                <span className="cell__text">
                  <b>{clientsById.get(selected.client)?.name}</b>
                  <small>{clientsById.get(selected.client)?.city} · {formatDateTime(selected.t)} · {selected.job}</small>
                </span>
                <div className="rvd__stars"><Stars value={selected.stars} size={20} /><small>{selected.stars} of 5</small></div>
              </header>
              {selected.flag ? (
                <div className={`rvd__banner${selected.status === 'hidden' ? ' is-gone' : ''}`}>
                  <Icon name="alert" size={16} />
                  <span><b>{selected.status === 'hidden' ? 'Removed from the public page' : `Held · ${selected.flag}`}</b><small>{selected.status === 'hidden' ? 'It no longer counts toward the pro’s rating.' : 'Not public until someone restores it.'}</small></span>
                  <Button onClick={() => onToast(`${selected.id} restored`)}><Icon name="refresh" size={14} /> Restore</Button>
                </div>
              ) : null}
              <article className="rvd__body">
                <Icon name="star" className="rvd__q" />
                <h2>{selected.title}</h2>
                <p>{selected.text}</p>
                <div className="rvd__chips">
                  {selected.photos > 0 ? <Pill tone="plain"><Icon name="image" size={14} /> {selected.photos} photos</Pill> : null}
                  <Pill tone="plain"><Icon name="check" size={14} /> Helpful · {selected.helpful}</Pill>
                </div>
              </article>
              <a className="rvd__pro" href={`#/pros/directory/${selected.pro}`}>
                <Avatar initials={initials(prosById.get(selected.pro)?.name ?? 'Pro')} />
                <span className="cell__text"><b>{prosById.get(selected.pro)?.name}</b><small>{tradeLabels[sourceSnapshot.pros.find((pro) => pro.id === selected.pro)?.trade ?? '']} · {sourceSnapshot.pros.find((pro) => pro.id === selected.pro)?.city} · {ratingForPro(selected.pro)}</small></span>
                <Rating value={ratingForProValue(selected.pro)} size={12} className="rvd__rating" />
                <Icon name="chevR" size={14} />
              </a>
              {selected.reply ? (
                <div className="rvd__answer">
                  <span className="disc disc--sm"><Icon name="reply" size={14} /></span>
                  <div><small>{shortName(teamById.get(selected.reply.by)?.name ?? 'Team')} answered · {formatRelative(selected.reply.t)}</small><p>{selected.reply.text}</p></div>
                </div>
              ) : selected.status === 'new' ? (
                <form className="rvd__compose" onSubmit={postReply}>
                  <div className="rvd__tpls" role="group" aria-label="Suggested replies">
                    {replyTemplates(selected).map((template) => (
                      <button type="button" className="rvd__tpl" key={template} onClick={() => setReply(template)}><Icon name="spark" size={14} /><span>{template}</span></button>
                    ))}
                  </div>
                  <label className="sr" htmlFor="reply">Your reply</label>
                  <textarea id="reply" className="textarea" value={reply} onChange={(event) => setReply(event.target.value)} placeholder={`Reply to ${clientsById.get(selected.client)?.name ?? 'the client'} — it is public on ${prosById.get(selected.pro)?.name ?? 'the pro'}’s page.`} />
                  <div className="rvd__send">
                    <label className="rvd__sign"><input type="checkbox" checked={sign} onChange={(event) => setSign(event.target.checked)} /> Add my signature</label>
                    <small className={reply.length > 600 ? 'bad' : 'muted'}>{reply.length} / 600</small>
                    <button type="submit" className="btn btn--primary magnetic" disabled={reply.length > 600}><Icon name="send" size={14} /> Post reply</button>
                  </div>
                </form>
              ) : null}
            </div>
          ) : (
            <Empty icon="star" title="Pick a review" body="Choose a review on the left to read it and reply." />
          )}
        </Card>
      </div>
    </div>
  );
}

function ratingForProValue(proId: string) {
  const rated = sourceSnapshot.reviews.filter((review) => review.pro === proId);
  return rated.reduce((sum, review) => sum + review.stars, 0) / (rated.length || 1);
}

function ratingForPro(proId: string) {
  const count = sourceSnapshot.reviews.filter((review) => review.pro === proId).length;
  return `${count} reviews`;
}
