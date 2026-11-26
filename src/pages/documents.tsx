import { useMemo, useRef, useState } from 'react';
import {
  useBootstrap, useConfig, useDecideVerification, useDeleteDoc, useDocs,
  useProsState, useRestoreState, useStarDoc,
} from '@/stores';
import type { Doc } from '@/types';
import { documentKindIcons, fileSize } from '@/ui/data/documents';
import { formatDate, formatDocDate, initials, shortName } from '@/ui/data/format';
import type { OpenModal } from '@/types';
import type { ToastOptions } from '@/ui/components/feedback';
import {
  Avatar, Button, Card, DataTable, Empty, Icon, MenuItem, PageHeader,
  Pill, Popover, SearchField, Segmented, Tabs,
} from '@/ui/components';
import { iconPop, query, reveal, rise, useFlip, usePageMotion } from '@/ui/motion/interactions';

type Toast = (message: string, options?: ToastOptions) => void;

export function Documents({
  onToast, openModal, sub = 'library',
}: {
  onToast: Toast;
  openModal?: OpenModal;
  sub?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const state = useBootstrap();
  const config = useConfig();
  const { docs, verifications } = useDocs();
  const { pros } = useProsState();
  const restoreState = useRestoreState();
  const decideVerification = useDecideVerification();
  const deleteDoc = useDeleteDoc();
  const starDoc = useStarDoc();
  const folders = config.documents.folders;
  const [folder, setFolder] = useState('all');
  const [view, setView] = useState('grid');
  const [queryText, setQueryText] = useState('');
  const [show, setShow] = useState('pending');
  const [menu, setMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const tab = sub === 'verification' ? 'verification' : 'library';

  const capture = useFlip(grid, '.dtile2', [folder, queryText, view, docs.length, docs.filter((doc) => doc.starred).length], {
    duration: .5,
    enterDuration: .35,
    enterScale: .9,
    leaveDuration: .2,
  });
  const change = (update: () => void) => { capture(); update(); };

  const pending = verifications.filter((row) => row.status === 'pending').length;
  const teamById = useMemo(() => new Map(state.team.map((member) => [member.id, member])), [state.team]);
  const proById = useMemo(() => new Map(pros.map((pro) => [pro.id, pro])), [pros]);

  const files = useMemo(() => {
    const term = queryText.trim().toLowerCase();
    return docs
      .filter((doc) => (folder === 'all' || (folder === 'starred' ? doc.starred : doc.folder === folder)))
      .filter((doc) => !term || doc.name.toLowerCase().includes(term))
      .slice()
      .sort((a, b) => b.updated - a.updated);
  }, [docs, folder, queryText]);

  const rows = useMemo(() => verifications
    .filter((row) => show === 'all' || row.status === 'pending')
    .slice()
    .sort((a, b) => b.sent - a.sent)
    .map((row) => {
      const pro = proById.get(row.pro);
      return {
        id: row.id,
        pro: pro?.name ?? 'Pro',
        proInitials: initials(pro?.name ?? 'Pro'),
        proHue: pro?.hue,
        kind: row.kind,
        file: row.file,
        sent: formatDate(row.sent),
        expires: formatDate(row.expires, true),
        status: row.status,
      };
    }), [verifications, show, proById]);

  usePageMotion(root, (page) => {
    reveal(query(page, '.card, .dtile2'), { stagger: .03 });
    rise(query(page, 'tbody tr'), { delay: .2, stagger: .03 });
  }, [tab]);

  const open = (kind: 'upload') => openModal?.({ kind });

  const decide = (id: string, approved: boolean) => {
    decideVerification.mutate({ id, approved }, {
      onSuccess: (result) => onToast(result.data.message, {
        warn: result.data.warn,
        undo: result.before ? () => restoreState.mutate(result.before) : undefined,
      }),
    });
  };

  const remove = (doc: Doc) => {
    change(() => {
      deleteDoc.mutate(doc.id, {
        onSuccess: (result) => onToast(`“${doc.name}” deleted`, {
          undo: () => restoreState.mutate(result.before),
        }),
      });
    });
  };

  const toggleStar = (doc: Doc) => {
    change(() => { starDoc.mutate(doc.id); });
  };

  const storedBytes = docs.reduce((sum, doc) => sum + doc.size, 0);
  const activeDoc = menu ? docs.find((doc) => doc.id === menu.id) : undefined;

  return (
    <div className="page docs" ref={root}>
      <PageHeader
        title="Documents"
        description="Policies, reports and templates for the team, and the papers every pro must send before going live."
        actions={
          <Button variant="primary" className="magnetic" icon="upload" onClick={() => open('upload')}>
            Upload
          </Button>
        }
      />
      <Tabs
        active={tab}
        items={[
          { id: 'library', label: 'Library', href: '#/documents/library' },
          { id: 'verification', label: 'Verification', href: '#/documents/verification', count: pending },
        ]}
      />

      {tab === 'verification' ? (
        <Card className="card--flush">
          <div className="chead">
            <div className="chead__text">
              <h2>Pro documents</h2>
              <p>ID, insurance, licence and background checks — a pro goes live when all four are approved</p>
            </div>
            <Segmented
              label="Show"
              value={show}
              onChange={setShow}
              options={[
                { id: 'pending', label: `To check · ${pending}` },
                { id: 'all', label: 'All' },
              ]}
            />
          </div>
          <DataTable
            className="table--stack"
            rows={rows}
            rowKey={(row) => row.id}
            empty={
              <Empty
                icon="check"
                title="All checked"
                body="New documents appear here as pros upload them."
                action={<Button className="btn--sm" onClick={() => setShow('all')}>Show all</Button>}
              />
            }
            columns={[
              {
                key: 'pro',
                header: 'Pro',
                className: 'm-main',
                render: (row) => (
                  <span className="cell">
                    <Avatar initials={row.proInitials} hue={row.proHue} />
                    <span className="cell__text"><b>{row.pro}</b><small>{row.kind}</small></span>
                  </span>
                ),
              },
              { key: 'kind', header: 'Document', render: (row) => row.kind },
              {
                key: 'file',
                header: 'File',
                headerClassName: 'hide-sm',
                className: 'muted hide-sm',
                render: (row) => (
                  <button type="button" className="copybtn" onClick={() => onToast(`${row.file} opened`)}>
                    <Icon name="file" />{row.file}
                  </button>
                ),
              },
              { key: 'sent', header: 'Sent', className: 'muted d-cell', render: (row) => row.sent },
              {
                key: 'expires',
                header: 'Expires',
                className: 'muted m-sub',
                render: (row) => <><span className="m-only">Sent {row.sent} · </span>expires {row.expires}</>,
              },
              {
                key: 'status',
                header: 'Status',
                className: 'm-end',
                render: (row) => (
                  <Pill tone={config.documents.statusLabels[row.status]?.tone ?? 'warn'}>
                    {config.documents.statusLabels[row.status]?.label ?? 'To check'}
                  </Pill>
                ),
              },
              {
                key: 'decision',
                header: 'Decision',
                headerClassName: 'r',
                className: 'r m-act',
                render: (row) => row.status === 'pending' ? (
                  <span className="row-actions">
                    <Button className="btn--sm" onClick={() => decide(row.id, false)}>Send back</Button>
                    <Button variant="primary" className="btn--sm" icon="check" onClick={() => decide(row.id, true)}>Approve</Button>
                  </span>
                ) : <span className="muted">—</span>,
              },
            ]}
          />
        </Card>
      ) : (
        <div className="lib">
          <aside className="card card--well lib__side">
            <nav className="lib__folders" aria-label="Folders">
              {folders.map((entry) => {
                const count = entry.id === 'all'
                  ? docs.length
                  : entry.id === 'starred'
                    ? docs.filter((doc) => doc.starred).length
                    : docs.filter((doc) => doc.folder === entry.id).length;
                return (
                  <button
                    type="button"
                    key={entry.id}
                    aria-pressed={folder === entry.id}
                    onClick={(event) => {
                      iconPop(event.currentTarget);
                      change(() => setFolder(entry.id));
                    }}
                  >
                    <Icon name={entry.icon ?? 'folder'} /><span>{entry.label}</span><small>{count}</small>
                  </button>
                );
              })}
            </nav>
            <div className="lib__store">
              <small>Storage</small>
              <span className="meter"><i style={{ transform: `scaleX(${storedBytes / 50000})` }} /></span>
              <small><b>{fileSize(storedBytes)}</b> of 50 MB</small>
            </div>
          </aside>

          <div className="lib__main">
            <div className="toolbar">
              <SearchField value={queryText} onChange={(value) => change(() => setQueryText(value))} placeholder="Search files" />
              <span className="toolbar__spacer" />
              <Segmented
                label="View"
                value={view}
                onChange={(value) => change(() => setView(value))}
                options={[
                  { id: 'grid', label: '', icon: 'grid', title: 'Tiles' },
                  { id: 'list', label: '', icon: 'list', title: 'List' },
                ]}
              />
            </div>

            <div className={`lib__files is-${view}`} ref={grid}>
              {files.map((doc) => {
                const owner = teamById.get(doc.owner);
                return (
                  <article className="dtile2" data-flip-id={doc.id} key={doc.id}>
                    <span className={`dtile2__ico is-${doc.kind}`}>
                      <Icon name={documentKindIcons[doc.kind] ?? 'file'} />
                    </span>
                    <span className="dtile2__text">
                      <b>{doc.name}</b>
                      <small>{doc.kind.toUpperCase()} · {fileSize(doc.size)} · {formatDocDate(doc.updated)}</small>
                    </span>
                    <span className="dtile2__owner">
                      <Avatar initials={initials(owner?.name ?? 'Team')} staff hue={owner?.hue} size="sm" />
                      <small>{shortName(owner?.name ?? 'Team')}</small>
                    </span>
                    {doc.starred ? <Icon name="star" className="dtile2__star" /> : null}
                    <button
                      type="button"
                      className="ibtn ibtn--sm ibtn--flat dtile2__more"
                      aria-label={`Actions for ${doc.name}`}
                      onClick={(event) => {
                        event.preventDefault();
                        setMenu({ id: doc.id, anchor: event.currentTarget });
                      }}
                    ><Icon name="more" /></button>
                  </article>
                );
              })}
            </div>

            {!files.length ? (
              <Card>
                <Empty
                  icon="folder"
                  title={queryText ? 'No files match' : 'This folder is empty'}
                  body={queryText ? 'Try another word.' : 'Upload a file or star one to see it here.'}
                  action={<Button className="btn--sm" icon="upload" onClick={() => open('upload')}>Upload</Button>}
                />
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {menu && activeDoc ? (
        <Popover anchor={menu.anchor} align="end" label={activeDoc.name} onClose={() => setMenu(null)}>
          {(close) => {
            const run = (action: () => void) => { close(); action(); };
            return (
              <div role="menu" aria-label={activeDoc.name}>
                <MenuItem icon="download" label="Download" onClick={() => run(() => onToast(`${activeDoc.name} downloaded`))} />
                <MenuItem
                  icon="star"
                  label={activeDoc.starred ? 'Remove star' : 'Star'}
                  onClick={() => run(() => toggleStar(activeDoc))}
                />
                <MenuItem icon="link" label="Copy link" onClick={() => run(() => onToast('Link copied'))} />
                <div className="menu__sep" />
                <MenuItem icon="trash" label="Delete" danger onClick={() => run(() => remove(activeDoc))} />
              </div>
            );
          }}
        </Popover>
      ) : null}
    </div>
  );
}
