import { useRef, useState, type FormEvent } from 'react';
import { sourceSnapshot } from '@/data/source';
import { formatNumber, initials } from '@/ui/data/format';
import {
  Avatar, Button, Card, CardHeader, DataTable, Icon, PageHeader, Pill,
  SelectField, Switch, Tabs,
} from '@/ui/components';
import {
  query as domQuery, reveal, rise, usePageMotion,
} from '@/ui/motion/interactions';

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'team', label: 'Team' },
  { id: 'rules', label: 'Review rules' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'data', label: 'Data' },
];

export function Settings({ onToast, sub = 'profile' }: {
  onToast: (message: string) => void;
  sub?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const active = tabs.some((tab) => tab.id === sub) ? sub : 'profile';
  const [name, setName] = useState(sourceSnapshot.me.name);
  const [email, setEmail] = useState(sourceSnapshot.me.email);
  const [signature, setSignature] = useState(sourceSnapshot.prefs.signature);
  const [prefs, setPrefs] = useState(sourceSnapshot.prefs);

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card'), { stagger: .06 });
    rise(domQuery(page, '.row-set'), { y: 10, delay: .2, stagger: .03 });
  }, [active]);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 3 || !email.includes('@')) {
      onToast('Check your name and email');
      return;
    }
    onToast('Profile saved');
  };

  const update = (key: keyof typeof prefs, value: boolean | number) => {
    setPrefs((current) => ({ ...current, [key]: value }));
    onToast('Setting saved');
  };

  return (
    <div className="page set" ref={root}>
      <PageHeader title="Settings" description="Your profile, the team, and how the desk handles reviews." />
      <Tabs active={active} items={tabs.map((tab) => ({ ...tab, href: `#/settings/${tab.id}` }))} />

      {active === 'profile' ? (
        <div className="set__grid">
          <form className="card set__narrow" onSubmit={saveProfile}>
            <CardHeader title="Your profile" subtitle="How you appear on replies and in the team" />
            <div className="set__me">
              <Avatar initials={initials(name)} size="xl" staff hue={sourceSnapshot.me.hue} />
              <div><b>{name}</b><small className="muted">{sourceSnapshot.me.role}</small></div>
            </div>
            <label className="field"><span>Name</span><input className="input" value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label className="field"><span>Email</span><input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label className="field"><span>Reply signature</span><textarea className="textarea" value={signature} onChange={(event) => setSignature(event.target.value)} /><small>Added under your public replies when you tick “Add my signature”.</small></label>
            <button type="submit" className="btn btn--primary magnetic">Save profile</button>
          </form>
          <Card className="card--well">
            <CardHeader title="Your month" subtitle="November so far" />
            <div className="dstats dstats--well">
              <div><small>Replies</small><b>{sourceSnapshot.me.replies}</b></div>
              <div><small>Median reply</small><b>2h 24m</b></div>
              <div><small>Held reviews</small><b>11</b></div>
            </div>
            <p className="muted set__note">You answer faster than the team’s median. Keep the queue under a day and Handwell’s rating badge stays green on every pro page.</p>
          </Card>
        </div>
      ) : null}

      {active === 'team' ? (
        <Card className="card--flush">
          <CardHeader title="Team" subtitle="Who can read and reply to reviews" action={<Button variant="primary" className="magnetic" icon="userPlus" onClick={() => onToast('Invite sent')}>Invite</Button>} />
          <DataTable
            rows={sourceSnapshot.team}
            rowKey={(member) => member.id}
            columns={[
              {
                key: 'member', header: 'Teammate',
                render: (member) => (
                  <span className="cell">
                    <Avatar initials={initials(member.name)} staff online={member.online} hue={member.hue} />
                    <span className="cell__text"><b>{member.name}</b><small>{member.email}</small></span>
                  </span>
                ),
              },
              { key: 'role', header: 'Role', className: 'muted', render: (member) => member.role },
              { key: 'replies', header: 'Replies', headerClassName: 'r', className: 'r', right: true, render: (member) => formatNumber(member.replies) },
              { key: 'median', header: 'Median reply', className: 'muted', render: (member) => `${member.avgHours}h` },
              {
                key: 'status', header: 'Status',
                render: (member) => <Pill tone={member.online ? 'good' : 'plain'}>{member.online ? 'Online' : 'Away'}</Pill>,
              },
            ]}
          />
        </Card>
      ) : null}

      {active === 'rules' ? (
        <div className="set__grid">
          <Card>
            <CardHeader title="Review rules" subtitle="What goes public and what waits for a check" />
            <div className="row-set"><span className="cell__text"><b>Publish automatically</b><small>Put replies live as soon as they are posted.</small></span><Switch checked={prefs.autoPublish} onChange={(value) => update('autoPublish', value)} label="Publish automatically" /></div>
            <div className="row-set"><span className="cell__text"><b>Hold low ratings</b><small>Ask for a second look before one or two stars go public.</small></span><SelectField label="Stars" value={String(prefs.alertStars)} onChange={(value) => update('alertStars', Number(value))} options={[{ id: '1', label: '1 star only' }, { id: '2', label: '1–2 stars' }, { id: '3', label: '1–3 stars' }]} /></div>
            <div className="row-set"><span className="cell__text"><b>Profanity check</b><small>Flag reviews with strong language.</small></span><Switch checked={prefs.profanity} onChange={(value) => update('profanity', value)} label="Profanity check" /></div>
            <div className="row-set"><span className="cell__text"><b>Reply deadline</b><small>Reviews older than this appear at the top of the queue.</small></span><SelectField label="Deadline" value={String(prefs.sla)} onChange={(value) => update('sla', Number(value))} options={[{ id: '12', label: '12 hours' }, { id: '24', label: '24 hours' }, { id: '48', label: '48 hours' }]} /></div>
          </Card>
          <Card>
            <CardHeader title="Why we hold reviews" subtitle="The checks that keep the public page fair" />
            <ul className="set__reasons">
              <li><Icon name="user" size={14} /> Personal details in the text</li>
              <li><Icon name="file" size={14} /> Not about the booked job</li>
              <li><Icon name="alert" size={14} /> Abusive language</li>
              <li><Icon name="clock" size={14} /> No matching booking</li>
              <li><Icon name="chart" size={14} /> Money still in dispute</li>
            </ul>
            <p className="set__note muted">Everything else stays public — even when it is harsh.</p>
          </Card>
        </div>
      ) : null}

      {active === 'notifications' ? (
        <Card>
          <CardHeader title="Notifications" subtitle="What lands in the bell and your inbox" />
          {([['newReview', 'New reviews', 'A review arrives for any pro.'], ['mentions', 'Mentions', 'A teammate mentions you in a note.'], ['docs', 'Documents', 'A pro uploads a verification document.'], ['digest', 'Morning digest', 'A short summary at the start of the day.']] as const).map(([key, label, body]) => (
            <div className="row-set" key={key}>
              <span className="cell__text"><b>{label}</b><small>{body}</small></span>
              <Switch checked={Boolean(prefs[key])} onChange={(value) => update(key, value)} label={label} />
            </div>
          ))}
        </Card>
      ) : null}

      {active === 'data' ? (
        <Card>
          <CardHeader title="Data" subtitle="Keep a copy of the desk, or start a new session" />
          <div className="row-set"><span className="cell__text"><b>Export reviews</b><small>Every review, reply and flag as CSV.</small></span><Button icon="download" onClick={() => onToast('reviews.csv downloaded')}>Export</Button></div>
          <div className="row-set"><span className="cell__text"><b>Export clients and pros</b><small>Names, towns and join dates.</small></span><Button icon="download" onClick={() => onToast('people.csv downloaded')}>Export</Button></div>
          <div className="row-set"><span className="cell__text"><b>Reset demo data</b><small>Return to the original Handwell snapshot.</small></span><Button icon="refresh" onClick={() => { localStorage.removeItem('raveno:data'); onToast('Demo data reset'); }}>Reset</Button></div>
        </Card>
      ) : null}
    </div>
  );
}
