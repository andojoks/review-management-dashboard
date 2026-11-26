import {
  useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent,
} from 'react';
import gsap from 'gsap';
import {
  useBootstrap, useConfig, usePatchThread, useRestoreState,
  useReviews, useSendMessage, useSettings, useThreads,
} from '@/stores';
import type { Thread } from '@/types';
import {
  formatMessageTime, formatRelative, initials, shortName,
} from '@/ui/data/format';
import { go } from '@/router';
import type { ToastOptions } from '@/ui/components/feedback';
import {
  Avatar, Button, Card, Empty, Icon, PageHeader, SearchField, Segmented,
} from '@/ui/components';
import {
  chipShake, query as domQuery, reducedMotion, reveal, rise, useFlip, usePageMotion,
} from '@/ui/motion/interactions';

let replyIndex = 0;

const lastText = (thread: Thread) => thread.msgs[thread.msgs.length - 1]?.text ?? '';

interface Person {
  id: string;
  name: string;
  hue?: number;
}

type Toast = (message: string, options?: ToastOptions) => void;

function Conversation({ thread, people, onToast }: {
  thread: Thread;
  people: Map<string, Person>;
  onToast: Toast;
}) {
  const root = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const count = useRef(thread.msgs.length);
  const timers = useRef<number[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);

  const who = people.get(thread.who);
  const reviews = useReviews();
  const settings = useSettings();
  const config = useConfig();
  const sendMessage = useSendMessage();
  const patchThread = usePatchThread();
  const restoreState = useRestoreState();
  const review = thread.review ? reviews.find((item) => item.id === thread.review) : undefined;
  const folder = config.clients.reviewFolders[review?.status ?? 'flagged'] ?? 'flagged';

  usePageMotion(root, (page) => {
    rise(domQuery(page, '.msg'), { y: 10, stagger: .04, delay: .1 });
  }, []);

  useLayoutEffect(() => {
    const pane = messagesRef.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
    if (thread.msgs.length > count.current && pane && !reducedMotion()) {
      const last = pane.querySelector<HTMLElement>('.msg:last-of-type');
      if (last) {
        gsap.fromTo(last,
          { y: 24, opacity: 0, scale: .94 },
          { y: 0, opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.8)', clearProps: 'transform,opacity' });
      }
    }
    count.current = thread.msgs.length;
  }, [thread.msgs.length, typing]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) {
      chipShake(inputRef.current);
      return;
    }
    sendMessage.mutate({ id: thread.id, input: { text, by: settings.me.id } });
    setDraft('');
    timers.current.push(window.setTimeout(() => setTyping(true), config.inbox.typingDelay));
    timers.current.push(window.setTimeout(() => {
      setTyping(false);
      const text = config.inbox.replies[replyIndex++ % config.inbox.replies.length];
      sendMessage.mutate({ id: thread.id, input: { text, from: 'them' } });
    }, config.inbox.replyDelay));
  };

  return (
    <div className="conv" ref={root}>
      <div className="conv__head">
        <a className="ibtn ibtn--sm ibtn--flat m-only" href="#/inbox" aria-label="Back to conversations">
          <Icon name="back" />
        </a>
        <Avatar initials={initials(who?.name ?? '?')} hue={who?.hue} />
        <span className="cell__text">
          <b>{who?.name}</b>
          <small>{thread.kind === 'client' ? 'Client' : 'Pro'} · {thread.subject}</small>
        </span>
        {review ? (
          <a className="btn btn--sm d-only" href={`#/reviews/${folder}/${review.id}`}>
            <Icon name="star" /> {review.id}
          </a>
        ) : null}
        <button
          type="button"
          className="ibtn ibtn--sm"
          aria-label="Archive"
          data-tip="Archive"
          onClick={() => {
            patchThread.mutate({ id: thread.id, patch: { archived: true } }, {
              onSuccess: (result) => onToast('Conversation archived', {
                undo: () => restoreState.mutate(result.before),
              }),
            });
            go('inbox');
          }}
        >
          <Icon name="archive" />
        </button>
      </div>
      <div className="conv__msgs" ref={messagesRef}>
        {thread.msgs.map((message, index) => (
          <div className={`msg msg--${message.from}`} key={`${message.t}-${index}`}>
            <p>{message.text}</p>
            <small>
              {message.from === 'me'
                ? `${shortName(people.get(('by' in message ? message.by : undefined) ?? '')?.name ?? 'You')} · `
                : ''}
              {formatMessageTime(message.t)}
            </small>
          </div>
        ))}
        {typing ? (
          <div className="msg msg--them msg--typing" aria-label={`${who?.name ?? 'They'} is typing`}>
            <i /><i /><i />
          </div>
        ) : null}
      </div>
      <form className="conv__compose" onSubmit={send}>
        <textarea
          className="textarea"
          rows={1}
          ref={inputRef}
          value={draft}
          aria-label="Message"
          placeholder={`Write to ${who?.name?.split(' ')[0] ?? 'them'}…`}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
        />
        <button type="submit" className="btn btn--primary" aria-label="Send">
          <Icon name="send" /><span className="d-only">Send</span>
        </button>
      </form>
    </div>
  );
}

export function Inbox({
  detailId, onToast, openModal,
}: {
  detailId?: string;
  onToast: Toast;
  openModal?: (request: { kind: 'message'; who?: string }) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const threads = useThreads();
  const state = useBootstrap();
  const config = useConfig();
  const patchThread = usePatchThread();
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');

  const capture = useFlip(listRef, '.thr', [kind, query, detailId]);
  const change = (update: () => void) => { capture(); update(); };

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card'), { stagger: .06 });
    rise(domQuery(page, '.thr'), { y: 10, delay: .2, stagger: .03 });
  }, []);

  const people = useMemo(() => new Map<string, Person>([
    ...state.clients.map((client) => [client.id, client] as const),
    ...state.pros.map((pro) => [pro.id, pro] as const),
    ...state.team.map((member) => [member.id, member] as const),
    [state.me.id, state.me] as const,
  ]), [state.clients, state.pros, state.team, state.me]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return threads
      .filter((thread) => !thread.archived)
      .filter((thread) => kind === 'all' || thread.kind === kind)
      .filter((thread) => !term || [thread.subject, lastText(thread)].some((value) => value.toLowerCase().includes(term)))
      .sort((a, b) => b.msgs[b.msgs.length - 1].t - a.msgs[a.msgs.length - 1].t);
  }, [threads, kind, query]);

  const mobile = window.innerWidth <= 760;
  const active = threads.find((thread) => thread.id === (detailId ?? (mobile ? '' : visible[0]?.id)));

  useEffect(() => {
    if (!active?.unread) return;
    patchThread.mutate({ id: active.id, patch: { read: true } });
  }, [active?.id, active?.unread, patchThread]);

  return (
    <div className={`page ib${detailId ? ' has-sel' : ''}`} ref={root}>
      <PageHeader
        title="Inbox"
        description="Conversations with clients and pros about their reviews."
        actions={
          <Button variant="primary" className="magnetic" icon="edit" onClick={() => openModal?.({ kind: 'message' })}>
            New message
          </Button>
        }
      />

      <div className="ib__grid">
        <Card className="card--flush ib__list" aria-label="Conversations">
          <div className="ib__tools">
            <SearchField value={query} onChange={(value) => change(() => setQuery(value))} placeholder="Search conversations" />
            <Segmented
              label="Show"
              value={kind}
              onChange={(value) => change(() => setKind(value))}
              options={config.inbox.kindFilters}
            />
          </div>
          <ul className="ib__threads" ref={listRef}>
            {visible.map((thread) => {
              const person = people.get(thread.who);
              const last = thread.msgs[thread.msgs.length - 1];
              return (
                <li className={`thr${thread.id === active?.id ? ' is-on' : ''}${thread.unread ? ' is-unread' : ''}`} data-flip-id={thread.id} key={thread.id}>
                  <a href={`#/inbox/${thread.id}`}>
                    <Avatar initials={initials(person?.name ?? '?')} hue={person?.hue} />
                    <span className="thr__text">
                      <span className="thr__top"><b>{person?.name}</b><time>{formatRelative(last.t)}</time></span>
                      <span className="thr__sub">{thread.subject}</span>
                      <small>{last.from === 'me' ? 'You: ' : ''}{last.text}</small>
                    </span>
                    {thread.unread > 0 ? <span className="snav__count">{thread.unread}</span> : null}
                  </a>
                </li>
              );
            })}
          </ul>
          {!visible.length ? <Empty icon="inbox" title="No conversations" body="Nothing matches — try All." /> : null}
        </Card>

        <Card className="card--flush ib__pane" aria-label="Conversation">
          {active ? (
            <Conversation key={active.id} thread={active} people={people} onToast={onToast} />
          ) : (
            <Empty icon="chat" title="Pick a conversation" body="Choose one on the left, or start a new message." />
          )}
        </Card>
      </div>
    </div>
  );
}
