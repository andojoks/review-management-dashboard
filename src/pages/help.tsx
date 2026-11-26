import { useRef, useState, type FormEvent } from 'react';
import { useHelpData } from '@/stores';
import { clockBase } from '@/ui/data/clock';
import { formatRelative } from '@/ui/data/format';
import { Accordion, Card, CardHeader, Empty, Icon, PageHeader, Pill, SearchField } from '@/ui/components';
import {
  chipShake, query as domQuery, reveal, rise, usePageMotion,
} from '@/ui/motion/interactions';

export function Help({ onToast }: { onToast: (message: string) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const help = useHelpData();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);
  const [tickets, setTickets] = useState(help.tickets);
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card'), { stagger: .06 });
    rise(domQuery(page, '.faq__item'), { y: 10, delay: .2, stagger: .04 });
  }, []);

  const filtered = help.faqs
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => !query || `${entry.question} ${entry.answer}`.toLowerCase().includes(query.toLowerCase()));

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (subject.trim().length < 4 || details.trim().length < 10) {
      chipShake(formRef.current);
      onToast('Add a subject and a few words');
      return;
    }
    setTickets((current) => [{ subject: subject.trim(), time: clockBase }, ...current]);
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
                question: entry.question,
                answer: <p>{entry.answer}</p>,
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
                <Pill tone={index === 0 && ticket.time >= clockBase - 60000 ? 'info' : 'warn'}>
                  {index === 0 && ticket.time >= clockBase - 60000 ? 'Sent' : 'Open'}
                </Pill>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
