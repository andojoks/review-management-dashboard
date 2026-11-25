import type { DocumentItem, Person, Review } from './pages/types';

export const reviews: Review[] = [
  { id: 'R-4820', initials: 'AC', title: 'Would hire again tomorrow', author: 'Ana Costa', pro: 'Sofia Lindgren', age: '20 min ago', rating: 5, tone: 'Praise' },
  { id: 'R-4819', initials: 'OP', title: 'Saved us a fortune', author: 'Owen Pryce', pro: 'Hannah Brett', age: '3 h ago', rating: 5, tone: 'Praise' },
  { id: 'R-4818', initials: 'HA', title: 'Careful with an old house', author: 'Hamza Ali', pro: 'Lena Kowalski', age: '4 h ago', rating: 4, tone: 'Mixed' },
  { id: 'R-4816', initials: 'AO', title: 'Careful with an old house', author: 'Aaliyah Okoro', pro: 'Rafael Duarte', age: '7 h ago', rating: 3, tone: 'Mixed' },
  { id: 'R-4815', initials: 'MR', title: 'Lovely to deal with', author: 'Mateo Rossi', pro: 'Sofia Lindgren', age: '9 h ago', rating: 5, tone: 'Praise' },
  { id: 'R-4808', initials: 'JS', title: 'A steady pair of hands', author: 'Juno Shaw', pro: 'Nell Ashworth', age: 'Yesterday', rating: 5, tone: 'Praise' },
  { id: 'R-4806', initials: 'RD', title: 'The job was tidy and quick', author: 'Rafael Duarte', pro: 'Callum Reid', age: 'Yesterday', rating: 4, tone: 'Praise' },
  { id: 'R-4804', initials: 'OD', title: 'Could have communicated better', author: 'Oscar Doyle', pro: 'Tom Berger', age: 'Sat, 3:14 PM', rating: 3, tone: 'Concern' },
];

export const pros: Person[] = [
  { id: 'P-01', initials: 'NA', name: 'Nell Ashworth', role: 'Gardener', reviews: 5, rating: 5.0, detail: 'North Leeds · Green spaces' },
  { id: 'P-02', initials: 'CR', name: 'Callum Reid', role: 'Tiler', reviews: 4, rating: 5.0, detail: 'Roundhay · Kitchens & baths' },
  { id: 'P-03', initials: 'LK', name: 'Lena Kowalski', role: 'Gardener', reviews: 7, rating: 4.86, detail: 'Headingley · Garden design' },
  { id: 'P-04', initials: 'SL', name: 'Sofia Lindgren', role: 'Painter', reviews: 5, rating: 4.8, detail: 'Chapel Allerton · Interiors' },
  { id: 'P-05', initials: 'RD', name: 'Rafael Duarte', role: 'Locksmith', reviews: 4, rating: 4.75, detail: 'Horsforth · Emergency callouts' },
  { id: 'P-06', initials: 'HB', name: 'Hannah Brett', role: 'Joiner', reviews: 8, rating: 4.74, detail: 'Kirkstall · Bespoke timber' },
];

export const clients: Person[] = [
  { id: 'C-01', initials: 'AC', name: 'Ana Costa', role: 'Homeowner', reviews: 2, rating: 5.0, detail: 'Leeds LS6 · Last active 20 min ago' },
  { id: 'C-02', initials: 'OP', name: 'Owen Pryce', role: 'Landlord', reviews: 4, rating: 4.8, detail: 'Leeds LS8 · Last active 3 h ago' },
  { id: 'C-03', initials: 'HA', name: 'Hamza Ali', role: 'Property manager', reviews: 6, rating: 4.7, detail: 'Leeds LS12 · Last active 4 h ago' },
  { id: 'C-04', initials: 'AO', name: 'Aaliyah Okoro', role: 'Homeowner', reviews: 1, rating: 3.0, detail: 'Leeds LS9 · Last active 7 h ago' },
  { id: 'C-05', initials: 'MR', name: 'Mateo Rossi', role: 'Homeowner', reviews: 3, rating: 5.0, detail: 'Leeds LS4 · Last active yesterday' },
];

export const documents: DocumentItem[] = [
  { id: 'DOC-15', name: 'Review request consent', type: 'Policy', owner: 'Trust team', date: 'Today, 09:16', status: 'Needs check' },
  { id: 'DOC-14', name: 'Sofia Lindgren · proof of work', type: 'Attachment', owner: 'Sofia Lindgren', date: 'Yesterday, 16:42', status: 'Needs check' },
  { id: 'DOC-13', name: 'Handwell response standards', type: 'Guide', owner: 'Odile Mensah', date: 'Yesterday, 10:22', status: 'Approved' },
  { id: 'DOC-12', name: 'Low rating follow-up flow', type: 'Workflow', owner: 'Trust team', date: 'Mon, 14:10', status: 'Draft' },
  { id: 'DOC-11', name: 'Client photo permission', type: 'Policy', owner: 'Legal', date: 'Mon, 11:44', status: 'Approved' },
];

export const metricTiles = [
  { label: 'New reviews', value: '43', delta: '↑ 12%', helper: 'last 14 days', icon: 'star', tone: 'dark' },
  { label: 'Replies sent', value: '26', delta: '↑ 18%', helper: 'by the team', icon: 'reply', tone: 'light' },
  { label: 'Low ratings', value: '5', delta: '↓ 21%', helper: 'one or two stars', icon: 'alert', tone: 'light' },
  { label: 'With photos', value: '14', delta: '↑ 7.0%', helper: 'proof of work', icon: 'image', tone: 'light' },
] as const;
