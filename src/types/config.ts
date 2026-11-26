import type { ModalRequest } from './app';
import type { IconName, Tone } from './ui';
import type { Prefs, ReviewChannel } from './domain';

export interface Option<T extends string = string> {
  id: T;
  label: string;
  icon?: IconName;
  title?: string;
}

export interface PaletteConfig {
  avatarHueVars: string[];
  channelColors: string[];
  statusTone: Record<string, Tone>;
  sentimentTone: Record<string, Tone>;
}

export interface ReviewsConfig {
  starFilters: number[];
  sortOptions: Option<'old' | 'new' | 'low'>[];
  channels: Record<ReviewChannel, { label: string; icon: IconName }>;
  flagReasons: string[];
  templates: {
    positive: string[];
    mixed: string[];
    negative: string[];
  };
  signatureDefault: string;
}

export interface ProsConfig {
  progressSteps: string[];
  actionLabels: string[];
  tradeLabels: Record<string, string>;
  tradeIcons: Record<string, IconName>;
  starMix: number[];
}

export interface DocumentsConfig {
  folders: Option[];
  statusLabels: Record<string, { label: string; tone: Tone }>;
}

export interface InboxConfig {
  kindFilters: Option[];
  replies: string[];
  autoReplyIndex: number;
  typingDelay: number;
  replyDelay: number;
}

export interface SettingsConfig {
  tabs: Option[];
  accessLevels: string[];
  themeOptions: Option[];
  slaOptions: Option[];
  heldReasons: string[];
  prefGroups: Array<{
    id: string;
    title: string;
    items: Array<{
      key: keyof Prefs;
      label: string;
      description?: string;
      onMessage?: string;
      offMessage?: string;
    }>;
  }>;
}

export interface HelpConfig {
  faqs: Array<{ id: string; question: string; answer: string }>;
  tickets: Array<{ subject: string; time: number }>;
}

export interface ClientsConfig {
  statusFilters: Option[];
  reviewFolders: Record<string, string>;
  exportMessage: string;
}

export interface InsightsConfig {
  ratingBuckets: number[];
  periodLabels: string[];
  tradeOffsets: Record<string, number>;
}

export interface NavigationConfig {
  primary: Array<{ id: string; label: string; href: string; icon: IconName }>;
  support: Array<{ id: string; label: string; href: string; icon: IconName }>;
}

export interface ModalsConfig {
  reviewMethods: Option[];
  uploadFolders: Option[];
  defaultUploadFolder: string;
  documentKindsByFolder: Record<string, string>;
  inviteCities: string[];
  verificationKinds: string[];
  reviewNotice: { icon: IconName; tone: Tone; title: string };
  defaultProTrade: string;
  defaultProCity: string;
}

export interface FinderConfig {
  actions: Array<{ label: string; icon: IconName; modal: ModalRequest['kind'] }>;
  limits: { pros: number; prosPicked: number; reviews: number; clients: number; documents: number };
}

export interface LiveFeedConfig {
  firstDelay: number;
  interval: number;
  startIndex: number;
  channel: string;
  notice: { icon: IconName; tone: Tone; href: string };
  items: Array<{ stars: number; title: string; text: string }>;
  jobsByTrade: Record<string, string>;
}

/** Runtime configuration served by the mock backend for data-driven options and operations. */
export interface AppConfig {
  palette: PaletteConfig;
  navigation: NavigationConfig;
  modals: ModalsConfig;
  finder: FinderConfig;
  liveFeed: LiveFeedConfig;
  clients: ClientsConfig;
  reviews: ReviewsConfig;
  pros: ProsConfig;
  documents: DocumentsConfig;
  inbox: InboxConfig;
  settings: SettingsConfig;
  help: HelpConfig;
  insights: InsightsConfig;
  overview: {
    starMix: number[];
    heroCompare: number[];
    metrics: Array<{
      id: 'reviews' | 'replies' | 'low' | 'photos';
      label: string;
      icon: IconName;
      note: string;
      delta: number;
      invert?: boolean;
    }>;
  };
}
