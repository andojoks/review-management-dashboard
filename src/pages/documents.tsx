import { useMemo, useRef, useState } from 'react';
import { documentsData, documentKindIcons, type VerificationRow } from '@/ui/data/documents';
import {
  Avatar, Button, Card, DataTable, Empty, Icon, PageHeader, Pill, SearchField,
  Segmented, Tabs,
} from '@/ui/components';
import { iconPop, query, reveal, rise, useFlip, usePageMotion } from '@/ui/motion/interactions';

export function Documents({
  onToast, sub = 'library', detailId,
}: { onToast: (message: string) => void; sub?: string; detailId?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const [folder, setFolder] = useState('all');
  const [view, setView] = useState('grid');
  const [queryText, setQueryText] = useState('');
  const [show, setShow] = useState('pending');
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const tab = sub === 'verification' ? 'verification' : 'library';

  const capture = useFlip(grid, '.dtile2', [folder, queryText, view]);
  const change = (update: () => void) => { capture(); update(); };

  const files = useMemo(() => {
    const term = queryText.trim().toLowerCase();
    return documentsData.files
      .filter((doc) => (folder === 'starred' ? doc.starred : folder === 'all' || doc.folder === folder))
      .filter((doc) => !term || doc.name.toLowerCase().includes(term));
  }, [folder, queryText]);

  const rows = useMemo(() => documentsData.verifications
    .map((row) => ({ ...row, status: decisions[row.id] ?? row.status }))
    .filter((row) => show === 'all' || row.status === 'pending'), [decisions, show]);
  const pending = rows.filter((row) => row.status === 'pending').length;

  usePageMotion(root, (page) => {
    reveal(query(page, '.card, .dtile2'), { stagger: .03 });
    rise(query(page, 'tbody tr'), { delay: .2, stagger: .03 });
  }, [tab]);

  const decide = (row: VerificationRow, approved: boolean) => {
    setDecisions((current) => ({ ...current, [row.id]: approved ? 'approved' : 'rejected' }));
    onToast(`${row.kind} for ${row.pro} ${approved ? 'approved' : 'sent back'}`);
  };

  const selected = detailId ? documentsData.files.find((doc) => doc.id === detailId) : undefined;

  return (
    <div className="page docs" ref={root}>
      <PageHeader
        title="Documents"
        description="Policies, reports and templates for the team, and the papers every pro must send before going live."
        actions={
          <Button variant="primary" className="magnetic" icon="upload" onClick={() => onToast('Upload picker opened')}>
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
                    <Avatar initials={row.proInitials} />
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
                  <Pill tone={row.status === 'approved' ? 'good' : row.status === 'rejected' ? 'bad' : 'warn'}>
                    {row.status === 'approved' ? 'Approved' : row.status === 'rejected' ? 'Sent back' : 'To check'}
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
                    <Button className="btn--sm" onClick={() => decide(row, false)}>Send back</Button>
                    <Button variant="primary" className="btn--sm" icon="check" onClick={() => decide(row, true)}>Approve</Button>
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
              {documentsData.folders.map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  aria-pressed={folder === entry.id}
                  onClick={(event) => {
                    iconPop(event.currentTarget);
                    change(() => setFolder(entry.id));
                  }}
                >
                  <Icon name={entry.icon} /><span>{entry.label}</span><small>{entry.count}</small>
                </button>
              ))}
            </nav>
            <div className="lib__store">
              <small>Storage</small>
              <span className="meter"><i style={{ transform: `scaleX(${documentsData.storageRatio})` }} /></span>
              <small><b>{documentsData.storage}</b> of 50 MB</small>
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

            {selected ? (
              <Card className="doc-preview">
                <div className="chead">
                  <div className="chead__text">
                    <h2>{selected.name}</h2>
                    <p>{selected.size} · {selected.updated} · {selected.owner}</p>
                  </div>
                  <Button icon="download" onClick={() => onToast(`${selected.name} downloaded`)}>Download</Button>
                </div>
                <a className="linkbtn" href="#/documents/library">Back to library</a>
              </Card>
            ) : null}

            <div className={`lib__files is-${view}`} ref={grid}>
              {files.map((doc) => (
                <article className="dtile2" data-flip-id={doc.id} key={doc.id}>
                  <span className={`dtile2__ico is-${doc.kind}`}>
                    <Icon name={documentKindIcons[doc.kind] ?? 'file'} />
                  </span>
                  <span className="dtile2__text">
                    <b>{doc.name}</b>
                    <small>{doc.kind.toUpperCase()} · {doc.size} · {doc.updated}</small>
                  </span>
                  <span className="dtile2__owner">
                    <Avatar initials={doc.ownerInitials} size="sm" />
                    <small>{doc.owner}</small>
                  </span>
                  {doc.starred ? <Icon name="star" className="dtile2__star" /> : null}
                  <button
                    type="button"
                    className="ibtn ibtn--sm ibtn--flat dtile2__more"
                    aria-label={`Actions for ${doc.name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      onToast(`${doc.name} options opened`);
                    }}
                  ><Icon name="more" /></button>
                </article>
              ))}
            </div>

            {!files.length ? (
              <Card>
                <Empty
                  icon="folder"
                  title={queryText ? 'No files match' : 'This folder is empty'}
                  body={queryText ? 'Try another word.' : 'Upload a file or star one to see it here.'}
                  action={<Button className="btn--sm" icon="upload" onClick={() => onToast('Upload picker opened')}>Upload</Button>}
                />
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
