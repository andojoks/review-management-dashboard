import { useState, type FormEvent } from 'react';
import {
  useAddTeamMember, useAddThread, useBootstrap, useConfig,
  useInvitePro, useUploadDoc,
} from '@/stores';
import type { ModalRequest, Notice } from '@/types';
import { sourceNow } from '@/ui/data/clock';
import { shortName } from '@/ui/data/format';
import { chipShake } from '@/ui/motion/interactions';
import { Segmented } from '@/ui/components/primitives';
import { Modal } from './Modal';

export interface GlobalModalsProps {
  request: ModalRequest;
  onClose: () => void;
  onToast: (message: string) => void;
  onNotice: (notice: Notice) => void;
}

function ReviewRequest({ clientId, close, onToast, onNotice }: {
  clientId?: string;
  close: () => void;
  onToast: (message: string) => void;
  onNotice: (notice: Notice) => void;
}) {
  const state = useBootstrap();
  const config = useConfig();
  const [client, setClient] = useState(clientId ?? state.clients[0].id);
  const [pro, setPro] = useState(state.pros.find((item) => item.status === 'live')?.id ?? state.pros[0].id);
  const [method, setMethod] = useState('email');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const chosen = state.clients.find((item) => item.id === client)!;
    const chosenPro = state.pros.find((item) => item.id === pro);
    onToast(`Review request sent to ${chosen.name} by ${method === 'email' ? 'email' : 'text'}`);
    onNotice({
      id: `review-${Date.now()}`,
      ...config.modals.reviewNotice,
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
                {state.clients.map((item) => (
                  <option value={item.id} key={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>For the pro</span>
              <select className="select" value={pro} onChange={(event) => setPro(event.target.value)}>
                {state.pros.filter((item) => item.status === 'live').map((item) => (
                  <option value={item.id} key={item.id}>{item.name} · {config.pros.tradeLabels[item.trade] ?? item.trade}</option>
                ))}
              </select>
            </label>
            <div className="field span2">
              <span>Send by</span>
              <Segmented
                label="Send by"
                value={method}
                onChange={setMethod}
                options={config.modals.reviewMethods}
              />
            </div>
            <div className="preview span2">
              <small className="muted">Preview</small>
              <p>
                Hi {shortName(state.clients.find((item) => item.id === client)?.name ?? '')}, how did{' '}
                {shortName(state.pros.find((item) => item.id === pro)?.name ?? '')} do? Leave a quick review — it takes a minute and helps your neighbours.
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
  const state = useBootstrap();
  const config = useConfig();
  const uploadDoc = useUploadDoc();
  const [name, setName] = useState('');
  const [folder, setFolder] = useState(config.modals.defaultUploadFolder);
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError('Give the file a name of at least 3 letters.');
      chipShake(event.currentTarget.querySelector('.input'));
      return;
    }
    const kind = config.modals.documentKindsByFolder[folder] ?? 'pdf';
    uploadDoc.mutate({
      name: name.trim(),
      kind,
      folder,
      size: Math.round(80 + Math.random() * 600),
      owner: state.me.id,
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
              <Segmented label="Folder" value={folder} onChange={setFolder} options={config.modals.uploadFolders} />
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
  const config = useConfig();
  const invitePro = useInvitePro();
  const [name, setName] = useState('');
  const [trade, setTrade] = useState(config.modals.defaultProTrade);
  const [area, setArea] = useState(config.modals.defaultProCity);
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/\S+\s+\S+/.test(name)) {
      setError('First and last name, please.');
      chipShake(event.currentTarget.querySelector('.input'));
      return;
    }
    const clean = name.trim();
    invitePro.mutate({
      name: clean,
      trade,
      city: area,
      email: '—',
      phone: '—',
      bio: 'New to Handwell.',
      responseRate: .9,
      expiresDays: 365,
      filePrefix: clean.split(/\s+/)[1].toLowerCase(),
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
                {Object.entries(config.pros.tradeLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Area</span>
              <select className="select" value={area} onChange={(event) => setArea(event.target.value)}>
                {config.modals.inviteCities.map((value) => (
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
  const state = useBootstrap();
  const addTeamMember = useAddTeamMember();
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
    addTeamMember.mutate({
      id: `m${state.team.length}`,
      name,
      role: 'Review moderator',
      hue: state.team.length % 6,
      email: address,
      online: false,
      replies: 0,
      avgHours: 0,
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
  const state = useBootstrap();
  const addThread = useAddThread();
  const [to, setTo] = useState(who ?? `c:${state.clients[0].id}`);
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
    addThread.mutate({
      id,
      who: person,
      kind: kind === 'c' ? 'client' : 'pro',
      subject: subject.trim(),
      unread: 0,
      msgs: [{ from: 'me', text: message.trim(), t: sourceNow(), by: state.me.id }],
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
                  {state.clients.map((item) => (
                    <option value={`c:${item.id}`} key={item.id}>{item.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Pros">
                  {state.pros.map((item) => (
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
