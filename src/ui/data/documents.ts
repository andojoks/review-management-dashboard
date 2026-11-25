import { sourceSnapshot } from '@/data/source';
import type { IconName } from '@/ui/components';
import { formatDate, formatDocDate, shortName } from './format';

export interface DocumentFolder {
  id: string;
  label: string;
  icon: IconName;
  count: number;
}

export interface DocumentFile {
  id: string;
  name: string;
  kind: string;
  folder: string;
  size: string;
  updated: string;
  owner: string;
  ownerInitials: string;
  starred: boolean;
}

export interface VerificationRow {
  id: string;
  pro: string;
  proInitials: string;
  kind: string;
  file: string;
  sent: string;
  expires: string;
  status: string;
}

export const fileSize = (kilobytes: number) =>
  kilobytes >= 1000 ? `${(kilobytes / 1000).toFixed(1)} MB` : `${kilobytes} KB`;

export const documentKindIcons: Record<string, IconName> = {
  pdf: 'file',
  sheet: 'sheet',
  image: 'image',
  doc: 'note',
};

const usedBytes = sourceSnapshot.docs.reduce((sum, doc) => sum + doc.size, 0);
const teamById = new Map(sourceSnapshot.team.map((member) => [member.id, member]));
const proById = new Map(sourceSnapshot.pros.map((pro) => [pro.id, pro]));

const initialsOf = (name: string) =>
  name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export const documentsData = {
  folders: [
    { id: 'all', label: 'All files', icon: 'folder' },
    { id: 'starred', label: 'Starred', icon: 'star' },
    { id: 'policies', label: 'Policies', icon: 'shield' },
    { id: 'reports', label: 'Reports', icon: 'chart' },
    { id: 'contracts', label: 'Contracts', icon: 'handshake' },
    { id: 'templates', label: 'Templates', icon: 'reply' },
  ].map((folder) => ({
    ...folder,
    count: folder.id === 'all'
      ? sourceSnapshot.docs.length
      : folder.id === 'starred'
        ? sourceSnapshot.docs.filter((doc) => doc.starred).length
        : sourceSnapshot.docs.filter((doc) => doc.folder === folder.id).length,
  })) as DocumentFolder[],
  storage: fileSize(usedBytes),
  storageRatio: usedBytes / 50000,
  pendingCount: sourceSnapshot.verifications.filter((item) => item.status === 'pending').length,
  files: sourceSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    kind: doc.kind,
    folder: doc.folder,
    size: fileSize(doc.size),
    updated: formatDocDate(doc.updated),
    owner: shortName(teamById.get(doc.owner)?.name ?? 'Team'),
    ownerInitials: initialsOf(teamById.get(doc.owner)?.name ?? 'Team'),
    starred: doc.starred,
  })) as DocumentFile[],
  verifications: sourceSnapshot.verifications
    .slice()
    .sort((a, b) => b.sent - a.sent)
    .map((item) => ({
      id: item.id,
      pro: proById.get(item.pro)?.name ?? 'Pro',
      proInitials: initialsOf(proById.get(item.pro)?.name ?? 'Pro'),
      kind: item.kind,
      file: item.file,
      sent: formatDate(item.sent),
      expires: formatDate(item.expires, true),
      status: item.status,
    })) as VerificationRow[],
};
