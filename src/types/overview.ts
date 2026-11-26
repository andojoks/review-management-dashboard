import type { IconName } from './ui';
import type { Client, History, Review, Pro, Verification, TeamMember } from './domain';

export interface OverviewConfig {
  channels: Record<string, { label: string; icon: IconName }>;
  channelColors: string[];
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
}

export interface OverviewMetric {
  id: 'reviews' | 'replies' | 'low' | 'photos';
  label: string;
  icon: IconName;
  value: number;
  delta: number;
  invert?: boolean;
  note: string;
  values: number[];
}

export interface OverviewStarMix {
  stars: number;
  count: number;
  percent: string;
}

export interface OverviewChannel {
  key: string;
  label: string;
  icon: IconName;
  count: number;
  color: string;
  percent: string;
}

export interface OverviewPro {
  id: string;
  name: string;
  trade: string;
  rating: number;
  count: number;
}

export interface OverviewReply {
  id: string;
  initials: string;
  name: string;
  pro: string;
  time: string;
  stars: number;
  tone: 'good' | 'warn' | 'bad';
  sentiment: 'Praise' | 'Mixed' | 'Complaint';
}

export interface OverviewQueueItem {
  id: string;
  title: string;
  client: string;
  pro: string;
  time: string;
  stars: number;
}

export interface OverviewInput {
  userName: string;
  reviews: Review[];
  pros: Pro[];
  verifications: Verification[];
  team: TeamMember[];
  clients: Client[];
  history: History;
  config: OverviewConfig;
}
