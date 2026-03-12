import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type StackItem = {
  name: string;
  icon: string;
  bg: string;
};

type SkillItem = {
  label: string;
  icon?: string;
  token?: string;
};

type ProjectProofLink = {
  label: string;
  url: string;
  kind: 'live' | 'docs' | 'repo';
};

type ProjectMediaCropRule = {
  fit?: 'cover' | 'contain';
  position?: string;
  scale?: number;
  origin?: string;
};

type ProjectMediaCrop = {
  hero?: ProjectMediaCropRule;
  card?: ProjectMediaCropRule;
  gallery?: ProjectMediaCropRule;
};

type ProjectMediaFrame = 'desktop' | 'mobile' | 'poster';
type ProjectMediaPresentation = 'wide' | 'tall' | 'poster';

type ProjectMediaItem = {
  src: string;
  label: string;
  frame: ProjectMediaFrame;
  presentation: ProjectMediaPresentation;
  viewerLabel: string;
  crop?: ProjectMediaCrop;
};

type ProjectMediaBuildConfig = {
  folder: string;
  frame: ProjectMediaFrame;
  entries: Array<number | string>;
  labelPrefix: string;
  presentation?: ProjectMediaPresentation;
  viewerLabel?: string;
  cropByIndex?: (index: number) => ProjectMediaCrop | undefined;
};

const PROJECT_MEDIA_FRAME_ORDER: ProjectMediaFrame[] = ['desktop', 'mobile', 'poster'];

const getDefaultMediaPresentation = (frame: ProjectMediaFrame): ProjectMediaPresentation => {
  switch (frame) {
    case 'mobile':
      return 'tall';
    case 'poster':
      return 'poster';
    default:
      return 'wide';
  }
};

const getDefaultViewerLabel = (frame: ProjectMediaFrame): string => {
  switch (frame) {
    case 'mobile':
      return 'Mobile App';
    case 'poster':
      return 'Scene';
    default:
      return 'Web App';
  }
};

const buildMediaCrop = (overrides: ProjectMediaCrop = {}): ProjectMediaCrop => ({
  hero: {
    fit: 'cover',
    position: 'center top',
    scale: 1,
    origin: 'center center',
    ...(overrides.hero ?? {}),
  },
  card: {
    fit: 'cover',
    position: 'center top',
    scale: 1,
    origin: 'center center',
    ...(overrides.card ?? {}),
  },
  gallery: {
    fit: 'contain',
    position: 'center center',
    scale: 1,
    origin: 'center center',
    ...(overrides.gallery ?? {}),
  },
});

const buildProjectMedia = (
  config: ProjectMediaBuildConfig,
): ProjectMediaItem[] =>
  config.entries.map((entry, index) => ({
    src: `assets/${config.folder}/${entry}.png`,
    label: `${config.labelPrefix} ${String(index + 1).padStart(2, '0')}`,
    frame: config.frame,
    presentation: config.presentation ?? getDefaultMediaPresentation(config.frame),
    viewerLabel: config.viewerLabel ?? getDefaultViewerLabel(config.frame),
    crop: config.cropByIndex?.(index),
  }));

const buildRepairMediaCrop = (_screenNumber: number): ProjectMediaCrop =>
  buildMediaCrop({
    hero: { fit: 'contain', position: 'center top', scale: 1, origin: 'center top' },
    card: { fit: 'contain', position: 'center top', scale: 1, origin: 'center top' },
    gallery: { fit: 'contain', position: 'center top', scale: 1, origin: 'center top' },
  });

const buildUiMediaCrop = (_screenNumber: number): ProjectMediaCrop =>
  buildMediaCrop({
    hero: { fit: 'contain', position: 'center center', scale: 1, origin: 'center center' },
    card: { fit: 'contain', position: 'center center', scale: 1, origin: 'center center' },
  });

const buildDesktopMediaCrop = (_screenNumber: number): ProjectMediaCrop => buildMediaCrop();

const buildMobileAppMediaCrop = (_screenNumber: number): ProjectMediaCrop =>
  buildMediaCrop({
    hero: { fit: 'contain', position: 'center center', origin: 'center center' },
    card: { fit: 'contain', position: 'center center', origin: 'center center' },
  });

const buildPosterMediaCrop = (_screenNumber: number): ProjectMediaCrop =>
  buildMediaCrop({
    hero: { position: 'center 18%', origin: 'center center' },
    card: { position: 'center 18%', origin: 'center center' },
  });

const REPAIR_MEDIA_ENTRIES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

type ProjectItem = {
  title: string;
  description: string;
  buildSummary: string;
  stage: string;
  timeline: string;
  scope: string;
  impact: string;
  impactMetrics: string[];
  filters: string[];
  proofLinks: ProjectProofLink[];
  role: string;
  result: string;
  tone: string;
  badges: string[];
  featuredVisualStyle?: 'standard' | 'compact';
  initialMediaIndex?: number;
  media: ProjectMediaItem[];
};

type CertificationItem = {
  title: string;
  provider: string;
  date: string;
  mark: string;
};

type ExperienceTrack = 'contract' | 'freelance' | 'internship';

type ExperienceProofSignal = {
  label: string;
  value: string;
};

type ExperienceRelatedWork = {
  label: string;
  projectTitle?: string;
};

type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  track: ExperienceTrack;
  isCurrent?: boolean;
  context: string;
  owned: string;
  impact: string;
  selectedOutcomes: string[];
  technicalDetails: string[];
  proofSignals: ExperienceProofSignal[];
  relatedWork: ExperienceRelatedWork[];
  badges: string[];
  tone: string;
};

type HeroStat = {
  label: string;
  value: string;
  tone: string;
};

type SocialLinkItem = {
  label: string;
  url: string;
  icon: string;
};

type AboutMetric = {
  label: string;
  value: string;
  tone: string;
};

type SnapshotItem = {
  label: string;
  value: string;
};

type AboutPillar = {
  token: string;
  label: string;
};

type ProofItem = {
  mark: string;
  title: string;
  detail: string;
  tone: string;
};

type StatItem = {
  label: string;
  value: string;
  tone: string;
};

type ThemeMode = 'light' | 'dark';

type ChatMessageCta = {
  label: string;
  href: string;
};

type ChatMessage = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  cta?: ChatMessageCta;
};

type ChatReply = {
  text: string;
  cta?: ChatMessageCta;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  activeSection = 'home';
  isResumePreviewOpen = false;
  isProjectGalleryOpen = false;
  isMobileMenuOpen = false;
  isPhotoRevealed = false;
  isProfileCartoonLoaded = false;
  isProfileRealLoaded = false;
  isPhoneCopied = false;
  isChatOpen = false;
  isBotTyping = false;
  chatDraft = '';
  themeMode: ThemeMode = 'light';
  activeExperienceFilter: 'all' | 'contract' | 'freelance' | 'internship' = 'all';
  areCaseNotesExpanded = false;
  readonly initialCaseNotesVisibleCount = 2;
  private navLockSection: string | null = null;
  private navLockUntil = 0;
  private trackedSections: HTMLElement[] = [];
  private revealObserver: IntersectionObserver | null = null;
  private hasAdjustedInitialHashOffset = false;
  private homeHashLockTimers: number[] = [];
  private phoneCopyTimer: number | null = null;
  private profileRealPreloadTimer: number | null = null;
  private catFrameTimer: number | null = null;
  private chatReplyTimer: number | null = null;
  private chatAutoOpenTimer: number | null = null;
  private galleryRailSyncFrame: number | null = null;
  private lastRevealViewportMode: 'mobile' | 'desktop' | null = null;
  private galleryTouchStartX: number | null = null;
  private galleryTouchStartY: number | null = null;
  private nextChatMessageId = 1;
  private catDomFrameIndex = 0;
  private activeProjectMediaIndex: Record<string, number> = {};
  private activeMobileDeviceFrame: Record<string, ProjectMediaItem['frame']> = {};
  private loadedMediaSources = new Set<string>();
  private failedMediaSources = new Set<string>();
  private preloadedMediaSources = new Set<string>();
  private expandedExperienceRoles = new Set<string>();
  private readonly themeStorageKey = 'jericho-paper-theme';
  private readonly chatFirstVisitStorageKey = 'jericho-chat-first-visit-done';
  private readonly chatAutoOpenDelayMs = 2300;
  private readonly lightThemeClass = 'paper-light';
  private readonly darkThemeClass = 'paper-dark';
  private projectGalleryFrameFilter: ProjectMediaItem['frame'] | null = null;
  private projectGalleryActiveIndex = 0;
  private readonly featuredProjectPriority = [
    'Repair Management Monitoring System',
    'Paragon S2S MMS (Enhancements and Maintenance)',
    'PSMMS Version 2 UI Build',
    "D'Speedwash App",
    'QR Code-Based Service System',
    'Bayani TTRPG',
    'Apartease',
  ];
  readonly resumeFileUrl = 'resume/JERICHO SANTOS - 2026.pdf';
  readonly resumeViewerSrc: SafeResourceUrl;
  readonly maxChatChars = 1000;
  readonly profileCartoonSrc = 'assets/profile/jericho-cartoon.png';
  readonly profileRealSrc = 'assets/profile/jericho-photo.jpg';
  @ViewChildren('catFrameEl') private catFrameEls?: QueryList<ElementRef<HTMLImageElement>>;
  @ViewChild('chatScrollContainer') private chatScrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('projectGalleryRailEl') private projectGalleryRailEl?: ElementRef<HTMLDivElement>;
  @ViewChildren('projectGalleryThumbEl')
  private projectGalleryThumbEls?: QueryList<ElementRef<HTMLButtonElement>>;
  private readonly catFrameCacheVersion = '20260303-1';
  readonly catFrameSources = Array.from(
    { length: 11 },
    (_, index) =>
      `assets/sprites/cat-frames/cat-walk-final-${index + 1}.png?v=${this.catFrameCacheVersion}`,
  );
  readonly quickChatPrompts = [
    'What tech stack do you use?',
    'Show me your strongest projects.',
    'How can I contact you?',
  ];
  readonly chatAvatarSrc = this.profileRealSrc;
  readonly chatMessages: ChatMessage[] = [
    {
      id: 1,
      sender: 'bot',
      text: "Hi there. I am Jericho's portfolio assistant. Ask me about stack, projects, AI work, or hiring/contact details.",
    },
  ];

  readonly profile = {
    name: 'Jericho Santos',
    role: 'Entry-Level Full Stack Developer',
    location: 'Valenzuela City, Philippines',
    email: 'jericho.santos1015@gmail.com',
    phone: '+63 9851569631',
  };

  readonly summary =
    'Full-Stack Developer building and supporting enterprise internal systems and end-to-end web applications. I work across frontend UI, backend APIs, SQL/reporting, and production releases, and I am now expanding into AI integration by adding intelligent features and using generative AI workflows to deliver faster, smarter products.';

  readonly socialLinks: SocialLinkItem[] = [
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/jericho-santos-560496255',
      icon: 'assets/icons/social/linkedin.svg',
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/j_ek15',
      icon: 'assets/icons/social/instagram.svg',
    },
    {
      label: 'Facebook',
      url: 'https://www.facebook.com/61581677857558',
      icon: 'assets/icons/social/facebook.svg',
    },
    {
      label: 'GitHub',
      url: 'https://github.com/ek7z',
      icon: 'assets/icons/social/github.svg',
    },
  ];

  readonly heroMotto = 'Build practical products, ship fast, and keep code maintainable.';

  readonly heroStats: HeroStat[] = [
    { label: 'Status', value: 'Open to Junior Roles', tone: 'stat-yellow' },
    { label: 'Track', value: 'Paragon Contract 2025-2026', tone: 'stat-cyan' },
    { label: 'Focus', value: 'Ops Systems + Web/Mobile Delivery', tone: 'stat-pink' },
  ];

  readonly heroChips = [
    'Enterprise Delivery',
    'SQL + Reporting',
    'Workflow Automation',
    'Hotfix Support',
  ];

  constructor(private readonly sanitizer: DomSanitizer) {
    this.resumeViewerSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.resumeFileUrl}#view=FitH`,
    );

    if (typeof window !== 'undefined') {
      const hash = window.location.hash?.replace('#', '');
      if (hash) {
        this.activeSection = hash;
      }
    }

    this.initTheme();
  }

  get isDarkPaper(): boolean {
    return this.themeMode === 'dark';
  }

  get shouldSuppressMobileChatLauncher(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      window.innerWidth <= 620 &&
      !this.isChatOpen &&
      (this.activeSection === 'projects' || this.isSectionVisible('projects'))
    );
  }

  readonly aboutCopy = [
    'I design and ship internal tools and client apps with clean UI, stable backend flows, and maintainable code.',
    'Recent work covers PSMMS maintenance, repair operations build, and QR-based web/mobile workflow delivery.',
  ];

  readonly aboutMetrics: AboutMetric[] = [
    { label: 'Delivery Model', value: 'Contract + Freelance', tone: 'metric-yellow' },
    { label: 'Active Window', value: '2024 - 2026', tone: 'metric-cyan' },
    { label: 'Core Strength', value: 'API + SQL + Reporting', tone: 'metric-pink' },
  ];

  readonly aboutSnapshot: SnapshotItem[] = [
    { label: 'Based In', value: 'Valenzuela City, PH' },
    { label: 'Primary Stack', value: 'PHP, Angular, Ionic, MySQL' },
    { label: 'Platforms', value: 'Admin Web + Mobile Apps' },
    { label: 'Team Value', value: 'Reliable Support + Fast Turnaround' },
  ];

  readonly aboutPillars: AboutPillar[] = [
    { token: 'UI', label: 'Interface Systems' },
    { token: 'API', label: 'Service Integration' },
    { token: 'DB', label: 'Data Integrity' },
    { token: 'OPS', label: 'Reporting Flow' },
  ];

  readonly quickFacts: ProofItem[] = [
    {
      mark: 'PRG',
      title: 'Paragon PSMMS Contract',
      detail: 'Delivered UI enhancements, SQL report fixes, role updates, and production hotfixes',
      tone: 'fact-yellow',
    },
    {
      mark: 'RMS',
      title: 'Repair System from Scratch',
      detail: 'Built request, dispatch, tracking, and reporting workflows for internal operations',
      tone: 'fact-green',
    },
    {
      mark: 'V2',
      title: 'PSMMS v2 UI Foundation',
      detail: 'Built reusable responsive screens using Angular + Tailwind for S2S/Bida/Fiber/SME',
      tone: 'fact-cyan',
    },
    {
      mark: 'QR',
      title: 'QR Service Platform',
      detail:
        'Shipped role-based admin + mobile workflow with booking lifecycle and status tracking',
      tone: 'fact-pink',
    },
  ];

  readonly education = {
    school: 'Pamantasan ng Lungsod ng Valenzuela',
    degree: 'Bachelor of Science in Information Technology',
    period: '2021 - 2025',
  };

  readonly featuredStack: StackItem[] = [
    { name: 'Angular', icon: 'https://cdn.simpleicons.org/angular/DD0031', bg: '#ffe6ea' },
    { name: 'Ionic', icon: 'https://cdn.simpleicons.org/ionic/3880FF', bg: '#e4edff' },
    { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/3178C6', bg: '#e1eeff' },
    { name: 'PHP', icon: 'https://cdn.simpleicons.org/php/777BB4', bg: '#ece9ff' },
    { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933', bg: '#e4ffd8' },
    { name: 'Express', icon: 'https://cdn.simpleicons.org/express/000000', bg: '#f1f1f1' },
    { name: 'MySQL', icon: 'https://cdn.simpleicons.org/mysql/4479A1', bg: '#ddf5ff' },
    { name: 'Power BI', icon: 'assets/icons/powerbi.svg', bg: '#fff8c8' },
  ];

  readonly skillGroups = [
    {
      title: 'Frontend',
      tone: 'tone-yellow',
      items: [
        { label: 'Angular', icon: 'https://cdn.simpleicons.org/angular/DD0031' },
        { label: 'Ionic', icon: 'https://cdn.simpleicons.org/ionic/3880FF' },
        { label: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/3178C6' },
        { label: 'HTML', icon: 'https://cdn.simpleicons.org/html5/E34F26' },
        { label: 'CSS', icon: 'https://cdn.simpleicons.org/css/1572B6' },
        { label: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
      ] as SkillItem[],
    },
    {
      title: 'Backend',
      tone: 'tone-cyan',
      items: [
        { label: 'PHP', icon: 'https://cdn.simpleicons.org/php/777BB4' },
        { label: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
        { label: 'Express.js', icon: 'https://cdn.simpleicons.org/express/000000' },
        { label: 'REST APIs', token: 'API' },
        { label: 'MySQL Workbench', icon: 'https://cdn.simpleicons.org/mysql/4479A1' },
      ] as SkillItem[],
    },
    {
      title: 'Data and Ops',
      tone: 'tone-pink',
      items: [
        { label: 'Power BI', icon: 'assets/icons/powerbi.svg' },
        { label: 'SQL', icon: 'https://cdn.simpleicons.org/mysql/4479A1' },
        { label: 'Data Cleaning', token: 'DC' },
        { label: 'System Administration Basics', token: 'SYS' },
      ] as SkillItem[],
    },
    {
      title: 'Core Strengths',
      tone: 'tone-green',
      items: [
        { label: 'Technical Support', token: 'TS' },
        { label: 'Troubleshooting', token: 'BUG' },
        { label: 'Technical Documentation', token: 'DOC' },
        { label: 'Analytical Problem-Solving', token: 'PS' },
      ] as SkillItem[],
    },
  ];

  readonly experienceStats: StatItem[] = [
    { label: 'Hands-on Roles', value: '3 Real-World Roles', tone: 'metric-yellow' },
    { label: 'Timeline', value: '2024 - 2026', tone: 'metric-cyan' },
    { label: 'Coverage', value: 'Enterprise + Client + Data', tone: 'metric-pink' },
  ];

  readonly experienceFilters = [
    { id: 'all', label: 'All Roles' },
    { id: 'contract', label: 'Contract' },
    { id: 'freelance', label: 'Freelance' },
    { id: 'internship', label: 'Internship' },
  ] as const;

  readonly experiences: ExperienceItem[] = [
    {
      role: 'Web Developer (Full-Stack / Contract)',
      company: 'Paragon Communication Corporation',
      period: 'September 2025 - March 2026',
      track: 'contract',
      isCurrent: true,
      context:
        'Paragon needed production-safe frontend fixes, reporting corrections, and cleaner role-based flows across aging PSMMS modules.',
      owned:
        'Owned responsive refactors, SQL/report logic fixes, permission updates, and cross-module support for repair monitoring plus PSMMS v2 UI work.',
      impact:
        'Stabilized live operational modules and shipped stakeholder-validated releases without breaking day-to-day admin workflows.',
      selectedOutcomes: [
        'Stabilized legacy PSMMS pages across mobile, tablet, and desktop views.',
        'Corrected SQL filtering and aggregation logic, then shipped date-range and status-summary reporting.',
      ],
      technicalDetails: [
        'Delivered workflow and permission updates through hotfix and release cycles with stakeholder validation before release.',
        'Supported related internal modules under the same contract, including repair monitoring and PSMMS v2 UI deliverables.',
      ],
      proofSignals: [
        { label: 'Environment', value: 'Production' },
        { label: 'Delivery', value: 'Hotfix + release cycle' },
        { label: 'Focus', value: 'Reporting + module support' },
        { label: 'Status', value: 'Current' },
      ],
      relatedWork: [
        { label: 'Paragon S2S MMS', projectTitle: 'Paragon S2S MMS (Enhancements and Maintenance)' },
        { label: 'Repair Monitoring', projectTitle: 'Repair Management Monitoring System' },
        { label: 'PSMMS V2 UI', projectTitle: 'PSMMS Version 2 UI Build' },
      ],
      badges: ['PSMMS', 'SQL Reporting', 'Role Access', 'Production Support'],
      tone: 'timeline-contract',
    },
    {
      role: 'Freelance Full-Stack Developer',
      company: 'DhongEye (QR Code-Based Service System)',
      period: 'January 2025 - Present',
      track: 'freelance',
      isCurrent: true,
      context:
        'The client needed a service platform that could unify QR booking, role-based mobile flows, and admin-side lifecycle control.',
      owned:
        'Built the admin website, role-routed mobile experiences, booking rules, OTP auth, and operational dashboards from the ground up.',
      impact:
        'Delivered a client-ready system that replaced manual coordination with a clearer end-to-end booking and status workflow.',
      selectedOutcomes: [
        'Launched QR-based service flow with admin website plus role-specific mobile experiences.',
        'Implemented OTP auth, role routing, and booking lifecycle rules with controlled edit and cancel behavior.',
      ],
      technicalDetails: [
        'Built KPI dashboard, service, user, booking, and alerts modules to support day-to-day client operations.',
        'Added pricing-lock logic and operational guardrails to reduce inconsistent booking and dispatch behavior.',
      ],
      proofSignals: [
        { label: 'Environment', value: 'Client deployment' },
        { label: 'Delivery', value: 'Greenfield build' },
        { label: 'Focus', value: 'Web + mobile platform' },
        { label: 'Status', value: 'Current' },
      ],
      relatedWork: [{ label: 'QR Service System', projectTitle: 'QR Code-Based Service System' }],
      badges: ['Web Admin', 'Mobile Apps', 'QR Workflow', 'Role Routing'],
      tone: 'timeline-freelance',
    },
    {
      role: 'OJT Intern - DevOps Team',
      company: 'D&L Industries Inc. (Bagumbayan, Quezon City)',
      period: 'July 2024 - November 2024',
      track: 'internship',
      context:
        'Operations teams needed cleaner internal reporting and better-prepared datasets for cross-department visibility.',
      owned:
        'Handled data prep, SQL extraction, and dashboard support work for internal reporting under the DevOps team.',
      impact:
        'Improved the reporting handoff pipeline and gave internal teams clearer operational data views during the internship period.',
      selectedOutcomes: [
        'Built and maintained Power BI dashboards for internal operations reporting.',
        'Prepared multi-department datasets and wrote SQL scripts for extraction, filtering, and shaping.',
      ],
      technicalDetails: [
        'Worked across data prep and reporting support tasks that exposed enterprise pipeline discipline and handoff expectations.',
        'Gained direct exposure to internal DevOps workflow practices while supporting operational reporting needs.',
      ],
      proofSignals: [
        { label: 'Environment', value: 'Enterprise ops' },
        { label: 'Delivery', value: 'Reporting support' },
        { label: 'Focus', value: 'Power BI + SQL prep' },
        { label: 'Status', value: 'Completed' },
      ],
      relatedWork: [{ label: 'Internal BI Dashboards' }],
      badges: ['Power BI', 'SQL Reporting', 'Data Prep', 'Ops Workflow'],
      tone: 'timeline-ops',
    },
  ];

  readonly certificationStats: StatItem[] = [
    { label: 'Certificates', value: '4 Completed', tone: 'metric-yellow' },
    { label: 'Focus Areas', value: 'AI + Agile + Privacy', tone: 'metric-cyan' },
  ];

  readonly certSignals: StatItem[] = [
    { label: 'Applied In', value: 'PSMMS + Client Systems', tone: 'metric-yellow' },
    { label: 'Delivery Mode', value: 'Release + Hotfix Cycles', tone: 'metric-cyan' },
    { label: 'Impact Style', value: 'Workflow + Reporting Accuracy', tone: 'metric-pink' },
  ];

  readonly certApplicationNotes = [
    'Used structured release planning and staged validation in production updates.',
    'Applied reporting and data principles to SQL filtering, aggregation, and dashboard outputs.',
  ];

  readonly projectStats: StatItem[] = [
    { label: 'Project Set', value: '7 Flagship Case Builds', tone: 'metric-yellow' },
    { label: 'Client Work', value: 'Paragon + Freelance Delivery', tone: 'metric-cyan' },
    { label: 'System Type', value: 'Web + Mobile + Ops Reporting', tone: 'metric-pink' },
  ];

  readonly projects: ProjectItem[] = [
    {
      title: 'Paragon S2S MMS (Enhancements and Maintenance)',
      description:
        'Legacy PSMMS modules had UI inconsistencies and report mismatches across operations views.',
      buildSummary:
        'Enhanced existing production modules, refined reporting screens, and tightened responsive behavior across operational workflows.',
      stage: 'Contract Delivery',
      timeline: 'Multi-release support',
      scope: 'Module Enhancements + Reporting',
      impact: 'Lower UI defects and cleaner operational decision data',
      impactMetrics: [
        '3 Reporting Additions',
        'Cross-Device Responsive',
        'Ongoing Hotfix Releases',
      ],
      filters: ['enterprise', 'web'],
      proofLinks: [{ label: 'Open Live', url: 'https://paragoncorpmms.com/', kind: 'live' }],
      role: 'Full-Stack Developer',
      result:
        'Stabilized production workflows through responsive refactors, SQL fixes, and filtered report screens.',
      tone: 'project-yellow',
      badges: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
      media: [],
    },
    {
      title: 'Repair Management Monitoring System',
      description:
        'Repair operations were tracked manually across disconnected files and status updates.',
      buildSummary:
        'Built a centralized repair, dispatch, and reporting workflow with request tracking, table views, and lifecycle visibility.',
      stage: 'Internal Deployment',
      timeline: 'Greenfield rollout',
      scope: 'Repair + Dispatch Monitoring',
      impact: 'Single source of truth for repair and dispatch progress',
      impactMetrics: ['Built from Scratch', '5 Core Modules', 'Query + Index Optimization'],
      filters: ['enterprise', 'web'],
      proofLinks: [{ label: 'Open Live', url: 'https://repair.paragoncorpmms.com/', kind: 'live' }],
      role: 'Full-Stack Developer',
      result:
        'Deployed request-to-dispatch lifecycle with tracking history, report tables, and optimized query performance.',
      tone: 'project-cyan',
      badges: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
      featuredVisualStyle: 'compact',
      media: buildProjectMedia({
        folder: 'Repair',
        frame: 'desktop',
        entries: REPAIR_MEDIA_ENTRIES,
        labelPrefix: 'Repair Screen',
        viewerLabel: 'Operations',
        presentation: 'wide',
        cropByIndex: (index) => buildRepairMediaCrop(REPAIR_MEDIA_ENTRIES[index] ?? REPAIR_MEDIA_ENTRIES[0]),
      }),
      initialMediaIndex: 0,
    },
    {
      title: 'PSMMS Version 2 UI Build',
      description:
        'PSMMS v2 needed a reusable responsive frontend baseline for multiple product lines.',
      buildSummary:
        'Designed reusable Angular layouts, shared screen patterns, and navigation structure for multiple product lines.',
      stage: 'UI Phase (Paused)',
      timeline: 'Foundation sprint',
      scope: 'Frontend Architecture',
      impact: 'Consistent layout system for faster module rollout',
      impactMetrics: ['4 Product Lines', 'Reusable Screen Patterns', 'Integration-Ready UI'],
      filters: ['enterprise', 'web'],
      proofLinks: [{ label: 'Open Live', url: 'https://test.paragoncorpmms.com/', kind: 'live' }],
      role: 'Full-Stack Developer',
      result:
        'Built reusable screens and navigation patterns, then handed off integration-ready UI before project hold.',
      tone: 'project-pink',
      badges: ['Angular', 'Tailwind'],
      initialMediaIndex: 1,
      media: buildProjectMedia({
        folder: 'Paragon V2 UI',
        frame: 'desktop',
        entries: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        labelPrefix: 'UI Screen',
        viewerLabel: 'Product UI',
        presentation: 'wide',
        cropByIndex: (index) => buildUiMediaCrop(index + 1),
      }),
    },
    {
      title: 'QR Code-Based Service System',
      description:
        'Service booking and production updates needed role-based digital flow and status visibility.',
      buildSummary:
        'Built QR-based booking, OTP login, admin controls, and role-specific mobile and web flows across the service lifecycle.',
      stage: 'Client System Deployed',
      timeline: 'Client delivery cycle',
      scope: 'QR Booking + Admin + Mobile',
      impact: 'End-to-end visibility from booking to completion',
      impactMetrics: ['4 Role Flows', 'OTP + Role Routing', 'Live Status Lifecycle'],
      filters: ['freelance', 'web', 'mobile'],
      proofLinks: [],
      role: 'Full-Stack Developer',
      result:
        'Launched QR-based platform with OTP auth, role routing, lifecycle controls, and near real-time dashboard alerts.',
      tone: 'project-yellow',
      badges: ['Ionic', 'Angular', 'Node.js', 'Express', 'MySQL'],
      media: [],
    },
    {
      title: "D'Speedwash App",
      description:
        'Carwash booking flow needed mobile-first customer scheduling with admin-side monitoring and updates.',
      buildSummary:
        'Delivered an admin portal plus a customer booking app with scheduling, queue visibility, and announcement flows.',
      stage: 'Academic Capstone',
      timeline: 'Capstone term',
      scope: 'Booking + Admin Management',
      impact: 'Reduced manual booking coordination workload',
      impactMetrics: ['Capstone Delivery', 'Mobile + Admin Flow', 'End-to-End Booking'],
      filters: ['academic', 'web', 'mobile'],
      proofLinks: [],
      role: 'Full-Stack Developer',
      result:
        'Delivered app-first booking and admin control flow to simplify customer scheduling operations.',
      tone: 'project-cyan',
      badges: ['Ionic', 'Angular', 'Node.js', 'Express', 'MySQL'],
      media: [
        ...buildProjectMedia({
          folder: 'DSpeedWash',
          frame: 'desktop',
          entries: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          labelPrefix: 'Web Admin',
          viewerLabel: 'Admin Portal',
          presentation: 'wide',
          cropByIndex: (index) => buildDesktopMediaCrop(index + 1),
        }),
        ...buildProjectMedia({
          folder: 'DSpeedWash/app',
          frame: 'mobile',
          entries: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          labelPrefix: 'Mobile App',
          viewerLabel: 'Customer App',
          presentation: 'tall',
          cropByIndex: (index) => buildMobileAppMediaCrop(index + 1),
        }),
      ],
    },
    {
      title: 'Bayani TTRPG',
      description:
        'Game project needed a strong visual identity and a presentable playable interface for the subject showcase.',
      buildSummary:
        'Designed the visual menu flow, presentation screens, and themed interface treatment for the playable showcase build.',
      stage: 'Academic Game Build',
      timeline: 'Showcase sprint',
      scope: 'Menu + Visual Presentation',
      impact: 'Stronger presentation quality for a concept-driven TTRPG project',
      impactMetrics: ['Game Subject Build', 'Menu Screen Polish', 'Lore-Driven Visual Tone'],
      filters: ['academic'],
      proofLinks: [],
      role: 'Full-Stack Developer',
      result:
        'Built and presented the Bayani TTRPG concept with a stylized start screen and world-driven visual direction.',
      tone: 'project-pink',
      badges: ['GameDev', 'TTRPG', 'Story Systems'],
      media: buildProjectMedia({
        folder: 'Bayani TTRPG',
        frame: 'poster',
        entries: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15],
        labelPrefix: 'Bayani Scene',
        viewerLabel: 'Gameplay',
        presentation: 'poster',
        cropByIndex: (index) => buildPosterMediaCrop(index + 1),
      }),
    },
    {
      title: 'Apartease',
      description:
        'Property records and apartment processes needed centralized web-based management.',
      buildSummary:
        'Built admin-side modules for apartment records, tenant handling, and day-to-day property management workflows.',
      stage: 'Web System Build',
      timeline: 'Academic build cycle',
      scope: 'Apartment Management',
      impact: 'Improved visibility of records and daily property operations',
      impactMetrics: ['Web Admin Panel', 'CRUD Operations', 'Records Centralization'],
      filters: ['academic', 'web'],
      proofLinks: [],
      role: 'Full-Stack Developer',
      result:
        'Built management website for apartment operations, records handling, and admin-side tracking.',
      tone: 'project-green',
      badges: ['HTML', 'CSS', 'JavaScript', 'PHP'],
      media: [],
    },
  ];

  readonly certifications: CertificationItem[] = [
    {
      title: 'DEEP IMPACT: The Impact of AI to the Future of Web Development',
      provider: 'PLV',
      date: 'April 2024',
      mark: 'AI',
    },
    {
      title: 'SCRUM 101: The Introduction',
      provider: 'PLV',
      date: 'April 2024',
      mark: 'SCR',
    },
    {
      title: 'DATA PRIVACY ESSENTIALS',
      provider: 'PLV',
      date: 'April 2024',
      mark: 'DP',
    },
    {
      title: 'The IT Things Called Multimedia',
      provider: 'PLV',
      date: 'April 2024',
      mark: 'MM',
    },
  ];

  projectGalleryProject: ProjectItem | null = null;
  isGalleryZoomed = false;

  setActive(sectionId: string): void {
    this.activeSection = sectionId;
  }

  setExperienceFilter(filter: string): void {
    if (
      filter === 'all' ||
      filter === 'contract' ||
      filter === 'freelance' ||
      filter === 'internship'
    ) {
      this.activeExperienceFilter = filter;
      this.refreshRevealAfterFilterChange();
    }
  }

  toggleCaseNotes(): void {
    this.areCaseNotesExpanded = !this.areCaseNotesExpanded;
    this.refreshRevealAfterFilterChange();
  }

  get filteredExperiences(): ExperienceItem[] {
    if (this.activeExperienceFilter === 'all') {
      return this.experiences;
    }

    return this.experiences.filter((exp) => exp.track === this.activeExperienceFilter);
  }

  get featuredProject(): ProjectItem | null {
    if (!this.projects.length) {
      return null;
    }

    for (const title of this.featuredProjectPriority) {
      const matchedProject = this.projects.find((project) => project.title === title);
      if (matchedProject) {
        return matchedProject;
      }
    }

    return this.projects[0] ?? null;
  }

  get secondaryProjects(): ProjectItem[] {
    const featuredProject = this.featuredProject;

    if (!featuredProject) {
      return [];
    }

    return this.projects.filter((project) => project.title !== featuredProject.title);
  }

  get visualProject(): ProjectItem | null {
    const featuredProject = this.featuredProject;
    const dSpeedwashProject =
      this.projects.find((project) => project.title === "D'Speedwash App") ?? null;

    if (!dSpeedwashProject || dSpeedwashProject.title === featuredProject?.title) {
      return null;
    }

    return dSpeedwashProject;
  }

  get compactProjects(): ProjectItem[] {
    const featuredProject = this.featuredProject;
    const visualProject = this.visualProject;

    return this.projects.filter((project) => {
      if (project.title === featuredProject?.title) {
        return false;
      }

      if (project.title === visualProject?.title) {
        return false;
      }

      return true;
    });
  }

  get secondaryShowcaseProjects(): ProjectItem[] {
    return this.compactProjects.filter((project) => project.media.length > 0);
  }

  get caseNoteProjects(): ProjectItem[] {
    return this.compactProjects.filter((project) => project.media.length === 0);
  }

  get visibleCaseNoteProjects(): ProjectItem[] {
    if (this.areCaseNotesExpanded) {
      return this.caseNoteProjects;
    }

    return this.caseNoteProjects.slice(0, this.initialCaseNotesVisibleCount);
  }

  get hasMoreCaseNotes(): boolean {
    return this.caseNoteProjects.length > this.initialCaseNotesVisibleCount;
  }

  private getProjectPreferredMediaFrame(_project: ProjectItem): ProjectMediaFrame | null {
    return null;
  }

  private getProjectMediaIndicesByFrame(
    project: ProjectItem,
    frame: ProjectMediaFrame,
  ): number[] {
    return project.media.reduce<number[]>((indices, mediaItem, index) => {
      if (mediaItem.frame === frame) {
        indices.push(index);
      }

      return indices;
    }, []);
  }

  private getDefaultProjectMediaIndex(project: ProjectItem): number {
    if (!project.media.length) {
      return 0;
    }

    const preferredFrame = this.getProjectPreferredMediaFrame(project);
    const activeIndex = this.activeProjectMediaIndex[project.title];

    if (preferredFrame) {
      const frameIndices = this.getProjectMediaIndicesByFrame(project, preferredFrame);
      if (frameIndices.length) {
        if (
          activeIndex !== undefined &&
          activeIndex >= 0 &&
          activeIndex < project.media.length &&
          project.media[activeIndex]?.frame === preferredFrame
        ) {
          return activeIndex;
        }

        const initialIndex = project.initialMediaIndex;
        if (
          initialIndex !== undefined &&
          initialIndex >= 0 &&
          initialIndex < project.media.length &&
          project.media[initialIndex]?.frame === preferredFrame
        ) {
          return initialIndex;
        }

        return frameIndices[0] ?? 0;
      }
    }

    const nextIndex = activeIndex ?? project.initialMediaIndex ?? 0;
    return Math.min(Math.max(nextIndex, 0), project.media.length - 1);
  }

  getActiveProjectMedia(project: ProjectItem): ProjectMediaItem | null {
    if (!project.media.length) {
      return null;
    }

    const nextIndex = this.getDefaultProjectMediaIndex(project);
    return project.media[nextIndex] ?? project.media[0] ?? null;
  }

  setActiveProjectMedia(project: ProjectItem, index: number): void {
    if (index < 0 || index >= project.media.length) {
      return;
    }

    this.activeProjectMediaIndex[project.title] = index;
  }

  getProjectMediaIndex(project: ProjectItem): number {
    if (!project.media.length) {
      return 0;
    }

    return this.getDefaultProjectMediaIndex(project);
  }

  nextProjectMedia(project: ProjectItem): void {
    if (!project.media.length) {
      return;
    }

    const preferredFrame = this.getProjectPreferredMediaFrame(project);
    if (preferredFrame) {
      const frameIndices = this.getProjectMediaIndicesByFrame(project, preferredFrame);
      if (frameIndices.length > 1) {
        const currentIndex = this.getProjectMediaIndex(project);
        const currentFramePosition = frameIndices.indexOf(currentIndex);
        const nextFramePosition = (currentFramePosition + 1) % frameIndices.length;
        this.activeProjectMediaIndex[project.title] = frameIndices[nextFramePosition] ?? frameIndices[0] ?? currentIndex;
        return;
      }
    }

    const nextIndex = (this.getProjectMediaIndex(project) + 1) % project.media.length;
    this.activeProjectMediaIndex[project.title] = nextIndex;
  }

  prevProjectMedia(project: ProjectItem): void {
    if (!project.media.length) {
      return;
    }

    const preferredFrame = this.getProjectPreferredMediaFrame(project);
    if (preferredFrame) {
      const frameIndices = this.getProjectMediaIndicesByFrame(project, preferredFrame);
      if (frameIndices.length > 1) {
        const currentIndex = this.getProjectMediaIndex(project);
        const currentFramePosition = frameIndices.indexOf(currentIndex);
        const prevFramePosition =
          (currentFramePosition - 1 + frameIndices.length) % frameIndices.length;
        this.activeProjectMediaIndex[project.title] = frameIndices[prevFramePosition] ?? frameIndices[0] ?? currentIndex;
        return;
      }
    }

    const nextIndex =
      (this.getProjectMediaIndex(project) - 1 + project.media.length) % project.media.length;
    this.activeProjectMediaIndex[project.title] = nextIndex;
  }

  getProjectPreviewBadges(project: ProjectItem): string[] {
    return project.badges.slice(0, 3);
  }

  getActiveMobileDeviceFrame(project: ProjectItem): ProjectMediaItem['frame'] {
    return this.activeMobileDeviceFrame[project.title] ?? 'desktop';
  }

  setActiveMobileDeviceFrame(project: ProjectItem, frame: ProjectMediaItem['frame']): void {
    this.activeMobileDeviceFrame[project.title] = frame;
  }

  getActiveMobileDeviceMedia(project: ProjectItem): ProjectMediaItem | null {
    return this.getProjectMediaByFrame(project, this.getActiveMobileDeviceFrame(project));
  }

  getProjectStackSummary(project: ProjectItem): string {
    const baseBadges = project.badges.slice(0, 3);
    const remainingCount = Math.max(project.badges.length - baseBadges.length, 0);
    return remainingCount > 0
      ? `${baseBadges.join(' / ')} +${remainingCount}`
      : baseBadges.join(' / ');
  }

  getProjectAccessLabel(project: ProjectItem): string {
    if (project.proofLinks.some((link) => link.kind === 'live')) {
      return 'Live';
    }

    if (project.proofLinks.length > 0) {
      return 'External Proof';
    }

    return project.media.length > 0 ? 'Private Screens' : 'Private Build';
  }

  getProjectCaseEntries(project: ProjectItem): Array<{ label: string; value: string }> {
    return [
      { label: 'Problem', value: project.description },
      { label: 'What I built', value: project.buildSummary },
      { label: 'Result', value: project.result },
    ];
  }

  getProjectSignalEntries(project: ProjectItem): Array<{ label: string; value: string }> {
    return [
      { label: 'Role', value: project.role },
      { label: 'Stack', value: this.getProjectStackSummary(project) },
      { label: 'Timeline', value: project.timeline },
      { label: 'Status', value: project.stage },
      { label: 'Access', value: this.getProjectAccessLabel(project) },
    ];
  }

  onMediaImageLoad(src: string): void {
    if (!src) {
      return;
    }

    this.failedMediaSources.delete(src);
    this.loadedMediaSources.add(src);
  }

  onMediaImageError(src: string): void {
    if (!src) {
      return;
    }

    this.failedMediaSources.add(src);
    this.loadedMediaSources.add(src);
  }

  isMediaLoaded(src: string): boolean {
    return this.loadedMediaSources.has(src);
  }

  hasMediaError(src: string): boolean {
    return this.failedMediaSources.has(src);
  }

  getMediaStatusLabel(src: string): string {
    return this.hasMediaError(src) ? 'Preview unavailable' : 'Loading preview';
  }

  private preloadMediaSources(sources: Array<string | null | undefined>): void {
    if (typeof Image === 'undefined') {
      return;
    }

    for (const src of sources) {
      if (!src || this.preloadedMediaSources.has(src)) {
        continue;
      }

      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      image.onload = () => this.onMediaImageLoad(src);
      image.onerror = () => this.onMediaImageError(src);
      this.preloadedMediaSources.add(src);
    }
  }

  private preloadProjectGalleryAdjacentMedia(): void {
    const media = this.galleryProjectMedia;
    if (media.length <= 1) {
      return;
    }

    const activeIndex = this.getGalleryMediaIndex();
    const prevIndex = (activeIndex - 1 + media.length) % media.length;
    const nextIndex = (activeIndex + 1) % media.length;

    this.preloadMediaSources([media[prevIndex]?.src, media[nextIndex]?.src]);
  }

  getProjectMediaStyle(
    media: ProjectMediaItem,
    variant: 'hero' | 'card' | 'gallery',
  ): Record<string, string> {
    const crop = media.crop?.[variant];
    if (!crop) {
      return {};
    }

    const style: Record<string, string> = {};

    if (crop.fit) {
      style['object-fit'] = crop.fit;
    }

    if (crop.position) {
      style['object-position'] = crop.position;
    }

    if (crop.scale && crop.scale !== 1) {
      style['transform'] = `scale(${crop.scale})`;
      style['transform-origin'] = crop.origin ?? 'center center';
    }

    return style;
  }

  getProjectMediaFit(media: ProjectMediaItem, variant: 'hero' | 'card' | 'gallery'): string | null {
    return media.crop?.[variant]?.fit ?? null;
  }

  getProjectMediaPosition(
    media: ProjectMediaItem,
    variant: 'hero' | 'card' | 'gallery',
  ): string | null {
    return media.crop?.[variant]?.position ?? null;
  }

  getProjectMediaTransform(
    media: ProjectMediaItem,
    variant: 'hero' | 'card' | 'gallery',
  ): string | null {
    const scale = media.crop?.[variant]?.scale;
    if (!scale || scale === 1) {
      return null;
    }

    return `scale(${scale})`;
  }

  getGalleryImageTransform(media: ProjectMediaItem): string | null {
    const baseScale = media.crop?.gallery?.scale ?? 1;
    const nextScale = this.isGalleryZoomed ? baseScale * 1.6 : baseScale;

    if (nextScale === 1) {
      return null;
    }

    return `scale(${nextScale})`;
  }

  getProjectMediaTransformOrigin(
    media: ProjectMediaItem,
    variant: 'hero' | 'card' | 'gallery',
  ): string | null {
    const rule = media.crop?.[variant];
    if (!rule || !rule.scale || rule.scale === 1) {
      return null;
    }

    return rule.origin ?? 'center center';
  }

  getProjectMediaByFrame(
    project: ProjectItem,
    frame: ProjectMediaItem['frame'],
  ): ProjectMediaItem | null {
    return project.media.find((mediaItem) => mediaItem.frame === frame) ?? null;
  }

  getProjectMediaIndexByFrame(project: ProjectItem, frame: ProjectMediaItem['frame']): number {
    const mediaIndex = project.media.findIndex((mediaItem) => mediaItem.frame === frame);
    return mediaIndex >= 0 ? mediaIndex : 0;
  }

  get isMobileViewport(): boolean {
    return typeof window !== 'undefined' ? window.innerWidth <= 620 : false;
  }

  private getProjectGalleryFrames(project: ProjectItem | null): ProjectMediaFrame[] {
    if (!project) {
      return [];
    }

    const frames = new Set(project.media.map((mediaItem) => mediaItem.frame));
    return PROJECT_MEDIA_FRAME_ORDER.filter((frame) => frames.has(frame));
  }

  private resolveProjectGalleryFrameFilter(
    project: ProjectItem,
    index: number,
    frameFilter: ProjectMediaFrame | null,
  ): ProjectMediaFrame | null {
    if (frameFilter) {
      return frameFilter;
    }

    const frames = this.getProjectGalleryFrames(project);
    if (frames.length <= 1) {
      return null;
    }

    const fallbackMedia = project.media[Math.min(Math.max(index, 0), project.media.length - 1)] ?? null;
    return fallbackMedia?.frame ?? frames[0] ?? null;
  }

  get galleryFrameOptions(): ProjectMediaFrame[] {
    return this.getProjectGalleryFrames(this.projectGalleryProject);
  }

  get hasGalleryFrameOptions(): boolean {
    return this.galleryFrameOptions.length > 1;
  }

  getActiveGalleryFrame(): ProjectMediaFrame | null {
    return this.projectGalleryFrameFilter ?? this.getActiveGalleryMedia()?.frame ?? null;
  }

  isGalleryFrameActive(frame: ProjectMediaFrame): boolean {
    return this.getActiveGalleryFrame() === frame;
  }

  getGalleryFrameLabel(frame: ProjectMediaFrame): string {
    return (
      this.projectGalleryProject?.media.find((mediaItem) => mediaItem.frame === frame)?.viewerLabel ??
      getDefaultViewerLabel(frame)
    );
  }

  setGalleryFrameFilter(frame: ProjectMediaFrame): void {
    if (!this.projectGalleryProject) {
      return;
    }

    const availableFrames = this.getProjectGalleryFrames(this.projectGalleryProject);
    if (!availableFrames.includes(frame)) {
      return;
    }

    this.projectGalleryFrameFilter = availableFrames.length > 1 ? frame : null;
    this.projectGalleryActiveIndex = 0;
    this.isGalleryZoomed = false;
    this.preloadProjectGalleryAdjacentMedia();
    this.scheduleGalleryRailSync(false);
  }

  shouldShowGalleryRail(): boolean {
    const media = this.galleryProjectMedia;
    if (media.length <= 1) {
      return false;
    }

    if (!this.isMobileViewport) {
      return true;
    }

    const distinctFrames = new Set(media.map((mediaItem) => mediaItem.frame));
    return distinctFrames.size === 1 && media.length <= 12;
  }

  shouldShowGalleryDots(): boolean {
    return this.isMobileViewport && !this.shouldShowGalleryRail() && this.galleryProjectMedia.length > 1;
  }

  get visibleGalleryThumbs(): Array<{ media: ProjectMediaItem; index: number }> {
    const media = this.galleryProjectMedia;
    if (!media.length) {
      return [];
    }

    return media.map((mediaItem, index) => ({ media: mediaItem, index }));
  }

  get visibleGalleryDots(): number[] {
    const media = this.galleryProjectMedia;
    if (!media.length) {
      return [];
    }

    if (!this.isMobileViewport || media.length <= 7) {
      return media.map((_, index) => index);
    }

    const activeIndex = this.getGalleryMediaIndex();
    let start = Math.max(activeIndex - 3, 0);
    let end = Math.min(start + 7, media.length);

    if (end - start < 7) {
      start = Math.max(end - 7, 0);
    }

    return Array.from({ length: end - start }, (_, offset) => start + offset);
  }

  get galleryProjectMedia(): ProjectMediaItem[] {
    if (!this.projectGalleryProject) {
      return [];
    }

    if (!this.projectGalleryFrameFilter) {
      return this.projectGalleryProject.media;
    }

    return this.projectGalleryProject.media.filter(
      (mediaItem) => mediaItem.frame === this.projectGalleryFrameFilter,
    );
  }

  getActiveGalleryMedia(): ProjectMediaItem | null {
    const media = this.galleryProjectMedia;
    if (!media.length) {
      return null;
    }

    return media[this.getGalleryMediaIndex()] ?? media[0] ?? null;
  }

  getGalleryMediaIndex(): number {
    const media = this.galleryProjectMedia;
    if (!media.length) {
      return 0;
    }

    return Math.min(Math.max(this.projectGalleryActiveIndex, 0), media.length - 1);
  }

  setActiveGalleryMedia(index: number): void {
    const media = this.galleryProjectMedia;
    if (!media.length || index < 0 || index >= media.length) {
      return;
    }

    this.projectGalleryActiveIndex = index;
    this.isGalleryZoomed = false;
    this.preloadProjectGalleryAdjacentMedia();
    this.scheduleGalleryRailSync();
  }

  openProjectGallery(
    project: ProjectItem,
    index?: number,
    frameFilter: ProjectMediaItem['frame'] | null = null,
  ): void {
    if (!project.media.length) {
      return;
    }

    const targetIndex = index ?? this.getProjectMediaIndex(project);
    this.projectGalleryProject = project;
    this.projectGalleryFrameFilter = this.resolveProjectGalleryFrameFilter(
      project,
      targetIndex,
      frameFilter,
    );

    const media = this.galleryProjectMedia;
    if (!media.length) {
      return;
    }

    if (frameFilter) {
      const targetMedia = project.media[targetIndex] ?? null;
      const filteredIndex = targetMedia
        ? media.findIndex((mediaItem) => mediaItem.src === targetMedia.src)
        : 0;
      this.projectGalleryActiveIndex = filteredIndex >= 0 ? filteredIndex : 0;
    } else {
      this.projectGalleryActiveIndex = Math.min(Math.max(targetIndex, 0), media.length - 1);
    }

    this.setActiveProjectMedia(project, targetIndex);
    this.isProjectGalleryOpen = true;
    this.isGalleryZoomed = false;
    this.preloadProjectGalleryAdjacentMedia();
    this.syncBodyScrollLock();
    this.scheduleGalleryRailSync(false);
  }

  closeProjectGallery(): void {
    this.isProjectGalleryOpen = false;
    this.projectGalleryProject = null;
    this.projectGalleryFrameFilter = null;
    this.projectGalleryActiveIndex = 0;
    this.isGalleryZoomed = false;
    this.galleryTouchStartX = null;
    this.galleryTouchStartY = null;
    this.cancelGalleryRailSync();
    this.syncBodyScrollLock();
  }

  nextOpenProjectGalleryMedia(): void {
    const media = this.galleryProjectMedia;
    if (!media.length) {
      return;
    }

    this.projectGalleryActiveIndex = (this.getGalleryMediaIndex() + 1) % media.length;
    this.isGalleryZoomed = false;
    this.preloadProjectGalleryAdjacentMedia();
    this.scheduleGalleryRailSync();
  }

  prevOpenProjectGalleryMedia(): void {
    const media = this.galleryProjectMedia;
    if (!media.length) {
      return;
    }

    this.projectGalleryActiveIndex =
      (this.getGalleryMediaIndex() - 1 + media.length) % media.length;
    this.isGalleryZoomed = false;
    this.preloadProjectGalleryAdjacentMedia();
    this.scheduleGalleryRailSync();
  }

  toggleGalleryZoom(): void {
    if (this.isMobileViewport) {
      return;
    }

    this.isGalleryZoomed = !this.isGalleryZoomed;
  }

  onGalleryTouchStart(event: TouchEvent): void {
    if (!this.isMobileViewport || this.galleryProjectMedia.length <= 1) {
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    this.galleryTouchStartX = touch.clientX;
    this.galleryTouchStartY = touch.clientY;
  }

  onGalleryTouchEnd(event: TouchEvent): void {
    if (!this.isMobileViewport || this.galleryProjectMedia.length <= 1) {
      return;
    }

    if (this.galleryTouchStartX === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const startX = this.galleryTouchStartX;
    const startY = this.galleryTouchStartY ?? 0;

    this.galleryTouchStartX = null;
    this.galleryTouchStartY = null;

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      this.nextOpenProjectGalleryMedia();
      return;
    }

    this.prevOpenProjectGalleryMedia();
  }

  private syncBodyScrollLock(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow =
      this.isResumePreviewOpen ||
      this.isProjectGalleryOpen ||
      (this.isChatOpen && this.isMobileViewport)
        ? 'hidden'
        : '';
  }

  onNavSelect(sectionId: string): void {
    this.setActive(sectionId);
    this.navLockSection = sectionId;
    this.navLockUntil = Date.now() + 1200;
    this.closeMobileMenu();

    window.setTimeout(() => {
      this.updateActiveSectionFromViewport();
    }, 1260);
  }

  isExperienceExpanded(role: string): boolean {
    return this.expandedExperienceRoles.has(role);
  }

  toggleExperienceHighlights(role: string): void {
    if (this.expandedExperienceRoles.has(role)) {
      this.expandedExperienceRoles.delete(role);
      return;
    }

    this.expandedExperienceRoles.add(role);
  }

  getExperienceTrackLabel(track: ExperienceTrack): string {
    switch (track) {
      case 'contract':
        return 'Contract';
      case 'freelance':
        return 'Freelance';
      default:
        return 'Internship';
    }
  }

  getExperienceCaseEntries(exp: ExperienceItem): Array<{ label: string; value: string }> {
    return [
      { label: 'Context', value: exp.context },
      { label: 'Owned', value: exp.owned },
      { label: 'Impact', value: exp.impact },
    ];
  }

  getExperienceBadgePreview(exp: ExperienceItem): string[] {
    return exp.badges.slice(0, 4);
  }

  getExperienceBadgeOverflowCount(exp: ExperienceItem): number {
    return Math.max(exp.badges.length - this.getExperienceBadgePreview(exp).length, 0);
  }

  getExperienceSelectedOutcomes(exp: ExperienceItem): string[] {
    return exp.selectedOutcomes.slice(0, 2);
  }

  getExperienceTechnicalDetails(exp: ExperienceItem): string[] {
    return exp.technicalDetails;
  }

  openExperienceRelatedProject(projectTitle: string): void {
    const project = this.projects.find((item) => item.title === projectTitle) ?? null;
    this.setActive('projects');

    if (project?.media.length) {
      this.openProjectGallery(project, project.initialMediaIndex ?? 0);
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  shouldShowExperienceToggle(exp: ExperienceItem): boolean {
    return exp.technicalDetails.length > 0;
  }

  onProfileImageLoad(layer: 'cartoon' | 'real'): void {
    if (layer === 'cartoon') {
      this.isProfileCartoonLoaded = true;
      return;
    }

    this.isProfileRealLoaded = true;
  }

  get isProfileImageLoading(): boolean {
    return !this.isProfileCartoonLoaded || (this.isPhotoRevealed && !this.isProfileRealLoaded);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  openChat(): void {
    this.isChatOpen = true;
    this.markChatFirstVisitDone();
    this.syncBodyScrollLock();
    this.scrollChatToBottom();
  }

  closeChat(): void {
    this.isChatOpen = false;
    this.isBotTyping = false;
    if (this.chatReplyTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.chatReplyTimer);
      this.chatReplyTimer = null;
    }
    this.syncBodyScrollLock();
  }

  onChatDraftInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const next = target?.value ?? '';
    this.chatDraft = next.slice(0, this.maxChatChars);
  }

  onChatEnter(event: Event): void {
    event.preventDefault();
    this.sendChatMessage();
  }

  sendQuickPrompt(prompt: string): void {
    this.chatDraft = prompt;
    this.sendChatMessage();
  }

  sendChatMessage(): void {
    const message = this.chatDraft.trim();
    if (!message) {
      return;
    }

    this.pushChatMessage('user', message);
    this.chatDraft = '';
    this.queueBotReply(message);
  }

  async copyPhoneNumber(): Promise<void> {
    const text = this.profile.phone;
    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== 'undefined') {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.left = '-9999px';
      document.body.appendChild(temp);
      temp.select();

      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      } finally {
        document.body.removeChild(temp);
      }
    }

    if (!copied || typeof window === 'undefined') {
      return;
    }

    this.isPhoneCopied = true;
    if (this.phoneCopyTimer !== null) {
      window.clearTimeout(this.phoneCopyTimer);
    }

    this.phoneCopyTimer = window.setTimeout(() => {
      this.isPhoneCopied = false;
      this.phoneCopyTimer = null;
    }, 1400);
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.isDarkPaper ? 'light' : 'dark';
    this.applyTheme(nextTheme, true);
  }

  togglePhotoReveal(): void {
    this.isPhotoRevealed = !this.isPhotoRevealed;

    if (this.isPhotoRevealed && !this.isProfileRealLoaded) {
      this.preloadProfileRealImage();
    }
  }

  onPhotoPointer(event: Event): void {
    // Desktop/laptop with true hover should use hover preview only.
    if (this.canUseHoverPreview()) {
      this.isPhotoRevealed = false;
      return;
    }

    event.preventDefault();
    this.togglePhotoReveal();
  }

  onPhotoSpace(event: Event): void {
    event.preventDefault();
    this.togglePhotoReveal();
  }

  openResumePreview(): void {
    this.isResumePreviewOpen = true;
    this.syncBodyScrollLock();
  }

  closeResumePreview(): void {
    this.isResumePreviewOpen = false;
    this.syncBodyScrollLock();
  }

  ngAfterViewInit(): void {
    this.setupScrollReveal();
    this.lastRevealViewportMode = this.getRevealViewportMode();
    this.startCatFrameLoop();
    this.scheduleHomeHashTopLock();
    this.scheduleFirstVisitChatOpen();
    this.scheduleProfileRealImagePreload();

    // Defer initial section sync to avoid NG0100 during first render check.
    window.setTimeout(() => {
      this.cacheTrackedSections();
      this.adjustInitialHashOffset(false);
      this.updateActiveSectionFromViewport();
    }, 0);

    // Run one more pass after layout settles to prevent hash+refresh overlap with sticky nav.
    window.setTimeout(() => {
      this.adjustInitialHashOffset(true);
      this.updateActiveSectionFromViewport();
    }, 220);
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.stopCatFrameLoop();
    if (this.chatReplyTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.chatReplyTimer);
      this.chatReplyTimer = null;
    }
    for (const timer of this.homeHashLockTimers) {
      window.clearTimeout(timer);
    }
    this.homeHashLockTimers = [];
    if (this.phoneCopyTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.phoneCopyTimer);
      this.phoneCopyTimer = null;
    }
    if (this.profileRealPreloadTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.profileRealPreloadTimer);
      this.profileRealPreloadTimer = null;
    }
    if (this.chatAutoOpenTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.chatAutoOpenTimer);
      this.chatAutoOpenTimer = null;
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    this.cancelGalleryRailSync();
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    if (this.isProjectGalleryOpen) {
      this.closeProjectGallery();
      return;
    }

    if (this.isResumePreviewOpen) {
      this.closeResumePreview();
      return;
    }

    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isMobileMenuOpen && window.innerWidth > 1100) {
      this.closeMobileMenu();
    }

    if (this.canUseHoverPreview()) {
      this.isPhotoRevealed = false;
    }

    const nextRevealViewportMode = this.getRevealViewportMode();
    if (nextRevealViewportMode !== this.lastRevealViewportMode) {
      this.lastRevealViewportMode = nextRevealViewportMode;
      this.refreshRevealAfterFilterChange();
    }

    this.cacheTrackedSections();
    this.updateActiveSectionFromViewport();
    this.syncBodyScrollLock();

    if (this.isProjectGalleryOpen) {
      this.scheduleGalleryRailSync(false);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateActiveSectionFromViewport();
  }

  private scheduleProfileRealImagePreload(): void {
    if (typeof window === 'undefined' || this.isProfileRealLoaded) {
      return;
    }

    if (this.profileRealPreloadTimer !== null) {
      window.clearTimeout(this.profileRealPreloadTimer);
    }

    this.profileRealPreloadTimer = window.setTimeout(() => {
      this.profileRealPreloadTimer = null;
      this.preloadProfileRealImage();
    }, 420);
  }

  private preloadProfileRealImage(): void {
    if (typeof Image === 'undefined' || this.isProfileRealLoaded) {
      return;
    }

    const image = new Image();
    image.decoding = 'async';
    image.src = this.profileRealSrc;
    image.onload = () => this.onProfileImageLoad('real');
  }

  private scheduleGalleryRailSync(animate = true): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.cancelGalleryRailSync();

    this.galleryRailSyncFrame = window.requestAnimationFrame(() => {
      this.galleryRailSyncFrame = window.requestAnimationFrame(() => {
        this.galleryRailSyncFrame = null;
        this.syncActiveGalleryThumbIntoView(animate);
      });
    });
  }

  private cancelGalleryRailSync(): void {
    if (this.galleryRailSyncFrame === null || typeof window === 'undefined') {
      return;
    }

    window.cancelAnimationFrame(this.galleryRailSyncFrame);
    this.galleryRailSyncFrame = null;
  }

  private syncActiveGalleryThumbIntoView(animate = true): void {
    const railEl = this.projectGalleryRailEl?.nativeElement;
    const thumbEls = this.projectGalleryThumbEls?.toArray() ?? [];
    const activeThumbEl = thumbEls[this.getGalleryMediaIndex()]?.nativeElement;

    if (!railEl || !activeThumbEl) {
      return;
    }

    activeThumbEl.scrollIntoView({
      behavior: animate ? 'smooth' : 'auto',
      block: 'nearest',
      inline: 'center',
    });
  }

  private cacheTrackedSections(): void {
    const ids = ['home', 'about', 'skills', 'projects'];
    this.trackedSections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
  }

  private isSectionVisible(sectionId: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const section = document.getElementById(sectionId);
    if (!section) {
      return false;
    }

    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.75 && rect.bottom > 96;
  }

  private updateActiveSectionFromViewport(): void {
    if (!this.trackedSections.length || typeof window === 'undefined') {
      return;
    }

    if (this.navLockSection && Date.now() < this.navLockUntil) {
      if (this.activeSection !== this.navLockSection) {
        this.activeSection = this.navLockSection;
      }
      return;
    }

    this.navLockSection = null;

    const anchorLine = this.getAnchorLine();

    let nextActive = this.trackedSections[0].id;

    for (const section of this.trackedSections) {
      if (section.getBoundingClientRect().top <= anchorLine) {
        nextActive = section.id;
      }
    }

    if (nextActive !== this.activeSection) {
      this.activeSection = nextActive;
    }
  }

  private getAnchorLine(): number {
    const nav = document.querySelector<HTMLElement>('.top-nav');
    const navHeight = nav?.getBoundingClientRect().height ?? 88;

    const host = document.querySelector('app-root');
    const cssOffsetRaw = host
      ? getComputedStyle(host).getPropertyValue('--anchor-offset').trim()
      : '';
    const cssOffsetPx = this.toPixels(cssOffsetRaw);

    return Math.max(navHeight + 20, cssOffsetPx - 4);
  }

  private adjustInitialHashOffset(finalize: boolean): void {
    if (typeof window === 'undefined' || this.hasAdjustedInitialHashOffset) {
      return;
    }

    const hash = window.location.hash?.replace('#', '').trim();
    if (!hash) {
      if (finalize) {
        this.hasAdjustedInitialHashOffset = true;
      }
      return;
    }

    if (hash === 'home') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });

      this.activeSection = 'home';

      if (finalize) {
        this.hasAdjustedInitialHashOffset = true;
      }
      return;
    }

    const target = document.getElementById(hash);
    if (!target) {
      if (finalize) {
        this.hasAdjustedInitialHashOffset = true;
      }
      return;
    }

    const nav = document.querySelector<HTMLElement>('.top-nav');
    const navHeight = nav?.getBoundingClientRect().height ?? 88;
    const offset = navHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: Math.max(0, top),
      left: 0,
      behavior: 'auto',
    });

    if (finalize) {
      this.hasAdjustedInitialHashOffset = true;
    }
  }

  private scheduleHomeHashTopLock(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const hash = window.location.hash?.replace('#', '').trim();
    if (hash !== 'home') {
      return;
    }

    const forceHomeTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
      this.activeSection = 'home';
    };

    forceHomeTop();

    this.homeHashLockTimers.push(
      window.setTimeout(forceHomeTop, 40),
      window.setTimeout(forceHomeTop, 140),
      window.setTimeout(forceHomeTop, 320),
      window.setTimeout(forceHomeTop, 620),
    );

    window.addEventListener(
      'load',
      () => {
        forceHomeTop();
      },
      { once: true },
    );
  }

  private toPixels(value: string): number {
    if (!value) {
      return 0;
    }

    const numericValue = Number.parseFloat(value);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }

    if (value.endsWith('rem')) {
      const rootFontSize =
        Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      return numericValue * rootFontSize;
    }

    return numericValue;
  }

  private canUseHoverPreview(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  private getRevealViewportMode(): 'mobile' | 'desktop' {
    return typeof window !== 'undefined' && window.innerWidth <= 620 ? 'mobile' : 'desktop';
  }

  private setupScrollReveal(): void {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!revealItems.length) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      for (const item of revealItems) {
        item.classList.add('in-view');
      }
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const isLargeRevealBlock =
            typeof window !== 'undefined' &&
            target.getBoundingClientRect().height > window.innerHeight * 1.1;

          if (entry.intersectionRatio > 0.16 || (entry.isIntersecting && isLargeRevealBlock)) {
            target.classList.add('in-view');
          } else {
            target.classList.remove('in-view');
          }
        }
      },
      {
        root: null,
        threshold: [0, 0.16, 0.35],
        rootMargin: '0px 0px -8% 0px',
      },
    );

    for (const [index, item] of revealItems.entries()) {
      if (
        !item.classList.contains('delay-1') &&
        !item.classList.contains('delay-2') &&
        !item.classList.contains('delay-3')
      ) {
        item.style.setProperty('--reveal-delay', `${(index % 4) * 50}ms`);
      }

      this.revealObserver.observe(item);
    }
  }

  private startCatFrameLoop(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.stopCatFrameLoop();
    this.setVisibleCatFrame(0);

    const totalFrames = this.catFrameEls?.length ?? this.catFrameSources.length;
    if (totalFrames < 2) {
      return;
    }

    this.catFrameTimer = window.setInterval(() => {
      const frameCount = this.catFrameEls?.length ?? 0;
      if (frameCount < 2) {
        return;
      }

      const nextFrame = (this.catDomFrameIndex + 1) % frameCount;
      this.setVisibleCatFrame(nextFrame);
    }, 100);
  }

  private stopCatFrameLoop(): void {
    if (this.catFrameTimer === null || typeof window === 'undefined') {
      return;
    }

    window.clearInterval(this.catFrameTimer);
    this.catFrameTimer = null;
  }

  private setVisibleCatFrame(nextFrame: number): void {
    const frameElements = this.catFrameEls?.toArray().map((item) => item.nativeElement) ?? [];
    if (!frameElements.length) {
      return;
    }

    const safeNext =
      ((nextFrame % frameElements.length) + frameElements.length) % frameElements.length;
    const currentEl = frameElements[this.catDomFrameIndex];
    const nextEl = frameElements[safeNext];

    if (currentEl) {
      currentEl.classList.remove('is-visible');
    }
    if (nextEl) {
      nextEl.classList.add('is-visible');
    }

    this.catDomFrameIndex = safeNext;
  }

  private queueBotReply(userText: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.chatReplyTimer !== null) {
      window.clearTimeout(this.chatReplyTimer);
      this.chatReplyTimer = null;
    }

    this.isBotTyping = true;
    const responseDelay = Math.min(980, Math.max(380, userText.length * 14));

    this.chatReplyTimer = window.setTimeout(() => {
      const reply = this.buildChatReply(userText);
      this.pushChatMessage('bot', reply.text, reply.cta);
      this.isBotTyping = false;
      this.chatReplyTimer = null;
    }, responseDelay);
  }

  private pushChatMessage(sender: 'bot' | 'user', text: string, cta?: ChatMessageCta): void {
    this.nextChatMessageId += 1;
    this.chatMessages.push({
      id: this.nextChatMessageId,
      sender,
      text,
      cta,
    });
    this.scrollChatToBottom();
  }

  private buildChatReply(rawInput: string): ChatReply {
    const input = rawInput.toLowerCase();

    if (
      input.includes('stack') ||
      input.includes('tech') ||
      input.includes('framework') ||
      input.includes('tools')
    ) {
      return {
        text: 'Core stack: Angular, Ionic, TypeScript, PHP, Node.js/Express, and MySQL, plus Power BI and SQL reporting work.',
      };
    }

    if (
      input.includes('project') ||
      input.includes('case') ||
      input.includes('work') ||
      input.includes('experience')
    ) {
      return {
        text: 'Top builds include Paragon S2S MMS enhancements, a Repair Monitoring System from scratch, PSMMS v2 UI build, and a QR-based service platform with web + mobile flows.',
      };
    }

    if (
      input.includes('contact') ||
      input.includes('email') ||
      input.includes('phone') ||
      input.includes('hire')
    ) {
      return {
        text: `You can reach Jericho at ${this.profile.email} or ${this.profile.phone}. If you want to move fast, use the handoff button below.`,
        cta: {
          label: 'Email me now',
          href: `mailto:${this.profile.email}`,
        },
      };
    }

    if (input.includes('ai') || input.includes('machine learning') || input.includes('gen ai')) {
      return {
        text: 'Jericho is currently expanding into AI-powered features and generative AI workflows, alongside full-stack delivery for web and internal systems.',
      };
    }

    return {
      text: 'Good question. Try asking about stack, projects, AI focus, or contact details and I can answer quickly.',
    };
  }

  private scrollChatToBottom(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.requestAnimationFrame(() => {
      const el = this.chatScrollContainer?.nativeElement;
      if (!el) {
        return;
      }

      el.scrollTop = el.scrollHeight;
    });
  }

  private refreshRevealAfterFilterChange(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.setTimeout(() => {
      const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
      if (!revealItems.length) {
        return;
      }

      for (const [index, item] of revealItems.entries()) {
        item.classList.add('in-view');

        if (
          !item.classList.contains('delay-1') &&
          !item.classList.contains('delay-2') &&
          !item.classList.contains('delay-3')
        ) {
          item.style.setProperty('--reveal-delay', `${(index % 4) * 50}ms`);
        }

        this.revealObserver?.observe(item);
      }
    }, 0);
  }

  private scheduleFirstVisitChatOpen(): void {
    if (typeof window === 'undefined') {
      return;
    }

    let hasSeenChat = false;
    try {
      hasSeenChat = window.localStorage.getItem(this.chatFirstVisitStorageKey) === '1';
    } catch {
      hasSeenChat = false;
    }

    if (hasSeenChat) {
      return;
    }

    this.chatAutoOpenTimer = window.setTimeout(() => {
      this.openChat();
      this.chatAutoOpenTimer = null;
    }, this.chatAutoOpenDelayMs);
  }

  private markChatFirstVisitDone(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.chatFirstVisitStorageKey, '1');
    } catch {
      // Ignore localStorage write failures.
    }
  }

  private initTheme(): void {
    if (typeof window === 'undefined') {
      return;
    }

    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(this.themeStorageKey);
    } catch {
      saved = null;
    }

    if (saved === 'light' || saved === 'dark') {
      this.applyTheme(saved, false);
      return;
    }

    this.applyTheme('light', false);
  }

  private applyTheme(mode: ThemeMode, persist: boolean): void {
    this.themeMode = mode;

    if (typeof document !== 'undefined') {
      document.body.classList.remove(this.lightThemeClass, this.darkThemeClass);
      document.body.classList.add(mode === 'dark' ? this.darkThemeClass : this.lightThemeClass);
    }

    if (persist && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(this.themeStorageKey, mode);
      } catch {
        // Ignore localStorage write failures and keep the active runtime theme.
      }
    }
  }
}
