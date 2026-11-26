export type Trade =
  | 'electric' | 'carpentry' | 'plumbing' | 'painting'
  | 'tiling' | 'roofing' | 'garden' | 'locks';

export type ReviewStatus = 'new' | 'replied' | 'flagged' | 'hidden';
export type ReviewChannel = 'app' | 'web' | 'email' | 'sms';

export interface Person {
  id: string;
  name: string;
  role: string;
  hue: number;
  email: string;
  online: boolean;
  replies: number;
  avgHours: number;
}

export type TeamMember = Person;
export type Me = Person;

export interface Pro {
  id: string;
  name: string;
  trade: Trade;
  city: string;
  hue: number;
  joined: number;
  jobs: number;
  status: 'live' | 'paused' | 'onboarding';
  step: number;
  responseRate: number;
  phone: string;
  bio: string;
}

export interface Client {
  id: string;
  name: string;
  city: string;
  hue: number;
  joined: number;
  jobs: number;
  spend: number;
  status: 'active' | 'new' | 'quiet';
  email: string;
}

export interface ReviewReply {
  by: string;
  text: string;
  t: number;
}

export interface Review {
  id: string;
  pro: string;
  client: string;
  stars: number;
  title: string;
  text: string;
  t: number;
  channel: ReviewChannel;
  status: ReviewStatus;
  job: string;
  helpful: number;
  photos: number;
  flag?: string;
  reply?: ReviewReply;
}

export interface Doc {
  id: string;
  name: string;
  kind: 'pdf' | 'doc' | 'sheet' | 'image';
  folder: string;
  size: number;
  updated: number;
  owner: string;
  starred: boolean;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Verification {
  id: string;
  pro: string;
  kind: string;
  sent: number;
  expires: number;
  status: VerificationStatus;
  file: string;
}

export type MessageFrom = 'me' | 'them';

export interface Message {
  from: MessageFrom;
  text: string;
  t: number;
  by?: string;
}

export interface Thread {
  id: string;
  who: string;
  kind: 'client' | 'pro';
  subject: string;
  unread: number;
  review?: string;
  msgs: Message[];
  archived?: boolean;
}

export interface NoticeRecord {
  id: number;
  t: number;
  title: string;
  body: string;
  icon: string;
  tone: string;
  read: boolean;
  href: string;
}

export interface History {
  months: number[];
  volume: number[];
  lastYear: number[];
  avgRating: number[];
  replyHours: number[];
}

export interface Prefs {
  autoPublish: boolean;
  profanity: boolean;
  alertStars: number;
  digest: boolean;
  mentions: boolean;
  newReview: boolean;
  docs: boolean;
  sla: number;
  signature: string;
}

export interface SettingsState {
  me: Me;
  team: TeamMember[];
  prefs: Prefs;
}

export interface Snapshot {
  v: number;
  signedIn: boolean;
  team: TeamMember[];
  pros: Pro[];
  clients: Client[];
  reviews: Review[];
  docs: Doc[];
  verifications: Verification[];
  threads: Thread[];
  notices: NoticeRecord[];
  history: History;
  prefs: Prefs;
  me: Me;
}
