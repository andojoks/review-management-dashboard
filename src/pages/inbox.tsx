import { useMemo, useRef, useState, type FormEvent } from 'react';
import { sourceSnapshot } from '@/data/source';
import { formatMessageTime, formatRelative, initials, shortName } from '@/ui/data/format';
import {
  Avatar, Button, Card, Empty, Icon, PageHeader, SearchField, Segmented,
} from '@/ui/components';
import {
  query as domQuery, reveal, rise, useFlip, usePageMotion,
} from '@/ui/motion/interactions';

const people = new Map<string, { name: string; kind: string }>([
  ...sourceSnapshot.clients.map((client) => [client.id, { name: client.name, kind: 'client' }] as const),
  ...sourceSnapshot.pros.map((pro) => [pro.id, { name: pro.name, kind: 'pro' }] as const),
]);

export function Inbox({ detailId, onToast }: { detailId?: string; onToast: (message: string) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');

  const capture = useFlip(listRef, '.thr', [kind, query, detailId]);
  const change = (update: () => void) => { capture(); update(); };

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card'), { stagger: .06 });
    rise(domQuery(page, '.thr'), { y: 10, delay: .2, stagger: .04 });
  }, [detailId]);

  const threads = useMemo(() => {
    const term = query.trim().toLowerCase();
    return sourceSnapshot.threads
      .filter((thread) => kind === 'all' || thread.kind === kind)
      .filter((thread) => !term || [thread.subject, people.get(thread.who)?.name].some((value) => value?.toLowerCase().includes(term)))
      .sort((a, b) => b.msgs[b.msgs.length - 1].t - a.msgs[a.msgs.length - 1].t);
  }, [kind, query]);

  const active = threads.find((thread) => thread.id === detailId) ?? threads[0];
  const linkedReview = active?.review ? sourceSnapshot.reviews.find((review) => review.id === active.review) : undefined;
  const reviewFolder = linkedReview?.status === 'new' ? 'inbox' : linkedReview?.status === 'replied' ? 'published' : 'flagged';

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onToast(`Reply sent to ${people.get(active?.who ?? '')?.name ?? 'them'}`);
    setDraft('');
  };

  return (
    <div className={`page ib${detailId ? ' has-sel' : ''}`} ref={root}>
      <PageHeader
        title="Inbox"
        description="Conversations with clients and pros about their reviews."
        actions={<Button variant="primary" className="magnetic" icon="plus" onClick={() => onToast('New message composer opened')}>New message</Button>}
      />

      <div className="ib__grid">
        <Card className="card--flush ib__list">
          <div className="ib__tools">
            <SearchField value={query} onChange={(value) => change(() => setQuery(value))} placeholder="Search conversations" />
            <Segmented
              label="Conversation type"
              value={kind}
              onChange={(value) => change(() => setKind(value))}
              options={[{ id: 'all', label: 'All' }, { id: 'client', label: 'Clients' }, { id: 'pro', label: 'Pros' }]}
            />
          </div>
          <ul className="ib__threads" ref={listRef}>
            {threads.map((thread) => {
              const person = people.get(thread.who);
              const last = thread.msgs[thread.msgs.length - 1];
              return (
                <li className={`thr${thread.id === active?.id ? ' is-on' : ''}${thread.unread ? ' is-unread' : ''}`} data-flip-id={thread.id} key={thread.id}>
                  <a href={`#/inbox/${thread.id}`}>
                    <Avatar initials={initials(person?.name ?? '?')} hue={thread.kind === 'client' ? 3 : 4} />
                    <span className="thr__text">
                      <span className="thr__top"><b>{person?.name}</b><time>{formatRelative(last.t)}</time></span>
                      <span className="thr__sub">{thread.subject}</span>
                      <small>{last.from === 'me' ? 'You: ' : ''}{last.text}</small>
                    </span>
                    {thread.unread && thread.id !== active?.id ? <span className="snav__count">{thread.unread}</span> : null}
                  </a>
                </li>
              );
            })}
          </ul>
          {!threads.length ? <Empty icon="inbox" title="Nothing here" body="No conversations match this search." /> : null}
        </Card>

        <Card className="card--flush ib__pane">
          {active ? (
            <div className="conv">
              <div className="conv__head">
                <Avatar initials={initials(people.get(active.who)?.name ?? '?')} size="lg" />
                <span className="cell__text"><b>{people.get(active.who)?.name}</b><small>{active.kind === 'client' ? 'Client' : 'Pro'} · {active.subject}</small></span>
                {active.review ? <a className="btn btn--sm d-only" href={`#/reviews/${reviewFolder}/${active.review}`}><Icon name="star" size={13} /> {active.review}</a> : null}
                <button type="button" className="ibtn ibtn--sm" aria-label="Archive" data-tip="Archive" onClick={() => onToast(`${active.subject} archived`)}><Icon name="check" size={15} /></button>
              </div>
              <div className="conv__msgs">
                {active.msgs.map((message, index) => (
                  <div className={`msg${message.from === 'me' ? ' msg--me' : ''}`} key={`${message.t}-${index}`}>
                    <p>{message.text}</p>
                    <small>{message.from === 'me'
                      ? `${shortName(sourceSnapshot.team.find((member) => member.id === ('by' in message ? message.by : undefined))?.name ?? 'You')} · ${formatMessageTime(message.t)}`
                      : formatMessageTime(message.t)}</small>
                  </div>
                ))}
              </div>
              <form className="conv__compose" onSubmit={send}>
                <textarea
                  className="textarea"
                  rows={1}
                  value={draft}
                  aria-label="Message"
                  placeholder={`Write to ${people.get(active.who)?.name ?? 'them'}…`}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      send(event);
                    }
                  }}
                />
                <button type="submit" className="btn btn--primary" aria-label="Send"><Icon name="send" size={14} /><span className="d-only">Send</span></button>
              </form>
            </div>
          ) : (
            <Empty icon="inbox" title="No conversation selected" body="Pick a thread from the list to read and reply." />
          )}
        </Card>
      </div>
    </div>
  );
}
