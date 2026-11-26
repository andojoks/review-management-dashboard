import type { AppConfig } from '@/types';
import { clockBase } from '@/ui/data/clock';

/**
 * Canonical runtime configuration. This is served by the mock backend and is
 * the single source for data-driven option lists and operation data.
 */
export const appConfig: AppConfig = {
  palette: {
    avatarHueVars: ['--h0', '--h1', '--h2', '--h3', '--h4', '--h5'],
    channelColors: [
      'var(--data)',
      'color-mix(in oklab, var(--data) 62%, var(--card))',
      'var(--data-2)',
      'var(--data-3)',
    ],
    statusTone: {
      active: 'good', new: 'info', quiet: 'plain',
      live: 'good', paused: 'warn', onboarding: 'info',
      approved: 'good', rejected: 'bad', pending: 'warn',
    },
    sentimentTone: { Praise: 'good', Mixed: 'warn', Complaint: 'bad' },
  },
  navigation: {
    primary: [
      { id: 'overview', label: 'Overview', href: '#/overview', icon: 'grid' },
      { id: 'insights', label: 'Insights', href: '#/insights', icon: 'chart' },
      { id: 'reviews', label: 'Reviews', href: '#/reviews/inbox', icon: 'star' },
      { id: 'pros', label: 'Pros', href: '#/pros/directory', icon: 'wrench' },
      { id: 'clients', label: 'Clients', href: '#/clients', icon: 'users' },
      { id: 'documents', label: 'Documents', href: '#/documents/library', icon: 'file' },
    ],
    support: [
      { id: 'inbox', label: 'Inbox', href: '#/inbox', icon: 'inbox' },
      { id: 'settings', label: 'Settings', href: '#/settings/profile', icon: 'gear' },
      { id: 'help', label: 'Help', href: '#/help', icon: 'help' },
    ],
  },
  modals: {
    reviewMethods: [
      { id: 'email', label: 'Email', icon: 'mail' },
      { id: 'sms', label: 'Text message', icon: 'chat' },
    ],
    uploadFolders: [
      { id: 'policies', label: 'Policies' },
      { id: 'reports', label: 'Reports' },
      { id: 'contracts', label: 'Contracts' },
      { id: 'templates', label: 'Templates' },
    ],
    defaultUploadFolder: 'reports',
    documentKindsByFolder: { reports: 'sheet', templates: 'doc' },
    inviteCities: ['Leeds', 'York', 'Harrogate', 'Bradford', 'Wakefield', 'Halifax'],
    verificationKinds: ['Photo ID', 'Liability insurance', 'Trade licence', 'Background check'],
    reviewNotice: { icon: 'send', tone: 'info', title: 'Review request sent' },
    defaultProTrade: 'electric',
    defaultProCity: 'Leeds',
  },
  finder: {
    actions: [
      { label: 'Ask for a review', icon: 'send', modal: 'review' },
      { label: 'Invite a pro', icon: 'userPlus', modal: 'invitePro' },
      { label: 'Upload document', icon: 'upload', modal: 'upload' },
      { label: 'New message', icon: 'mail', modal: 'message' },
    ],
    limits: { pros: 3, prosPicked: 6, reviews: 6, clients: 5, documents: 5 },
  },
  liveFeed: {
    firstDelay: 95_000,
    interval: 140_000,
    startIndex: 4821,
    channel: 'app',
    notice: { icon: 'star', tone: 'good', href: '#/reviews/inbox' },
    items: [
      { stars: 5, title: 'Quick, clean, friendly', text: 'In and out in two hours, everything works and he even fixed the sticky hall door for free.' },
      { stars: 4, title: 'Good job overall', text: 'Nice work and fair price. Arrived a little later than planned but called ahead.' },
      { stars: 5, title: 'Our go-to from now on', text: 'Third time using her, never disappoints. Fair, tidy and honest about what needs doing.' },
    ],
    jobsByTrade: {
      electric: 'Kitchen rewiring', carpentry: 'Built-in wardrobe', plumbing: 'Boiler service',
      painting: 'Hallway repaint', tiling: 'Shower retile', roofing: 'Slipped slates',
      garden: 'Hedge reshape', locks: 'Lock change',
    },
  },
  clients: {
    statusFilters: [
      { id: 'all', label: 'All' },
      { id: 'active', label: 'Active' },
      { id: 'new', label: 'New' },
      { id: 'quiet', label: 'Quiet' },
    ],
    reviewFolders: { new: 'inbox', replied: 'published', flagged: 'flagged', hidden: 'flagged' },
    exportMessage: 'clients.csv downloaded',
  },
  reviews: {
    starFilters: [0, 5, 4, 3, 2, 1],
    sortOptions: [
      { id: 'old', label: 'Oldest', title: 'Oldest first' },
      { id: 'new', label: 'Newest', title: 'Newest first' },
      { id: 'low', label: 'Lowest', title: 'Lowest rating first' },
    ],
    channels: {
      app: { label: 'Mobile app', icon: 'phone' },
      web: { label: 'Website', icon: 'globe' },
      email: { label: 'Email request', icon: 'mail' },
      sms: { label: 'Text link', icon: 'chat' },
    },
    flagReasons: ['Personal details', 'Off-topic', 'Abusive language', 'Possible fake', 'Dispute open'],
    templates: {
      positive: [
        'Thank you, {client}! We’ve passed this to {pro}, who was really pleased to read it.',
        'So glad the {job} went well, {client}. Reviews like this help neighbours find good trades.',
      ],
      mixed: [
        'Thanks for the honest review, {client}. We’ve shared your point with {pro} so the next visit runs smoother.',
        'Thank you, {client}. If anything is still not right with the {job}, reply here and we’ll sort it.',
      ],
      negative: [
        'We’re sorry, {client} — this isn’t the standard we expect. Our disputes team will call you today to put it right.',
        'Thank you for telling us, {client}. We’ve paused new bookings for {pro} while we look into the {job}.',
      ],
    },
    signatureDefault: 'Odile, Handwell',
  },
  pros: {
    progressSteps: ['Applied', 'ID checked', 'Insured', 'Licence', 'Live'],
    actionLabels: ['Check photo ID', 'Check insurance', 'Check licence', 'Run background check'],
    tradeLabels: {
      electric: 'Electrician', carpentry: 'Carpenter', plumbing: 'Plumber', painting: 'Painter',
      tiling: 'Tiler', roofing: 'Roofer', garden: 'Gardener', locks: 'Locksmith',
    },
    tradeIcons: {
      electric: 'bolt', carpentry: 'chair', plumbing: 'drop', painting: 'pen',
      tiling: 'grid', roofing: 'home', garden: 'leaf', locks: 'key',
    },
    starMix: [5, 4, 3, 2, 1],
  },
  documents: {
    folders: [
      { id: 'all', label: 'All files', icon: 'folder' },
      { id: 'starred', label: 'Starred', icon: 'star' },
      { id: 'policies', label: 'Policies', icon: 'shield' },
      { id: 'reports', label: 'Reports', icon: 'chart' },
      { id: 'contracts', label: 'Contracts', icon: 'handshake' },
      { id: 'templates', label: 'Templates', icon: 'reply' },
    ],
    statusLabels: {
      approved: { label: 'Approved', tone: 'good' },
      rejected: { label: 'Sent back', tone: 'bad' },
      pending: { label: 'To check', tone: 'warn' },
    },
  },
  inbox: {
    kindFilters: [
      { id: 'all', label: 'All' },
      { id: 'client', label: 'Clients' },
      { id: 'pro', label: 'Pros' },
    ],
    replies: [
      'Thanks, that’s really helpful.',
      'Perfect — I’ll keep an eye out for it.',
      'Brilliant, thank you for sorting it so quickly.',
      'Okay, will do. Speak soon.',
    ],
    autoReplyIndex: 0,
    typingDelay: 900,
    replyDelay: 2700,
  },
  settings: {
    tabs: [
      { id: 'profile', label: 'Profile' },
      { id: 'team', label: 'Team' },
      { id: 'rules', label: 'Review rules' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'data', label: 'Data' },
    ],
    accessLevels: ['Admin', 'Moderator', 'Viewer'],
    themeOptions: [
      { id: 'light', label: 'Light', icon: 'sun' },
      { id: 'dark', label: 'Dark', icon: 'moon' },
      { id: 'system', label: 'System', icon: 'monitor' },
    ],
    slaOptions: [
      { id: '12', label: '12h' }, { id: '24', label: '24h' }, { id: '48', label: '48h' },
    ],
    heldReasons: [
      'Personal details — phone numbers, addresses',
      'Off-topic — not about the job',
      'Abusive language',
      'Possible fake — no booking found',
      'Dispute open — money still in question',
    ],
    prefGroups: [
      {
        id: 'rules', title: 'Review rules',
        items: [
          {
            key: 'autoPublish', label: 'Publish straight away',
            description: 'Clean reviews go public at once; the rest wait in Flagged',
            onMessage: 'Clean reviews publish at once', offMessage: 'Every review waits for a person',
          },
          {
            key: 'profanity', label: 'Hold bad language',
            description: 'Swearing and slurs are held for a check',
            onMessage: 'Bad language is held', offMessage: 'Bad language filter off',
          },
          {
            key: 'alertStars', label: 'Alert me at or below',
            description: 'Low ratings ping the desk',
          },
          {
            key: 'sla', label: 'Reply deadline',
            description: 'Shown on the queue and in Insights',
          },
        ],
      },
      {
        id: 'notifications', title: 'Notifications',
        items: [
          { key: 'newReview', label: 'Every new review', description: 'A notice for each review as it lands' },
          { key: 'mentions', label: 'Replies to me', description: 'When a client or pro answers your message' },
          { key: 'docs', label: 'Documents to check', description: 'When a pro uploads ID, insurance or a licence' },
          { key: 'digest', label: 'Monday digest', description: 'The week’s ratings by email at 8am' },
        ],
      },
    ],
  },
  help: {
    faqs: [
      {
        id: 'faq-1', question: 'When should a review be flagged?',
        answer: 'Hold a review when it shares personal details, is not about the job, uses abusive language, has no matching booking, or is about money still in dispute. Everything else stays public — even when it is harsh.',
      },
      {
        id: 'faq-2', question: 'Can a client change their review?',
        answer: 'Yes. Ask them to open the link in their booking email again; the new version replaces the old one and the history is kept for the team.',
      },
      {
        id: 'faq-3', question: 'How fast should we reply?',
        answer: 'Within the reply deadline in Settings › Review rules (24 hours by default). The queue sorts oldest first so nothing slips.',
      },
      {
        id: 'faq-4', question: 'What makes a pro go live?',
        answer: 'Four approved documents: photo ID, liability insurance, a trade licence and a background check. Approving the last one puts them live automatically.',
      },
      {
        id: 'faq-5', question: 'Does removing a review change the rating?',
        answer: 'Yes — a removed review stops counting toward the pro’s average straight away. Restoring it brings it back.',
      },
      {
        id: 'faq-6', question: 'Can pros reply to reviews themselves?',
        answer: 'Not yet. Pros message the desk from their app and we post the public reply, so every answer keeps the same tone.',
      },
    ],
    tickets: [
      { subject: 'Text-link reviews arrive without a job name', time: clockBase - 2 * 86_400_000 },
    ],
  },
  insights: {
    ratingBuckets: [5, 4, 3, 2, 1],
    periodLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    tradeOffsets: {
      electric: 0.06, carpentry: 0.09, plumbing: -0.11, painting: 0.04,
      tiling: 0.02, roofing: -0.16, garden: 0.12, locks: -0.05,
    },
  },
  overview: {
    starMix: [5, 4, 3, 2, 1],
    heroCompare: [3.98, 4.01, 3.99, 4.04, 4.06, 4.05, 4.09, 4.11, 4.1, 4.13, 4.15, 4.17],
    metrics: [
      { id: 'reviews', label: 'New reviews', icon: 'star', delta: .12, note: 'last 14 days' },
      { id: 'replies', label: 'Replies sent', icon: 'reply', delta: .18, note: 'by the team' },
      { id: 'low', label: 'Low ratings', icon: 'alert', delta: -.21, invert: true, note: 'one or two stars' },
      { id: 'photos', label: 'With photos', icon: 'image', delta: .07, note: 'proof of work' },
    ],
  },
};

export const tradeLabels = appConfig.pros.tradeLabels;
