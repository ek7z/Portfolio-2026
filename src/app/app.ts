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

type ProjectMediaItem = {
  src: string;
  label: string;
  frame: 'desktop' | 'mobile' | 'poster';
  crop?: ProjectMediaCrop;
};

const buildProjectMedia = (
  folder: string,
  frame: ProjectMediaItem['frame'],
  entries: Array<number | string>,
  labelPrefix: string,
  cropByIndex?: (index: number) => ProjectMediaCrop | undefined,
): ProjectMediaItem[] =>
  entries.map((entry, index) => ({
    src: `assets/${folder}/${entry}.png`,
    label: `${labelPrefix} ${String(index + 1).padStart(2, '0')}`,
    frame,
    crop: cropByIndex?.(index),
  }));

const buildRepairMediaCrop = (_screenNumber: number): ProjectMediaCrop => ({
  hero: { fit: 'cover', position: 'center center', scale: 1, origin: 'center center' },
  card: { fit: 'cover', position: 'center center', scale: 1, origin: 'center center' },
  gallery: { fit: 'cover', position: 'center center', scale: 1, origin: 'center center' },
});

const REPAIR_MEDIA_ENTRIES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

type ProjectItem = {
  title: string;
  description: string;
  stage: string;
  scope: string;
  impact: string;
  impactMetrics: string[];
  filters: string[];
  proofLinks: ProjectProofLink[];
  role: string;
  result: string;
  tone: string;
  badges: string[];
  media: ProjectMediaItem[];
};

type CertificationItem = {
  title: string;
  provider: string;
  date: string;
  mark: string;
};

type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  track: 'contract' | 'freelance' | 'internship';
  highlights: string[];
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
type MobileProjectTab = 'overview' | 'screens' | 'result';

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
  isPhoneCopied = false;
  isChatOpen = false;
  isBotTyping = false;
  chatDraft = '';
  themeMode: ThemeMode = 'light';
  activeExperienceFilter: 'all' | 'contract' | 'freelance' | 'internship' = 'all';
  activeProjectFilter: 'all' | 'enterprise' | 'freelance' | 'academic' | 'web' | 'mobile' = 'all';
  areCaseNotesExpanded = false;
  readonly initialCaseNotesVisibleCount = 2;
  readonly collapsedHighlightCount = 2;
  private navLockSection: string | null = null;
  private navLockUntil = 0;
  private trackedSections: HTMLElement[] = [];
  private revealObserver: IntersectionObserver | null = null;
  private hasAdjustedInitialHashOffset = false;
  private homeHashLockTimers: number[] = [];
  private phoneCopyTimer: number | null = null;
  private catFrameTimer: number | null = null;
  private chatReplyTimer: number | null = null;
  private chatAutoOpenTimer: number | null = null;
  private galleryTouchStartX: number | null = null;
  private galleryTouchStartY: number | null = null;
  private nextChatMessageId = 1;
  private catDomFrameIndex = 0;
  private activeProjectMediaIndex: Record<string, number> = {};
  private activeMobileProjectTab: Record<string, MobileProjectTab> = {};
  private activeMobileDeviceFrame: Record<string, ProjectMediaItem['frame']> = {};
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
  @ViewChildren('catFrameEl') private catFrameEls?: QueryList<ElementRef<HTMLImageElement>>;
  @ViewChild('chatScrollContainer') private chatScrollContainer?: ElementRef<HTMLDivElement>;
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
  readonly chatAvatarSrc = 'assets/profile/jericho-cartoon.png';
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
      period: 'October 2025 - April 2026',
      track: 'contract',
      badges: ['PSMMS', 'SQL Reporting', 'Role Access', 'Production Support'],
      tone: 'timeline-contract',
      highlights: [
        'Refactored legacy PSMMS pages and responsiveness across mobile, tablet, and desktop views.',
        'Corrected SQL queries, filtering, and aggregation logic; added date-range and status-summary reports.',
        'Delivered workflow/permission updates, production hotfixes, and stakeholder-validated releases.',
        'Supported related internal modules under the same Paragon contract, including repair and PSMMS v2 deliverables.',
      ],
    },
    {
      role: 'Freelance Full-Stack Developer',
      company: 'DhongEye (QR Code-Based Service System)',
      period: 'January 2025 - Present',
      track: 'freelance',
      badges: ['Web Admin', 'Mobile Apps', 'QR Workflow', 'Role Routing'],
      tone: 'timeline-freelance',
      highlights: [
        'Delivered QR-based service system with admin website plus mobile apps for customer, laborer, and rider roles.',
        'Implemented OTP auth, role-based routing, and booking lifecycle rules with controlled edit/cancel behavior.',
        'Built KPI dashboard, service/user/booking modules, alerts, and pricing-lock logic for operational stability.',
      ],
    },
    {
      role: 'OJT Intern - DevOps Team',
      company: 'D&L Industries Inc. (Bagumbayan, Quezon City)',
      period: 'July 2024 - November 2024',
      track: 'internship',
      badges: ['Power BI', 'SQL Reporting', 'Data Prep', 'Ops Workflow'],
      tone: 'timeline-ops',
      highlights: [
        'Built and maintained Power BI dashboards for internal operations reporting.',
        'Prepared multi-department datasets and wrote SQL scripts for extraction, filtering, and shaping.',
        'Gained exposure to enterprise data pipelines and DevOps workflow practices.',
      ],
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

  readonly projectFilters = [
    { id: 'all', label: 'All Projects' },
    { id: 'enterprise', label: 'Enterprise' },
    { id: 'freelance', label: 'Freelance' },
    { id: 'academic', label: 'Academic' },
    { id: 'web', label: 'Web' },
    { id: 'mobile', label: 'Mobile' },
  ] as const;

  readonly projects: ProjectItem[] = [
    {
      title: 'Paragon S2S MMS (Enhancements and Maintenance)',
      description:
        'Legacy PSMMS modules had UI inconsistencies and report mismatches across operations views.',
      stage: 'Contract Delivery',
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
      stage: 'Internal Deployment',
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
      media: buildProjectMedia(
        'Repair',
        'desktop',
        REPAIR_MEDIA_ENTRIES,
        'Repair Screen',
        (index) => buildRepairMediaCrop(index + 1),
      ),
    },
    {
      title: 'PSMMS Version 2 UI Build',
      description:
        'PSMMS v2 needed a reusable responsive frontend baseline for multiple product lines.',
      stage: 'UI Phase (Paused)',
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
      media: buildProjectMedia(
        'Paragon V2 UI',
        'desktop',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        'UI Screen',
      ),
    },
    {
      title: 'QR Code-Based Service System',
      description:
        'Service booking and production updates needed role-based digital flow and status visibility.',
      stage: 'Client System Deployed',
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
      stage: 'Academic Capstone',
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
        ...buildProjectMedia(
          'DSpeedWash',
          'desktop',
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          'Web Admin',
        ),
        ...buildProjectMedia(
          'DSpeedWash/app',
          'mobile',
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          'Mobile App',
        ),
      ],
    },
    {
      title: 'Bayani TTRPG',
      description:
        'Game project needed a strong visual identity and a presentable playable interface for the subject showcase.',
      stage: 'Academic Game Build',
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
      media: buildProjectMedia(
        'Bayani TTRPG',
        'poster',
        [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15],
        'Bayani Scene',
      ),
    },
    {
      title: 'Apartease',
      description:
        'Property records and apartment processes needed centralized web-based management.',
      stage: 'Web System Build',
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

  setProjectFilter(filter: string): void {
    if (
      filter === 'all' ||
      filter === 'enterprise' ||
      filter === 'freelance' ||
      filter === 'academic' ||
      filter === 'web' ||
      filter === 'mobile'
    ) {
      this.activeProjectFilter = filter;
      this.areCaseNotesExpanded = false;
      this.closeProjectGallery();
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

  get filteredProjects(): ProjectItem[] {
    if (this.activeProjectFilter === 'all') {
      return this.projects;
    }

    return this.projects.filter((project) => project.filters.includes(this.activeProjectFilter));
  }

  get featuredProject(): ProjectItem | null {
    if (!this.filteredProjects.length) {
      return null;
    }

    for (const title of this.featuredProjectPriority) {
      const matchedProject = this.filteredProjects.find((project) => project.title === title);
      if (matchedProject) {
        return matchedProject;
      }
    }

    return this.filteredProjects[0] ?? null;
  }

  get secondaryProjects(): ProjectItem[] {
    const featuredProject = this.featuredProject;

    if (!featuredProject) {
      return [];
    }

    return this.filteredProjects.filter((project) => project.title !== featuredProject.title);
  }

  get visualProject(): ProjectItem | null {
    const featuredProject = this.featuredProject;
    const dSpeedwashProject =
      this.filteredProjects.find((project) => project.title === "D'Speedwash App") ?? null;

    if (!dSpeedwashProject || dSpeedwashProject.title === featuredProject?.title) {
      return null;
    }

    return dSpeedwashProject;
  }

  get compactProjects(): ProjectItem[] {
    const featuredProject = this.featuredProject;
    const visualProject = this.visualProject;

    return this.filteredProjects.filter((project) => {
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

  getActiveProjectMedia(project: ProjectItem): ProjectMediaItem | null {
    if (!project.media.length) {
      return null;
    }

    const nextIndex = this.activeProjectMediaIndex[project.title] ?? 0;
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

    const nextIndex = this.activeProjectMediaIndex[project.title] ?? 0;
    return Math.min(Math.max(nextIndex, 0), project.media.length - 1);
  }

  nextProjectMedia(project: ProjectItem): void {
    if (!project.media.length) {
      return;
    }

    const nextIndex = (this.getProjectMediaIndex(project) + 1) % project.media.length;
    this.activeProjectMediaIndex[project.title] = nextIndex;
  }

  prevProjectMedia(project: ProjectItem): void {
    if (!project.media.length) {
      return;
    }

    const nextIndex =
      (this.getProjectMediaIndex(project) - 1 + project.media.length) % project.media.length;
    this.activeProjectMediaIndex[project.title] = nextIndex;
  }

  getProjectPreviewBadges(project: ProjectItem): string[] {
    return project.badges.slice(0, 3);
  }

  getMobileProjectTab(project: ProjectItem): MobileProjectTab {
    return this.activeMobileProjectTab[project.title] ?? (project.media.length > 0 ? 'screens' : 'overview');
  }

  setMobileProjectTab(project: ProjectItem, tab: MobileProjectTab): void {
    this.activeMobileProjectTab[project.title] = tab;
  }

  getMobileProjectPrimaryImpact(project: ProjectItem): string {
    return project.impactMetrics[0] ?? project.impact;
  }

  getMobileProjectSecondaryImpact(project: ProjectItem): string {
    return project.impactMetrics[1] ?? project.scope;
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

  getMediaSlotLabel(index: number): string {
    return String(index + 1).padStart(2, '0');
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

  isRepairGalleryProject(project: ProjectItem | null): boolean {
    return project?.title === 'Repair Management Monitoring System';
  }

  isWideGalleryProject(project: ProjectItem | null): boolean {
    return (
      project?.title === 'Repair Management Monitoring System' ||
      project?.title === 'PSMMS Version 2 UI Build'
    );
  }

  isPosterGalleryProject(project: ProjectItem | null): boolean {
    return project?.title === 'Bayani TTRPG';
  }

  isDspeedGalleryProject(project: ProjectItem | null): boolean {
    return project?.title === "D'Speedwash App";
  }

  isTallGalleryProject(project: ProjectItem | null): boolean {
    return (
      project?.title === "D'Speedwash App" &&
      this.getActiveGalleryMedia()?.frame === 'mobile'
    );
  }

  shouldShowGalleryRail(): boolean {
    if (!this.projectGalleryProject) {
      return false;
    }

    if (!this.isMobileViewport) {
      return true;
    }

    return this.isDspeedGalleryProject(this.projectGalleryProject);
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
  }

  openProjectGallery(
    project: ProjectItem,
    index = 0,
    frameFilter: ProjectMediaItem['frame'] | null = null,
  ): void {
    if (!project.media.length) {
      return;
    }

    this.projectGalleryProject = project;
    this.projectGalleryFrameFilter = frameFilter;

    const media = this.galleryProjectMedia;
    if (!media.length) {
      return;
    }

    if (frameFilter) {
      const targetMedia = project.media[index] ?? null;
      const filteredIndex = targetMedia
        ? media.findIndex((mediaItem) => mediaItem.src === targetMedia.src)
        : 0;
      this.projectGalleryActiveIndex = filteredIndex >= 0 ? filteredIndex : 0;
    } else {
      this.projectGalleryActiveIndex = Math.min(Math.max(index, 0), media.length - 1);
    }

    this.setActiveProjectMedia(project, index);
    this.isProjectGalleryOpen = true;
    this.isGalleryZoomed = false;
    this.syncBodyScrollLock();
  }

  closeProjectGallery(): void {
    this.isProjectGalleryOpen = false;
    this.projectGalleryProject = null;
    this.projectGalleryFrameFilter = null;
    this.projectGalleryActiveIndex = 0;
    this.isGalleryZoomed = false;
    this.galleryTouchStartX = null;
    this.galleryTouchStartY = null;
    this.syncBodyScrollLock();
  }

  nextOpenProjectGalleryMedia(): void {
    const media = this.galleryProjectMedia;
    if (!media.length) {
      return;
    }

    this.projectGalleryActiveIndex = (this.getGalleryMediaIndex() + 1) % media.length;
    this.isGalleryZoomed = false;
  }

  prevOpenProjectGalleryMedia(): void {
    const media = this.galleryProjectMedia;
    if (!media.length) {
      return;
    }

    this.projectGalleryActiveIndex =
      (this.getGalleryMediaIndex() - 1 + media.length) % media.length;
    this.isGalleryZoomed = false;
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
      this.isResumePreviewOpen || this.isProjectGalleryOpen ? 'hidden' : '';
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

  getExperienceHighlights(exp: ExperienceItem): string[] {
    if (this.isExperienceExpanded(exp.role)) {
      return exp.highlights;
    }

    return exp.highlights.slice(0, this.collapsedHighlightCount);
  }

  shouldShowExperienceToggle(exp: ExperienceItem): boolean {
    return exp.highlights.length > this.collapsedHighlightCount;
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
    this.scrollChatToBottom();
  }

  closeChat(): void {
    this.isChatOpen = false;
    this.isBotTyping = false;
    if (this.chatReplyTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.chatReplyTimer);
      this.chatReplyTimer = null;
    }
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
    this.startCatFrameLoop();
    this.scheduleHomeHashTopLock();
    this.scheduleFirstVisitChatOpen();

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
    if (this.chatAutoOpenTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.chatAutoOpenTimer);
      this.chatAutoOpenTimer = null;
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
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

    this.cacheTrackedSections();
    this.updateActiveSectionFromViewport();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateActiveSectionFromViewport();
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
          if (entry.intersectionRatio > 0.16) {
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

