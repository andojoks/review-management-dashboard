import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import gsap from 'gsap';
import { replaceReview, updateReview, useReviews, type Review } from '@/data/reviewStore';
import { sourceSnapshot } from '@/data/source';
import { sourceNow } from '@/ui/data/clock';
import { formatDate, formatRelative, formatTime, initials, shortName } from '@/ui/data/format';
import { go } from '@/router';
import type { ToastOptions } from '@/ui/components/feedback';
import { ConfirmDialog, MenuItem, Popover } from '@/ui/components/overlays';
import {
  Avatar, Card, Chip, Empty, Icon, PageHeader, Pill, SearchField, Segmented, Stars, Tabs,
} from '@/ui/components';
import {
  chipShake, popIn, query as domQuery, reducedMotion, reveal, rise, useFlip, usePageMotion,
} from '@/ui/motion/interactions';

type Toast = (message: string, options?: ToastOptions) => void;

const prosById = new Map(sourceSnapshot.pros.map((pro) => [pro.id, pro]));
const clientsById = new Map(sourceSnapshot.clients.map((client) => [client.id, client]));
const teamById = new Map(sourceSnapshot.team.map((member) => [member.id, member]));
const channels: Record<string, { icon: 'phone' | 'globe' | 'mail' | 'chat'; label: string }> = {
  app: { icon: 'phone', label: 'Mobile app' },
  web: { icon: 'globe', label: 'Website' },
  email: { icon: 'mail', label: 'Email request' },
  sms: { icon: 'chat', label: 'Text link' },
};
const tradeLabels: Record<string, string> = {
  electric: 'Electrician', carpentry: 'Carpenter', plumbing: 'Plumber', painting: 'Painter',
  tiling: 'Tiler', roofing: 'Roofer', garden: 'Gardener', locks: 'Locksmith',
};
const flagReasons = ['Personal details', 'Off-topic', 'Abusive language', 'Possible fake', 'Dispute open'];

function replyTemplates(review: Review) {
  const client = shortName(clientsById.get(review.client)?.name ?? 'there');
  const pro = shortName(prosById.get(review.pro)?.name ?? 'the pro');
  const job = review.job.toLowerCase();
  if (review.stars >= 4) {
    return [
      `Thank you, ${client}! We’ve passed this to ${pro}, who was really pleased to read it.`,
      `So glad the ${job} went well, ${client}. Reviews like this help neighbours find good trades.`,
    ];
  }
  if (review.stars === 3) {
    return [
      `Thanks for the honest review, ${client}. We’ve shared your point with ${pro} so the next visit runs smoother.`,
      `Thank you, ${client}. If anything is still not right with the ${job}, reply here and we’ll sort it.`,
    ];
  }
  return [
    `We’re sorry, ${client} — this isn’t the standard we expect. Our disputes team will call you today to put it right.`,
    `Thank you for telling us, ${client}. We’ve paused new bookings for ${pro} while we look into the ${job}.`,
  ];
}

const visibleReviews = (reviews: Review[], sub: string) => reviews.filter((review) => {
  if (sub === 'flagged') return review.status === 'flagged' || review.status === 'hidden';
  if (sub === 'published') return review.status === 'replied';
  return review.status === 'new';
});

function ratingForProValue(reviews: Review[], proId: string) {
  const rated = reviews.filter((review) => review.pro === proId && review.status !== 'hidden');
  return rated.reduce((sum, review) => sum + review.stars, 0) / (rated.length || 1);
}

interface DetailProps {
  review: Review;
  reviews: Review[];
  sub: string;
  next?: Review;
  mutate: (id: string, update: (review: Review) => void, message: string, options?: ToastOptions) => void;
  onHelpful: (id: string, button: HTMLElement | null) => void;
}

function ReviewDetail({ review, reviews, sub, next, mutate, onHelpful }: DetailProps) {
  const root = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const answer = useRef<HTMLDivElement>(null);
  const hadReply = useRef(Boolean(review.reply));
  const [reply, setReply] = useState('');
  const [sign, setSign] = useState(true);
  const [flagAnchor, setFlagAnchor] = useState<HTMLElement | null>(null);
  const [confirming, setConfirming] = useState(false);

  const client = clientsById.get(review.client);
  const pro = prosById.get(review.pro);
  const channel = channels[review.channel] ?? { icon: 'chat' as const, label: review.channel };

  usePageMotion(root, (page) => {
    rise(domQuery(page, '.rvd__in > *'), { y: 14, stagger: .05 });
  }, []);

  useLayoutEffect(() => {
    if (review.reply && !hadReply.current && answer.current && !reducedMotion()) {
      gsap.fromTo(answer.current, {
        opacity: 0, y: 18, scale: .97,
      }, {
        opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(1.8)', clearProps: 'transform,opacity',
      });
      const disc = answer.current.querySelector('.disc');
      if (disc) popIn(disc, { delay: .2 });
    }
    hadReply.current = Boolean(review.reply);
  }, [review.reply]);

  const applyTemplate = (template: string, event: MouseEvent<HTMLButtonElement>) => {
    chipShake(event.currentTarget);
    setReply(template);
    if (textarea.current && !reducedMotion()) {
      gsap.fromTo(textarea.current,
        { backgroundColor: 'var(--well)' },
        { backgroundColor: 'var(--card)', duration: .8, clearProps: 'backgroundColor' });
    }
    textarea.current?.focus();
  };

  const postReply = (event: FormEvent) => {
    event.preventDefault();
    const text = reply.trim();
    if (text.length < 12) {
      chipShake(textarea.current);
      textarea.current?.focus();
      return;
    }
    const signed = sign ? `${text}\n${sourceSnapshot.prefs.signature}` : text;
    mutate(review.id, (item) => {
      item.reply = { by: sourceSnapshot.me.id, text: signed, t: sourceNow() };
      item.status = 'replied';
    }, `Reply posted on ${review.id}`);
  };

  const hold = (reason: string) => {
    mutate(review.id, (item) => {
      item.status = 'flagged';
      item.flag = reason;
    }, `${review.id} held for review · ${reason}`);
  };

  const remove = () => {
    mutate(review.id, (item) => {
      item.status = 'hidden';
    }, `${review.id} removed from ${pro?.name.split(' ')[0] ?? 'the pro'}’s page`, { warn: true });
  };

  const restore = () => {
    mutate(review.id, (item) => {
      item.status = item.reply ? 'replied' : 'new';
      delete (item as { flag?: string }).flag;
    }, `${review.id} is public again`);
  };

  const average = ratingForProValue(reviews, review.pro);
  const reviewCount = reviews.filter((item) => item.pro === review.pro && item.status !== 'hidden').length;

  return (
    <div className="rvd__in" ref={root}>
      <div className="rvd__bar">
        <a className="btn btn--sm btn--ghost m-only rvd__back" href={`#/reviews/${sub}`}>
          <Icon name="back" /> Reviews
        </a>
        <span className="rvd__id">{review.id}</span>
        <Pill tone="plain" className="pill--plain">
          <Icon name={channel.icon} size="sm" /> {channel.label}
        </Pill>
        <span className="rvd__sp" />
        {review.status !== 'flagged' && review.status !== 'hidden' ? (
          <button type="button" className="btn btn--sm" onClick={(event) => {
            chipShake(event.currentTarget);
            setFlagAnchor(event.currentTarget);
          }}>
            <Icon name="flag" /> Flag
          </button>
        ) : null}
        {review.status !== 'hidden' ? (
          <button
            type="button"
            className="ibtn ibtn--sm"
            aria-label="Remove review"
            data-tip="Remove"
            onClick={() => setConfirming(true)}
          >
            <Icon name="eyeoff" />
          </button>
        ) : null}
      </div>
      <header className="rvd__head">
        <Avatar initials={initials(client?.name ?? 'Client')} size="lg" />
        <span className="cell__text">
          <b>{client?.name}</b>
          <small>{client?.city} · {formatDate(review.t, true)}, {formatTime(review.t)} · {review.job}</small>
        </span>
        <div className="rvd__stars"><Stars value={review.stars} size={20} pop /><small>{review.stars} of 5</small></div>
      </header>
      {review.flag ? (
        <div className={`rvd__banner${review.status === 'hidden' ? ' is-gone' : ''}`}>
          <Icon name="flag" />
          <span>
            <b>{review.status === 'hidden' ? 'Removed from the public page' : `Held · ${review.flag}`}</b>
            <small>{review.status === 'hidden' ? 'It no longer counts toward the pro’s rating.' : 'Not public until someone restores it.'}</small>
          </span>
          <button type="button" className="btn btn--sm" onClick={restore}>
            <Icon name="undo" /> Restore
          </button>
        </div>
      ) : null}
      <article className="rvd__body">
        <Icon name="quote" className="rvd__q" />
        <h2>{review.title}</h2>
        <p>{review.text}</p>
        <div className="rvd__chips">
          {review.photos > 0 ? <Pill tone="plain"><Icon name="image" size="sm" /> {review.photos} photos</Pill> : null}
          <button
            type="button"
            className="pill pill--plain rvd__help"
            onClick={(event) => {
              chipShake(event.currentTarget);
              onHelpful(review.id, event.currentTarget);
            }}
          >
            <Icon name="thumb" size="sm" /> Helpful · {review.helpful}
          </button>
        </div>
      </article>
      <a className="rvd__pro" href={`#/pros/directory/${pro?.id}`}>
        <Avatar initials={initials(pro?.name ?? 'Pro')} />
        <span className="cell__text">
          <b>{pro?.name}</b>
          <small>{tradeLabels[pro?.trade ?? '']} · {pro?.city} · {reviewCount} reviews</small>
        </span>
        <span className="rvd__rating"><Stars value={average} size={12} /><b>{average.toFixed(2)}</b></span>
        <Icon name="chevR" size="sm" />
      </a>
      {review.reply ? (
        <div className="rvd__answer" ref={answer}>
          <span className="disc disc--sm"><Icon name="reply" /></span>
          <div>
            <small>{shortName(teamById.get(review.reply.by)?.name ?? 'Team')} answered · {formatRelative(review.reply.t)}</small>
            <p>{review.reply.text}</p>
          </div>
        </div>
      ) : review.status === 'new' ? (
        <form className="rvd__compose" onSubmit={postReply}>
          <div className="rvd__tpls" role="group" aria-label="Suggested replies">
            {replyTemplates(review).map((template) => (
              <button type="button" className="rvd__tpl" key={template} onClick={(event) => applyTemplate(template, event)}>
                <Icon name="sparkle" size="sm" /><span>{template}</span>
              </button>
            ))}
          </div>
          <label className="sr" htmlFor="reply">Your reply</label>
          <textarea
            id="reply"
            ref={textarea}
            className="textarea"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder={`Reply to ${shortName(client?.name ?? 'the client')} — it is public on ${pro?.name ?? 'the pro'}’s page.`}
          />
          <div className="rvd__send">
            <label className="rvd__sign">
              <input type="checkbox" checked={sign} onChange={(event) => setSign(event.target.checked)} /> Add my signature
            </label>
            <small className={reply.length > 600 ? 'bad' : 'muted'}>{reply.length} / 600</small>
            <button type="submit" className="btn btn--primary magnetic" disabled={reply.length > 600}>
              <Icon name="send" /> Post reply
            </button>
          </div>
        </form>
      ) : null}
      {review.reply && sub === 'inbox' ? (
        <div className="rvd__next">
          {next ? (
            <button type="button" className="btn btn--primary" onClick={() => go(`reviews/inbox/${next.id}`)}>
              Next review <Icon name="arrowR" />
            </button>
          ) : (
            <span className="muted"><Icon name="check" /> That was the last one.</span>
          )}
        </div>
      ) : null}
      {flagAnchor ? (
        <Popover anchor={flagAnchor} align="end" label="Menu" onClose={() => setFlagAnchor(null)}>
          {(close) => (
            <div role="menu" aria-label="Menu">
              <div className="menu__label">Hold this review because…</div>
              {flagReasons.map((reason) => (
                <MenuItem
                  key={reason}
                  icon="flag"
                  label={reason}
                  onClick={() => {
                    close();
                    hold(reason);
                  }}
                />
              ))}
            </div>
          )}
        </Popover>
      ) : null}
      {confirming ? (
        <ConfirmDialog
          title={`Remove ${review.id}?`}
          body={`It disappears from ${pro?.name.split(' ')[0] ?? 'the pro'}’s page and stops counting toward their rating. You can restore it from Flagged.`}
          ok="Remove review"
          danger
          onConfirm={remove}
          onClose={() => setConfirming(false)}
        />
      ) : null}
    </div>
  );
}

export function Reviews({ onToast, sub = 'inbox', detailId }: { onToast: Toast; sub?: string; detailId?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reviews = useReviews();
  const [query, setQuery] = useState('');
  const [stars, setStars] = useState(0);
  const [sort, setSort] = useState(sub === 'inbox' ? 'old' : 'new');
  const [selectedId, setSelectedId] = useState<string | undefined>(detailId);

  const flipKey = reviews.map((review) => `${review.id}:${review.status}:${review.flag ?? ''}`).join();
  const capture = useFlip(listRef, '.rvl__row', [query, stars, sort, sub, flipKey], {
    duration: .55,
    enterX: -12,
  });

  useEffect(() => {
    setSelectedId(detailId);
    setSort(sub === 'inbox' ? 'old' : 'new');
  }, [sub, detailId]);

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card'), { stagger: .06 });
    rise(domQuery(page, '.rvl__row').slice(0, 9), { y: 10, delay: .2, stagger: .03 });
  }, [sub]);

  const list = useMemo(() => {
    const term = query.trim().toLowerCase();
    return visibleReviews(reviews, sub)
      .filter((review) => (!stars || review.stars === stars))
      .filter((review) => !term || [review.title, review.text, review.id, review.job, prosById.get(review.pro)?.name, clientsById.get(review.client)?.name]
        .some((value) => value?.toLowerCase().includes(term)))
      .sort((a, b) => (sort === 'new' ? b.t - a.t : sort === 'old' ? a.t - b.t : a.stars - b.stars || b.t - a.t));
  }, [reviews, query, stars, sort, sub]);

  const selected = reviews.find((review) => review.id === selectedId)
    ?? (detailId ? reviews.find((review) => review.id === detailId) : undefined)
    ?? list[0];
  const next = list.find((review) => review.id !== selected?.id && review.status === 'new');
  const counts = {
    inbox: visibleReviews(reviews, 'inbox').length,
    flagged: reviews.filter((review) => review.status === 'flagged').length,
    published: visibleReviews(reviews, 'published').length,
  };

  const mutate = (
    id: string,
    update: (review: Review) => void,
    message: string,
    options: ToastOptions = {},
  ) => {
    capture();
    const before = updateReview(id, update);
    if (!selectedId && list[0]) setSelectedId(list[0].id);
    onToast(message, { ...options, undo: options.undo ?? (() => replaceReview(before)) });
  };

  const onHelpful = (id: string, button: HTMLElement | null) => {
    chipShake(button);
    updateReview(id, (review) => { review.helpful += 1; });
  };

  const clearFilters = () => {
    capture();
    setQuery('');
    setStars(0);
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
          { id: 'inbox', label: 'To reply', href: '#/reviews/inbox', count: counts.inbox },
          { id: 'flagged', label: 'Flagged', href: '#/reviews/flagged', count: counts.flagged },
          { id: 'published', label: 'Answered', href: '#/reviews/published', count: counts.published },
        ]}
      />

      <div className="rv__grid">
        <Card className="card--flush rvl" aria-label="Review list">
          <div className="rvl__tools">
            <SearchField value={query} onChange={(value) => { capture(); setQuery(value); }} placeholder="Search text, pro, client…" />
            <div className="rvl__row2">
              <div className="chips" role="group" aria-label="Stars">
                {[0, 5, 4, 3, 2, 1].map((value) => (
                  <Chip
                    key={value}
                    active={stars === value}
                    onClick={() => {
                      capture();
                      setStars(value);
                    }}
                  >
                    {value ? <>{value}<Icon name="star" /></> : 'All'}
                  </Chip>
                ))}
              </div>
              <Segmented
                label="Sort"
                value={sort}
                onChange={(value) => { capture(); setSort(value); }}
                options={[
                  { id: 'old', label: 'Oldest', title: 'Oldest first' },
                  { id: 'new', label: 'Newest', title: 'Newest first' },
                  { id: 'low', label: 'Lowest', title: 'Lowest rating first' },
                ]}
              />
            </div>
          </div>
          <ul className="rvl__list" ref={listRef}>
            {list.map((review) => {
              const client = clientsById.get(review.client);
              return (
                <li className={`rvl__row${review.id === selected?.id ? ' is-on' : ''}${review.status === 'new' ? ' is-new' : ''}`} data-flip-id={review.id} key={review.id}>
                  <a
                    href={`#/reviews/${sub}/${review.id}`}
                    aria-current={review.id === selected?.id ? 'true' : undefined}
                  >
                    <span className="rvl__top"><Avatar initials={initials(client?.name ?? 'Client')} size="sm" /><b>{client?.name}</b><time>{formatRelative(review.t)}</time></span>
                    <span className="rvl__meta"><Stars value={review.stars} size={12} /><small>for {prosById.get(review.pro)?.name}</small></span>
                    <span className="rvl__title">{review.title}</span>
                    <span className="rvl__text">{review.text}</span>
                    {review.flag ? <span className="rvl__flag"><Icon name="flag" size="sm" /> {review.status === 'hidden' ? 'Removed' : review.flag}</span> : null}
                  </a>
                </li>
              );
            })}
          </ul>
          {!list.length ? (
            list.length === 0 && (query || stars) ? (
              <Empty
                title="Nothing matches"
                body="Clear the search or pick another star filter."
                action={<button type="button" className="btn btn--sm" onClick={clearFilters}>Clear filters</button>}
              />
            ) : (
              <Empty
                icon="check"
                title={sub === 'inbox' ? 'Inbox zero' : sub === 'flagged' ? 'Nothing held' : 'No answers yet'}
                body={sub === 'inbox'
                  ? 'Every review has a reply. New ones land here the moment they’re written.'
                  : 'Reviews show up here as the team works through them.'}
              />
            )
          ) : null}
        </Card>

        <Card className="rvd" aria-label="Review">
          {selected ? (
            <ReviewDetail
              key={selected.id}
              review={selected}
              reviews={reviews}
              sub={sub}
              next={next}
              mutate={mutate}
              onHelpful={onHelpful}
            />
          ) : (
            <Empty icon="star" title="Pick a review" body="Choose a review on the left to read it and reply." />
          )}
        </Card>
      </div>
    </div>
  );
}
