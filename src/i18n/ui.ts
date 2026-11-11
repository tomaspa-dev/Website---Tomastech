export type Lang = 'en' | 'es';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ApproachItem {
  number: string;
  title: string;
  desc: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface UITranslations {
  nav: {
    services: string;
    scope: string;
    process: string;
    portfolio: string;
    about: string;
    contact: string;
    startProject: string;
    letsTalk: string;
    work: string;
  };
  heroLanding: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: {
    experience: string;
    delivered: string;
    industries: string;
    commitment: string;
  };
  ticker: {
    title: string;
    subtitle: string;
  };
  services: {
    tag: string;
    title: string;
    subtitle: string;
    viewDetails: string;
  };
  scope: {
    tag: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    cta: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
    items: FAQItem[];
  };
  contact: {
    tag: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    sendEmail: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    submit: string;
  };
  portfolioHero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitle: string;
    readCaseStudies: string;
    getInTouch: string;
  };
  portfolioGrid: {
    tag: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    githubPrompt: string;
    githubCta: string;
  };
  process: {
    tag: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    stepBadge: string;
    steps: ProcessStep[];
  };
  approach: {
    tag: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    items: ApproachItem[];
  };
  about: {
    badgeRole: string;
    badgeLocation: string;
    badgeStatus: string;
    tag: string;
    headingPrefix: string;
    headingHighlight: string;
    p1: string;
    p2: string;
    exploringTitle: string;
    exploringText: string;
    role: string;
    cardTagline: string;
  };
  footer: {
    role: string;
    tagline: string;
    navigation: string;
    focus: string;
    connect: string;
    connectText: string;
    copyWa: string;
    copyEmail: string;
    rights: string;
    privacy: string;
    terms: string;
    focusItems: string[];
  };
}
