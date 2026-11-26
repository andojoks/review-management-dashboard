import { useRef, useState, type FormEvent } from 'react';
import { formatRelative } from '@/ui/data/format';
import { Accordion, Card, CardHeader, Empty, Icon, PageHeader, Pill, SearchField } from '@/ui/components';
import {
  chipShake, query as domQuery, reveal, rise, usePageMotion,
} from '@/ui/motion/interactions';

const baseTime = new Date(2026, 10, 9, 10, 24, 0).getTime();

const answers: Array<[string, string]> = [
  ['When should a review be flagged?', 'Hold a review when it shares personal details, is not about the job, uses abusive language, has no matching booking, or is about money still in dispute. Everything else stays public — even when it is harsh.'],
  ['Can a client change their review?', 'Yes. Ask them to open the link in their booking email again; the new version replaces the old one and the history is kept for the team.'],
  ['How fast should we reply?', 'Within the reply deadline in Settings › Review rules (24 hours by default). The queue sorts oldest first so nothing slips.'],
  ['What makes a pro go live?', 'Four approved documents: photo ID, liability insurance, a trade licence and a background check. Approving the last one puts them live automatically.'],
  ['Does removing a review change the rating?', 'Yes — a removed review stops counting toward the pro’s average straight away. Restoring it brings it back.'],
  ['Can pros reply to reviews themselves?', 'Not yet. Pros message the desk from their app and we post the public reply, so every answer keeps the same tone.'],
];

export function Help({ onToast }: { onToast: (message: string) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);
  const [tickets, setTickets] = useState([{ subject: 'Text-link reviews arrive without a job name', time: baseTime - 2 * 86400000 }]);
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card'), { stagger: .06 });
    rise(domQuery(page, '.faq__item'), { y: 10, delay: .2, stagger: .04 });
  }, []);

  const filtered = answers
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => !query || `${entry[0]} ${entry[1]}`.toLowerCase().includes(query.toLowerCase()));

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (subject.trim().length < 4 || details.trim().length < 10) {
      chipShake(formRef.current);
      onToast('Add a subject and a few words');
      return;
    }
    setTickets((current) => [{ subject: subject.trim(), time: baseTime }, ...current]);
    setSubject('');
    setDetails('');
    onToast('Ticket sent — we answer within a working day');
  };

  return (
    <div className="page help" ref={root}>
      <PageHeader title="Help" description="Answers for the trust desk, and a line to Raveno support." />
      <div className="set__grid">
        <Card>
          <CardHeader title="Answers" />
          <SearchField value={query} onChange={setQuery} placeholder="Search answers" />
          <div>
            <Accordion
              active={open === null ? null : String(open)}
              items={filtered.map(({ entry, index }) => ({
                id: String(index),
                question: entry[0],
                answer: <p>{entry[1]}</p>,
              }))}
              onChange={(id) => setOpen(id === null ? null : Number(id))}
            />
            {!filtered.length ? <Empty title="No answer for that" body="Send us a ticket instead — a person will reply." /> : null}
          </div>
        </Card>

        <div className="stack">
          <form className="card" ref={formRef} onSubmit={send}>
            <CardHeader title="Ask support" subtitle="Mon–Fri, 8am–6pm" />
            <div className="formgrid">
              <label className="field span2"><span>Subject</span><input className="input" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What’s going on?" /></label>
              <label className="field span2"><span>Details</span><textarea className="textarea" value={details} onChange={(event) => setDetails(event.target.value)} /></label>
            </div>
            <div className="formfoot"><button type="submit" className="btn btn--primary"><Icon name="send" /> Send ticket</button></div>
          </form>

          <Card className="card--well">
            <CardHeader title="Your tickets" />
            {tickets.map((ticket, index) => (
              <div className="row-set" key={`${ticket.subject}-${ticket.time}`}>
                <span className="row-set__text"><b>{ticket.subject}</b><small>{formatRelative(ticket.time)}</small></span>
                <Pill tone={index === 0 && ticket.time >= baseTime - 60000 ? 'info' : 'warn'}>
                  {index === 0 && ticket.time >= baseTime - 60000 ? 'Sent' : 'Open'}
                </Pill>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
