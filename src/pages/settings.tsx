import { useRef, useState, type FormEvent } from 'react';
import { initialTheme } from '@/hooks/useTheme';
import { useConfig, useResetDemo, useReviews, useSettings, useUpdateSettings } from '@/stores';
import type { Prefs } from '@/types';
import { chipShake, query as domQuery, recordMode, reveal, rise, usePageMotion } from '@/ui/motion/interactions';
import { formatHours, formatNumber, initials } from '@/ui/data/format';
import type { OpenModal } from '@/types';
import type { ToastOptions } from '@/ui/components/feedback';
import type { ThemeChoice } from '@/types';
import {
  Avatar, ConfirmDialog, Icon, PageHeader, Pill, Segmented, SelectField,
  Stepper, Switch, Tabs,
} from '@/ui/components';

type Toast = (message: string, options?: ToastOptions) => void;

export function Settings({
  onToast, openModal, sub = 'profile', setThemeChoice,
}: {
  onToast: Toast;
  openModal?: OpenModal;
  sub?: string;
  setThemeChoice?: (theme: ThemeChoice) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const config = useConfig();
  const tabs = config.settings.tabs;
  const active = tabs.some((tab) => tab.id === sub) ? sub : 'profile';
  const settings = useSettings();
  const reviews = useReviews();
  const saveSettings = useUpdateSettings();
  const resetDemo = useResetDemo();
  const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
  const { me, team, prefs } = settings;
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [signature, setSignature] = useState(prefs.signature);
  const [access, setAccess] = useState<Record<string, string>>(() => Object.fromEntries(
    team.map((member) => [member.id, member.id === 'odile'
      ? 'Admin'
      : member.role.includes('moderator') ? 'Moderator' : 'Viewer']),
  ));
  const [confirmReset, setConfirmReset] = useState(false);
  const [appearanceTheme, setAppearanceTheme] = useState<ThemeChoice>(initialTheme);
  const form = useRef<HTMLFormElement>(null);

  usePageMotion(root, (page) => {
    reveal(domQuery(page, '.card'), { stagger: .06 });
    rise(domQuery(page, '.row-set'), { y: 10, delay: .2, stagger: .03 });
  }, [active]);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 3 || !email.includes('@')) {
      chipShake(form.current?.querySelector('.input') ?? null);
      onToast('Check your name and email', { warn: true });
      return;
    }
    saveSettings.mutate({
      name: name.trim(),
      email: email.trim(),
      teamName: name.trim(),
      signature,
    });
    onToast('Profile saved');
  };

  const changePrefs = (mutate: (draft: Prefs) => void, message: string) => {
    const draft = clone(prefs);
    mutate(draft);
    saveSettings.mutate({ prefs: draft });
    onToast(message);
  };

  const accessFor = (member: (typeof team)[number]) => access[member.id] ?? (
    member.id === 'odile' ? 'Admin' : member.role.includes('moderator') ? 'Moderator' : 'Viewer'
  );

  return (
    <div className="page set" ref={root}>
      <PageHeader title="Settings" description="Your profile, the team, and how the desk handles reviews." />
      <Tabs active={active} items={tabs.map((tab) => ({ ...tab, href: `#/settings/${tab.id}` }))} />

      {active === 'profile' ? (
        <div className="set__grid">
          <form className="card" ref={form} onSubmit={saveProfile}>
            <div className="chead">
              <div className="chead__text">
                <h2>Your profile</h2>
                <p>How you appear on replies and in the team</p>
              </div>
            </div>
            <div className="set__me">
              <Avatar initials={initials(me.name)} size="xl" staff hue={me.hue} />
              <div><b>{me.name}</b><small className="muted">{me.role}</small></div>
            </div>
            <div className="formgrid">
              <label className="field">
                <span>Name</span>
                <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="field">
                <span>Email</span>
                <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="field span2">
                <span>Reply signature</span>
                <input className="input" value={signature} onChange={(event) => setSignature(event.target.value)} />
                <small>Added under your public replies when you tick “Add my signature”.</small>
              </label>
            </div>
            <div className="formfoot"><button type="submit" className="btn btn--primary">Save profile</button></div>
          </form>
          <section className="card card--well">
            <div className="chead">
              <div className="chead__text">
                <h2>Your month</h2>
                <p>November so far</p>
              </div>
            </div>
            <div className="dstats dstats--well">
              <div><small>Replies</small><b>{formatNumber(me.replies)}</b></div>
              <div><small>Median reply</small><b>{formatHours(me.avgHours)}</b></div>
              <div><small>Held reviews</small><b>11</b></div>
            </div>
            <p className="muted set__note">You answer faster than the team’s median. Keep the queue under a day and Handwell’s rating badge stays green on every pro page.</p>
          </section>
        </div>
      ) : null}

      {active === 'team' ? (
        <section className="card card--flush">
          <div className="chead">
            <div className="chead__text">
              <h2>Team</h2>
              <p>{team.length} people on the trust desk</p>
            </div>
            <button type="button" className="btn btn--sm btn--primary" onClick={() => openModal?.({ kind: 'inviteTeammate' })}>
              <Icon name="userPlus" /> Invite
            </button>
          </div>
          <div className="table-wrap">
            <table className="table table--stack">
              <thead><tr><th>Name</th><th>Job</th><th>Access</th><th>Status</th></tr></thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.id}>
                    <td className="m-main">
                      <span className="cell">
                        <Avatar initials={initials(member.name)} staff online={member.online} hue={member.hue} />
                        <span className="cell__text"><b>{member.name}</b><small>{member.email}</small></span>
                      </span>
                    </td>
                    <td className="muted m-sub">{member.role}</td>
                    <td className="m-act">
                      <select
                        className="select select--sm"
                        aria-label={`Access for ${member.name}`}
                        disabled={member.id === 'odile'}
                        value={accessFor(member)}
                        onChange={(event) => {
                          const value = event.target.value;
                          setAccess((current) => ({ ...current, [member.id]: value }));
                          onToast(`${member.name} is now ${value}`);
                        }}
                      >
                        {config.settings.accessLevels.map((level) => <option key={level}>{level}</option>)}
                      </select>
                    </td>
                    <td className="m-end">
                      <Pill tone={member.online ? 'good' : 'plain'}>{member.online ? 'Online' : 'Away'}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {active === 'rules' ? (
        <div className="set__grid">
          <section className="card">
            <div className="chead">
              <div className="chead__text">
                <h2>Review rules</h2>
                <p>What happens to a review the moment it’s written</p>
              </div>
            </div>
            <div className="row-set">
              <span className="row-set__text">
                <b>Publish straight away</b>
                <small>Clean reviews go public at once; the rest wait in Flagged</small>
              </span>
              <Switch
                label="Publish straight away"
                checked={prefs.autoPublish}
                onChange={(checked) => changePrefs((draft) => { draft.autoPublish = checked; },
                  checked ? 'Clean reviews publish at once' : 'Every review waits for a person')}
              />
            </div>
            <div className="row-set">
              <span className="row-set__text">
                <b>Hold bad language</b>
                <small>Swearing and slurs are held for a check</small>
              </span>
              <Switch
                label="Hold bad language"
                checked={prefs.profanity}
                onChange={(checked) => changePrefs((draft) => { draft.profanity = checked; },
                  checked ? 'Bad language is held' : 'Bad language filter off')}
              />
            </div>
            <div className="row-set">
              <span className="row-set__text">
                <b>Alert me at or below</b>
                <small>Low ratings ping the desk</small>
              </span>
              <Stepper
                label="stars"
                value={prefs.alertStars}
                max={4}
                format={(value) => `${value}★`}
                onDec={() => {
                  if (prefs.alertStars <= 1) return;
                  changePrefs((draft) => { draft.alertStars -= 1; }, `Alerts at ${prefs.alertStars - 1}★ or below`);
                }}
                onInc={() => {
                  if (prefs.alertStars >= 4) return;
                  changePrefs((draft) => { draft.alertStars += 1; }, `Alerts at ${prefs.alertStars + 1}★ or below`);
                }}
              />
            </div>
            <div className="row-set">
              <span className="row-set__text">
                <b>Reply deadline</b>
                <small>Shown on the queue and in Insights</small>
              </span>
              <SelectField
                label="Reply deadline"
                value={String(prefs.sla)}
                onChange={(value) => changePrefs((draft) => { draft.sla = Number(value); }, `Reply within ${value} hours`)}
                options={config.settings.slaOptions}
              />
            </div>
          </section>
          <section className="card card--well">
            <div className="chead">
              <div className="chead__text">
                <h2>Held automatically</h2>
                <p>Reasons a review waits in Flagged</p>
              </div>
            </div>
            <ul className="set__reasons">
              {config.settings.heldReasons.map((reason) => <li key={reason}><Icon name="flag" size="sm" />{reason}</li>)}
            </ul>
          </section>
        </div>
      ) : null}

      {active === 'notifications' ? (
        <section className="card set__narrow">
          <div className="chead">
            <div className="chead__text">
              <h2>Notifications</h2>
              <p>Sent to the bell and to {me.email}</p>
            </div>
          </div>
          {([
            ['newReview', 'Every new review', 'A notice for each review as it lands'],
            ['mentions', 'Replies to me', 'When a client or pro answers your message'],
            ['docs', 'Documents to check', 'When a pro uploads ID, insurance or a licence'],
            ['digest', 'Monday digest', 'The week’s ratings by email at 8am'],
          ] as const).map(([key, label, body]) => (
            <div className="row-set" key={key}>
              <span className="row-set__text"><b>{label}</b><small>{body}</small></span>
              <Switch
                label={label}
                checked={Boolean(prefs[key])}
                onChange={(checked) => {
                  changePrefs((draft) => { draft[key] = checked; }, `${label} ${checked ? 'on' : 'off'}`);
                }}
              />
            </div>
          ))}
        </section>
      ) : null}

      {active === 'data' ? (
        <div className="set__grid">
          <section className="card">
            <div className="chead">
              <div className="chead__text">
                <h2>Appearance</h2>
                <p>Graphite on paper, or paper on graphite</p>
              </div>
            </div>
            <Segmented
              label="Theme"
              value={appearanceTheme}
              onChange={(value) => {
                const next = value as ThemeChoice;
                setAppearanceTheme(next);
                setThemeChoice?.(next);
              }}
              options={config.settings.themeOptions}
            />
          </section>
          <section className="card">
            <div className="chead">
              <div className="chead__text">
                <h2>Data</h2>
                <p>Everything in this demo lives in your browser</p>
              </div>
            </div>
            <div className="row-set">
              <span className="row-set__text"><b>Export reviews</b><small>{reviews.length} reviews as CSV</small></span>
              <button type="button" className="btn btn--sm" onClick={() => onToast('reviews.csv downloaded')}>
                <Icon name="download" /> Export
              </button>
            </div>
            <div className="row-set">
              <span className="row-set__text"><b>Reset demo data</b><small>Puts every review, pro and message back the way it started</small></span>
              <button type="button" className="btn btn--sm btn--danger" disabled={recordMode()} onClick={() => setConfirmReset(true)}>
                <Icon name="refresh" /> Reset
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {confirmReset ? (
        <ConfirmDialog
          title="Reset demo data?"
          body="Your replies, flags, uploads and messages will be undone."
          ok="Reset"
          danger
          onConfirm={() => { resetDemo.mutate(); onToast('Demo data reset'); }}
          onClose={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}
