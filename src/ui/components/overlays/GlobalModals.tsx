import { useState, type FormEvent } from 'react';
import {
  addPro, useProsState,
} from '@/data/prosStore';
import { sourceSnapshot } from '@/data/source';
import { updateDocs } from '@/data/docsStore';
import { updateThreads } from '@/data/inboxStore';
import { getSettings, updateSettings } from '@/data/settingsStore';
import type { Notice } from '@/ui/data/notices';
import type { ModalRequest } from '@/ui/data/modals';
import { sourceNow } from '@/ui/data/clock';
import { shortName } from '@/ui/data/format';
import { trades } from '@/ui/data/trades';
import { chipShake } from '@/ui/motion/interactions';
import { Segmented } from '@/ui/components/primitives';
import { Modal } from './Modal';

export interface GlobalModalsProps {
  request: ModalRequest;
  onClose: () => void;
  onToast: (message: string) => void;
  onNotice: (notice: Notice) => void;
}

const folders = [
  { id: 'policies', label: 'Policies' },
  { id: 'reports', label: 'Reports' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'templates', label: 'Templates' },
];

function ReviewRequest({ clientId, close, onToast, onNotice }: {
  clientId?: string;
  close: () => void;
  onToast: (message: string) => void;
  onNotice: (notice: Notice) => void;
}) {
  const { pros } = useProsState();
  const [client, setClient] = useState(clientId ?? sourceSnapshot.clients[0].id);
  const [pro, setPro] = useState(pros.find((item) => item.status === 'live')?.id ?? pros[0].id);
  const [method, setMethod] = useState('email');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const chosen = sourceSnapshot.clients.find((item) => item.id === client)!;
    const chosenPro = pros.find((item) => item.id === pro);
    onToast(`Review request sent to ${chosen.name} by ${method === 'email' ? 'email' : 'text'}`);
    onNotice({
      id: `review-${Date.now()}`,
      icon: 'send',
      tone: 'info',
      title: 'Review request sent',
      body: `${chosen.name} was asked to review ${chosenPro?.name ?? 'a pro'}.`,
      at: sourceNow(),
      read: false,
      href: `#/clients/${chosen.id}`,
    });
    close();
  };

  return (
    <Modal
      title="Ask for a review"
      sub="A short link the client can answer from their phone."
      onClose={close}
    >
      {(dismiss) => (
        <form onSubmit={submit}>
          <div className="formgrid">
            <label className="field">
              <span>Client</span>
              <select className="select" value={client} onChange={(event) => setClient(event.target.value)}>
                {sourceSnapshot.clients.map((item) => (
                  <option value={item.id} key={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>For the pro</span>
              <select className="select" value={pro} onChange={(event) => setPro(event.target.value)}>
                {pros.filter((item) => item.status === 'live').map((item) => (
                  <option value={item.id} key={item.id}>{item.name} · {trades[item.trade]?.label ?? item.trade}</option>
                ))}
              </select>
            </label>
            <div className="field span2">
              <span>Send by</span>
              <Segmented
                label="Send by"
                value={method}
                onChange={setMethod}
                options={[
                  { id: 'email', label: 'Email', icon: 'mail' },
                  { id: 'sms', label: 'Text message', icon: 'chat' },
                ]}
              />
            </div>
            <div className="preview span2">
              <small className="muted">Preview</small>
              <p>
                Hi {shortName(sourceSnapshot.clients.find((item) => item.id === client)?.name ?? '')}, how did{' '}
                {shortName(pros.find((item) => item.id === pro)?.name ?? '')} do? Leave a quick review — it takes a minute and helps your neighbours.
              </p>
            </div>
          </div>
          <div className="formfoot">
            <button type="button" className="btn" onClick={dismiss}>Cancel</button>
            <button type="submit" className="btn btn--primary">Send request</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function UploadDocument({ close, onToast }: { close: () => void; onToast: (message: string) => void }) {
  const [name, setName] = useState('');
  const [folder, setFolder] = useState('reports');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError('Give the file a name of at least 3 letters.');
      chipShake(event.currentTarget.querySelector('.input'));
      return;
    }
    const kind = folder === 'reports' ? 'sheet' : folder === 'templates' ? 'doc' : 'pdf';
    updateDocs((draft) => {
      draft.docs.unshift({
        id: `d${Date.now()}`,
        name: name.trim(),
        kind,
        folder,
        size: Math.round(80 + Math.random() * 600),
        updated: sourceNow(),
        owner: getSettings().me.id,
        starred: false,
      });
    });
    onToast(`“${name.trim()}” uploaded to ${folder}`);
    close();
  };

  return (
    <Modal title="Upload a document" sub="It is shared with the whole trust team." onClose={close}>
      {(dismiss) => (
        <form onSubmit={submit}>
          <div className="formgrid">
            <label className="field span2">
              <span>File name</span>
              <input
                className={`input${error ? ' is-bad' : ''}`}
                value={name}
                data-autofocus
                onChange={(event) => { setName(event.target.value); setError(''); }}
                placeholder="November trust report"
              />
              {error ? <small className="bad">{error}</small> : null}
            </label>
            <div className="field span2">
              <span>Folder</span>
              <Segmented label="Folder" value={folder} onChange={setFolder} options={folders} />
            </div>
            <div className="dropzone span2">
              <b>Drop a file here</b>
              <small>PDF, sheets, docs or images up to 20 MB</small>
            </div>
          </div>
          <div className="formfoot">
            <button type="button" className="btn" onClick={dismiss}>Cancel</button>
            <button type="submit" className="btn btn--primary">Upload</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function InvitePro({ close, onToast }: { close: () => void; onToast: (message: string) => void }) {
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('electric');
  const [area, setArea] = useState('Leeds');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/\S+\s+\S+/.test(name)) {
      setError('First and last name, please.');
      chipShake(event.currentTarget.querySelector('.input'));
      return;
    }
    const id = `p${Date.now()}`;
    const clean = name.trim();
    addPro({
      id,
      name: clean,
      trade,
      city: area,
      hue: sourceSnapshot.pros.length % 6,
      joined: sourceNow(),
      jobs: 0,
      status: 'onboarding',
      step: 0,
      responseRate: .9,
      phone: '—',
      bio: 'New to Handwell.',
    });
    updateDocs((draft) => {
      ['Photo ID', 'Liability insurance', 'Trade licence', 'Background check'].forEach((kind) => {
        draft.verifications.push({
          id: `v${Date.now()}-${kind}`,
          pro: id,
          kind,
          sent: sourceNow(),
          expires: sourceNow() + 365 * 86_400_000,
          status: 'pending',
          file: `${clean.split(/\s+/)[1].toLowerCase()}-${kind.toLowerCase().replace(/ /g, '-')}.pdf`,
        });
      });
    });
    onToast(`${clean} invited — they start at “Applied”`);
    close();
  };

  return (
    <Modal title="Invite a pro" sub="They get a link to upload ID, insurance and licence." onClose={close}>
      {(dismiss) => (
        <form onSubmit={submit}>
          <div className="formgrid">
            <label className="field span2">
              <span>Full name</span>
              <input
                className={`input${error ? ' is-bad' : ''}`}
                value={name}
                data-autofocus
                onChange={(event) => { setName(event.target.value); setError(''); }}
                placeholder="Jamie Collins"
              />
              {error ? <small className="bad">{error}</small> : null}
            </label>
            <label className="field">
              <span>Trade</span>
              <select className="select" value={trade} onChange={(event) => setTrade(event.target.value)}>
                {Object.entries(trades).map(([id, value]) => <option value={id} key={id}>{value.label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Area</span>
              <select className="select" value={area} onChange={(event) => setArea(event.target.value)}>
                {['Leeds', 'York', 'Harrogate', 'Bradford', 'Wakefield', 'Halifax'].map((value) => (
                  <option value={value} key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="formfoot">
            <button type="button" className="btn" onClick={dismiss}>Cancel</button>
            <button type="submit" className="btn btn--primary">Send invite</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function InviteTeammate({ close, onToast }: { close: () => void; onToast: (message: string) => void }) {
  const [email, setEmail] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector<HTMLElement>('.input');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      chipShake(input);
      return;
    }
    const address = email.trim();
    const derived = address.split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    const name = derived.includes(' ') ? derived : `${derived} Shaw`;
    updateSettings((draft) => {
      draft.team.push({
        id: `m${draft.team.length}`,
        name,
        role: 'Review moderator',
        hue: draft.team.length % 6,
        email: address,
        online: false,
        replies: 0,
        avgHours: 0,
      });
    });
    onToast(`Invite sent to ${address}`);
    close();
  };

  return (
    <Modal title="Invite a teammate" onClose={close}>
      {(dismiss) => (
        <form onSubmit={submit}>
          <div className="formgrid">
            <label className="field span2">
              <span>Work email</span>
              <input
                className="input"
                type="email"
                value={email}
                data-autofocus
                onChange={(event) => setEmail(event.target.value)}
                placeholder="sam@handwell.co"
              />
            </label>
          </div>
          <div className="formfoot">
            <button type="button" className="btn" onClick={dismiss}>Cancel</button>
            <button type="submit" className="btn btn--primary">Send invite</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function NewMessage({ who, close, onToast }: { who?: string; close: () => void; onToast: (message: string) => void }) {
  const { pros } = useProsState();
  const [to, setTo] = useState(who ?? `c:${sourceSnapshot.clients[0].id}`);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Add a subject and a message.');
      return;
    }
    const [kind, person] = to.split(':');
    const id = `t${Date.now()}`;
    updateThreads((draft) => {
      draft.unshift({
        id,
        who: person,
        kind: kind === 'c' ? 'client' : 'pro',
        subject: subject.trim(),
        unread: 0,
        msgs: [{ from: 'me', text: message.trim(), t: sourceNow(), by: getSettings().me.id }],
      });
    });
    onToast('Message sent');
    close();
    window.location.hash = `#/inbox/${id}`;
  };

  return (
    <Modal title="New message" onClose={close}>
      {(dismiss) => (
        <form onSubmit={submit}>
          <div className="formgrid">
            <label className="field span2">
              <span>To</span>
              <select className="select" value={to} onChange={(event) => setTo(event.target.value)}>
                <optgroup label="Clients">
                  {sourceSnapshot.clients.map((item) => (
                    <option value={`c:${item.id}`} key={item.id}>{item.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Pros">
                  {pros.map((item) => (
                    <option value={`p:${item.id}`} key={item.id}>{item.name}</option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label className="field span2">
              <span>Subject</span>
              <input
                className="input"
                value={subject}
                data-autofocus
                onChange={(event) => { setSubject(event.target.value); setError(''); }}
                placeholder="About your review"
              />
            </label>
            <label className="field span2">
              <span>Message</span>
              <textarea
                className="textarea"
                value={message}
                onChange={(event) => { setMessage(event.target.value); setError(''); }}
              />
            </label>
            {error ? <small className="bad span2">{error}</small> : null}
          </div>
          <div className="formfoot">
            <button type="button" className="btn" onClick={dismiss}>Cancel</button>
            <button type="submit" className="btn btn--primary">Send</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function GlobalModals({ request, onClose, onToast, onNotice }: GlobalModalsProps) {
  if (request.kind === 'review') {
    return <ReviewRequest clientId={request.clientId} close={onClose} onToast={onToast} onNotice={onNotice} />;
  }
  if (request.kind === 'upload') return <UploadDocument close={onClose} onToast={onToast} />;
  if (request.kind === 'invitePro') return <InvitePro close={onClose} onToast={onToast} />;
  if (request.kind === 'inviteTeammate') return <InviteTeammate close={onClose} onToast={onToast} />;
  return <NewMessage who={request.who} close={onClose} onToast={onToast} />;
}
