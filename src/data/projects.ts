export interface ArchitecturalDecision {
  question: string;
  decision: string;
  tradeOff: string;
  status: 'Under evaluation' | 'Proposed' | 'Accepted';
}

export interface Project {
  id: string;
  title: string;
  workName?: string;
  category: 'Systems & Backend' | 'Corporate Websites' | 'Landing Pages' | 'Web Applications' | 'WordPress Themes' | 'Extensions';
  description: string;
  image: string;
  tags: string[];
  link?: string;
  repoLink?: string;
  status: 'Selected / Design & Learning' | 'Selected / Planned' | 'Future Capstone / Defined Scope' | 'Completed Solution';
  editorialBadge?: string;
  hidden?: boolean;
  details: {
    concept: string;
    features: string[];
    stack: string[];
    time: string;
    metrics?: string[];
    scope?: string[];
    architectureFocus?: string[];
    plannedStack?: { category: string; value: string }[];
    currentStatus?: string;
    caseStudyNote?: string;
    // Extended fields for systems architecture & learning milestones:
    domainContext?: string;
    coreInvariants?: string[];
    architecturalDecisions?: ArchitecturalDecision[];
    learningMilestones?: string[];
  };
}

export const projects: Project[] = [
  // =========================================================================
  // --- WHERE I'M HEADED: BACKEND & SYSTEMS ARCHITECTURE (3 Core Projects) ---
  // =========================================================================

  // ── Project 01 ─────────────────────────────────────────────────────────────
  {
    id: 'api-usage-guard',
    title: 'API Usage Guard — Quota & Export Controls',
    workName: 'API Usage Guard',
    category: 'Systems & Backend',
    status: 'Selected / Design & Learning',
    editorialBadge: 'Design & Learning',
    description: 'Multi-tenant API for a synthetic SaaS platform enforcing per-organization export quotas, atomic balance tracking, concurrency safeguards, and idempotent retries.',
    image: '',
    tags: ['Backend API', 'Multi-tenant', 'Idempotency', 'Concurrency', 'System Design'],
    link: '#',
    details: {
      concept: 'A synthetic SaaS API that allows organizations to request synthetic data exports without exceeding an allocated quota per period, ensuring atomic balance evaluation and idempotent retry safety.',
      features: [
        'Tenant identity resolution from trusted auth context',
        'Atomic quota deduction before export admission',
        'Idempotency-Key support to prevent double consumption on retries',
        'Safe conflict detection on reused keys with altered payloads',
        'Evaluation of HTTP status semantics for quota exhaustion (evaluating 403 Forbidden vs 429 Too Many Requests criteria) and request tracing'
      ],
      scope: [
        'Tenant identification & synthetic quota allocation',
        'Synchronous export admission & quota balance checks',
        'Idempotency store & replay mechanism',
        'Concurrency race condition prevention',
        'Failure simulation (lost responses & retries)',
        'Observable logs & synthetic demo reset'
      ],
      architectureFocus: [
        'Atomic quota accounting at persistence layer',
        'Application-level quota rules vs. API Gateway rate limiting trade-off',
        'Idempotent state machine for request deduplication',
        'Predictable HTTP error modeling & contract safety',
        'Reproducible automated test suite with edge cases'
      ],
      domainContext: 'SaaS export requests must be admitted only if the tenant has remaining quota for the active billing cycle. Network timeouts frequently cause clients to retry; the system must guarantee that a duplicate request returns the previous admission without double-charging the quota.',
      coreInvariants: [
        'Quota cannot drop below zero under concurrent requests (atomic lock / transactional balance check).',
        'Retrying a request with the same Idempotency-Key returns the original result without deducting additional quota.',
        'Reusing an Idempotency-Key with different payload parameters yields a deterministic 409 Conflict.',
        'Zero quota immediately returns an explicit HTTP contract without triggering synthetic export generation.'
      ],
      architecturalDecisions: [
        {
          question: 'Why application-level quota validation instead of an API Gateway rate limiter?',
          decision: 'Application-level transactional check within the service domain.',
          tradeOff: 'An API Gateway counts requests efficiently at the edge, but lacks fine-grained multi-tenant billing domain awareness, transactional rollbacks, and business quota invariants.',
          status: 'Proposed'
        },
        {
          question: 'Why synchronous admission before background export processing?',
          decision: 'Synchronous quota validation and admission response, decoupled from heavy artifact generation.',
          tradeOff: 'Immediate client feedback on quota acceptance without maintaining complex job queue states in MVP scope.',
          status: 'Under evaluation'
        }
      ],
      learningMilestones: [
        '1. Actor, tenant isolation and quota unit definition',
        '2. Period rules and predictable HTTP contract specification',
        '3. Atomic persistence and request idempotency mechanism',
        '4. Concurrency testing and race condition safeguards',
        '5. Network failure simulation and retry recovery verification',
        '6. Local Docker environment, automated tests and demo reset script'
      ],
      currentStatus: 'Phase: Problem Scoping & Architecture Design. Implementation planned for Milestone 1.',
      caseStudyNote: 'This case study documents the domain model, trade-offs, and verification test suite as the system is constructed in public.',
      stack: ['Python / Node.js', 'PostgreSQL', 'Docker', 'REST API', 'Automated Testing'],
      time: 'Design & Learning'
    }
  },

  // ── Project 02 ─────────────────────────────────────────────────────────────
  {
    id: 'loan-payment-reconciliation',
    title: 'Loan Payment Operations & Reconciliation',
    workName: 'Loan Payment Operations Simulator',
    category: 'Systems & Backend',
    status: 'Selected / Planned',
    editorialBadge: 'Planned — Follows Project 01',
    description: 'Financial operations simulator coordinating installment collections with an external provider, handling ambiguous timeouts, and reconciling internal ledgers against synthetic provider statements.',
    image: '',
    tags: ['Financial State Machine', 'Payment Operations', 'Pull-first Query', 'Reconciliation', 'Idempotency'],
    link: '#',
    details: {
      concept: 'A non-bank lender simulator managing customer loan obligations. It processes payment outcomes, handles uncertain timeouts through a pull-first polling strategy, and reconciles internal ledgers against synthetic daily provider reports.',
      features: [
        'Loan installment state machine (Pending, Paid, Partial, Ambiguous, In Review)',
        'Single installment targeting per payment attempt',
        'Pull-first status inquiry upon external provider timeouts',
        'Prevention of double-application on ambiguous responses',
        'Automated matching between internal transactions and synthetic provider reports',
        'Exception routing for operator audit on amount discrepancies'
      ],
      scope: [
        'Installment & loan debt domain model',
        'Simulated payment provider integration',
        'Pull-first polling engine for timeout resolution',
        'Idempotent payment application ledger',
        'Discrepancy detection & exception flag mechanism',
        'Synthetic daily report reconciliation tool'
      ],
      architectureFocus: [
        'Financial state transition consistency',
        'Target invariant: Prevention of duplicate installment applications',
        'Pull-first vs. Webhook architectural trade-off',
        'Deterministic transaction ledger & audit trail',
        'Synthetic data generation for edge-case reconciliation'
      ],
      domainContext: 'When customers pay installments, payment provider responses may time out or return ambiguous states. Treating a timeout as a failure risks double-charging the customer; treating it as success risks uncollected funds. The system treats timeouts as "Inconclusive" and uses active inquiry before applying ledger changes.',
      coreInvariants: [
        'A loan installment cannot transition to Paid without a confirmed, unique provider reference.',
        'Timeouts are treated as Inconclusive; never automatically assumed as Failed or Succeeded.',
        'Ledger balance modifications must be idempotent; querying a settled transaction cannot re-credit the loan.',
        'Any discrepancy between provider settlement report and internal ledger stops automatic processing and flags the record for audit.'
      ],
      architecturalDecisions: [
        {
          question: 'Why pull-first status inquiries instead of webhooks in the initial MVP?',
          decision: 'Pull-first active status query engine.',
          tradeOff: 'Reduces public attack surface during initial MVP by avoiding an open webhook ingress endpoint. Adds polling roundtrips and potential latency; does not by itself eliminate the need for authentication, secret protection, rate limits, and error handling.',
          status: 'Accepted'
        },
        {
          question: 'How to handle amount and reference mismatches?',
          decision: 'Operator exception queue with full audit history.',
          tradeOff: 'Prevents automatic erroneous accounting adjustments when external fees or partial amounts differ from schedule.',
          status: 'Proposed'
        }
      ],
      learningMilestones: [
        '1. Domain glossary: loan, installment, attempt, outcome, application, exception',
        '2. Conclusive state machine and transition rules',
        '3. Atomic ledger persistence and idempotency validation',
        '4. Pull-first inquiry engine for timeout resolution',
        '5. Transaction matching against synthetic provider statements',
        '6. Security, operator roles, and synthetic test harness'
      ],
      currentStatus: 'Phase: Scope Defined & Architecture Outlined. Scheduled for implementation following Project 01 completion.',
      caseStudyNote: 'This case study outlines the state machine design and reconciliation strategy prior to coding, built strictly with synthetic financial data.',
      stack: ['Python / Node.js', 'PostgreSQL', 'State Machines', 'Reconciliation', 'Docker'],
      time: 'Planned'
    }
  },

  // ── Project 03 ─────────────────────────────────────────────────────────────
  {
    id: 'construction-equipment-erp',
    title: 'Construction Equipment Operations ERP',
    workName: 'Equipment Sales & Fleet Rental Demo',
    category: 'Systems & Backend',
    status: 'Future Capstone / Defined Scope',
    editorialBadge: 'Capstone — Scope Defined',
    description: 'Operations ERP separating new equipment sales inventory from serialized rental fleet assets, enforcing non-overlapping date reservation invariants and return inspection workflows.',
    image: '',
    tags: ['Operations ERP', 'Inventory Segregation', 'Temporal Availability', 'Asset Lifecycle', 'PostgreSQL'],
    link: '#',
    details: {
      concept: 'An operational ERP designed around heavy machinery and construction equipment. It maintains strict domain separation between new equipment stock sold off-the-shelf and serialized physical fleet units rented across temporal windows with mandatory post-return inspection.',
      features: [
        'Strict separation between sales inventory and serialized rental fleet units',
        'Temporal asset reservation preventing date overlaps',
        'Equipment status lifecycle (Available, Reserved, Dispatched, Returned, Under Inspection, Maintenance)',
        'Post-return condition check preventing immediate re-rental before clearance',
        'Machine maintenance history and unit hour tracking'
      ],
      scope: [
        'Dual-catalog domain model (Stock for sale vs. Serialized fleet for rent)',
        'Direct sale order workflow',
        'Date-range rental booking & availability engine',
        'Dispatch & return inspection custody handoff',
        'Preventive maintenance status lockouts',
        'Operator roles, audit trail, and synthetic seed data'
      ],
      architectureFocus: [
        'Domain modeling: Sale stock vs. Rental physical assets',
        'Temporal reservation concurrency & collision avoidance',
        'PostgreSQL exclusion constraints vs. application-level locks',
        'Immutable asset custody transition log',
        'Synthetic equipment dataset and multi-step order workflows'
      ],
      domainContext: 'Heavy construction equipment businesses cannot treat rental fleet like retail inventory: each machine has a unique serial number, operating hours, maintenance logs, and rental schedule. A rented unit cannot be booked for overlapping dates, and a returned machine must be inspected before returning to the available fleet pool.',
      coreInvariants: [
        'Sales stock cannot be leased, and serialized rental fleet units cannot be depleted through sales orders.',
        'A serialized rental machine cannot have overlapping active reservations across any date interval.',
        'Returning a machine places it into "Under Inspection", making it non-reservable until mechanically certified.',
        'All custody transitions (dispatch, return, maintenance) generate immutable audit records.'
      ],
      architecturalDecisions: [
        {
          question: 'How to prevent overlapping rental bookings for serialized equipment?',
          decision: 'Evaluate PostgreSQL exclusion constraints alongside application-level checks.',
          tradeOff: 'DB-level exclusion constraints aim to enforce non-overlapping interval safety under concurrent requests, compared to application-only validation.',
          status: 'Under evaluation'
        },
        {
          question: 'Relationship with previous private ERP experience?',
          decision: 'Brand new, independent project developed with synthetic equipment data and zero private company code.',
          tradeOff: 'Protects commercial confidentiality while showcasing advanced domain modeling and architectural rigor.',
          status: 'Accepted'
        }
      ],
      learningMilestones: [
        '1. Domain vocabulary, entity model, and workflow state map',
        '2. Separation of sales catalog vs. serialized fleet assets',
        '3. Temporal availability and reservation engine',
        '4. Dispatch, return inspection, and maintenance lockouts',
        '5. Concurrency validation under simultaneous bookings',
        '6. Automated seed fixtures and reproducible local demo environment'
      ],
      currentStatus: 'Phase: Capstone Initiative — Concept and Core Invariants Approved. Technical design scheduled after Projects 01 & 02.',
      caseStudyNote: 'This project synthesizes domain experience into a transparent, documented open architecture built entirely from scratch with synthetic business data.',
      stack: ['TypeScript / Node.js', 'PostgreSQL', 'Temporal Intervals', 'Domain Modeling', 'Docker'],
      time: 'Planned Capstone'
    }
  },

  // =========================================================================
  // --- PROVEN WORK: CLIENT & PRODUCTION WEB SOLUTIONS (Delivered Work) -----
  // =========================================================================

  // ── Corporate Websites ───────────────────────────────────────────────────
  {
    id: 'rg-distribuciones',
    title: 'RG Distribuciones Perú',
    category: 'Corporate Websites',
    status: 'Completed Solution',
    description: 'Corporate website for distribution company with sustainability focus.',
    image: '/img/rg-distribuciones.webp',
    tags: ['Astro', 'React', 'Corporate', 'SEO'],
    link: 'https://rgdistribucionesperu.com',
    details: {
      concept: 'Professional corporate website for leading ecological distribution company in Peru.',
      features: ['Modern corporate design', 'Sustainable products catalog', 'Contact form', 'Testimonials section'],
      stack: ['Astro', 'React', 'TailwindCSS'],
      time: '2-3 weeks',
      metrics: ['Lighthouse Score: >95', 'FCP: <1.5s']
    }
  },
  {
    id: 'buildpro',
    title: 'BuildPro - Construction Company',
    category: 'Corporate Websites',
    status: 'Completed Solution',
    description: 'Robust website for construction company with project portfolio.',
    image: '/img/buildpro.webp',
    tags: ['Astro', 'React', 'TailwindCSS', 'GSAP'],
    link: 'https://build-pro-es.netlify.app/',
    details: {
      concept: 'Corporate website for construction company.',
      features: ['Filterable project gallery', 'History timeline', 'Multi-step quoter', 'Legal pages', 'SEO & sitemap'],
      stack: ['Astro', 'React', 'TailwindCSS', 'GSAP'],
      time: '2-3 weeks',
      metrics: ['Lighthouse Score: >95', 'FCP: <1.5s']
    }
  },

  // ── Landing Pages ────────────────────────────────────────────────────────
  {
    id: 'summerwave',
    title: 'SummerWave - Summer Clothing',
    category: 'Landing Pages',
    status: 'Completed Solution',
    description: 'Vibrant landing page for summer clothing collection with fluid animations.',
    image: '/img/summerwave.webp',
    tags: ['Astro', 'React', 'Tailwind', 'GSAP', 'Framer Motion'],
    link: 'https://summerwave.netlify.app/',
    details: {
      concept: 'Promotional landing page for summer season launch.',
      features: ['Looks carousel', 'Entry animations', 'Countdown banner', 'Smooth scroll', 'Style quiz', 'Product gallery'],
      stack: ['Astro', 'React', 'TailwindCSS', 'GSAP', 'Framer Motion'],
      time: '5-7 days',
      metrics: ['Lighthouse Score: >95', 'FCP: <1.5s']
    }
  },
  {
    id: 'elegancegala',
    title: 'EleganceGala - Fashion Store',
    category: 'Landing Pages',
    status: 'Completed Solution',
    description: 'Gala dress boutique with premium user experience.',
    image: '/img/elegancegala.webp',
    tags: ['Astro', 'React', 'Tailwind', 'Framer Motion'],
    link: 'https://elegancegala.netlify.app/',
    details: {
      concept: 'Landing for gala dress boutique and elegant women\'s fashion.',
      features: ['Hero video', 'Interactive lookbook', 'Virtual stylist', 'Appointment booking'],
      stack: ['Astro', 'React', 'TailwindCSS', 'Framer Motion'],
      time: '5-7 days',
      metrics: ['Lighthouse Score: >90', 'FCP: <2.5s']
    }
  },
  {
    id: 'fitpro',
    title: 'FitPro Tracker',
    category: 'Landing Pages',
    status: 'Completed Solution',
    description: 'Premium tech landing for smartwatch and fitness app.',
    image: '/img/fitpro.webp',
    tags: ['Astro', 'React', 'GSAP'],
    link: 'https://fit-pro-tracker.netlify.app/',
    details: {
      concept: 'Landing for smartwatch/fitness app with premium tech design.',
      features: ['3D product showcase', 'Interactive app demo', 'Scroll-triggered animations', 'Plans comparison', 'FAQ accordion'],
      stack: ['Astro', 'React', 'TailwindCSS', 'GSAP'],
      time: '7-10 days',
      metrics: ['Lighthouse Score: >95', 'FCP: <2.5s']
    }
  },
  {
    id: 'gelatoart',
    title: 'GelatoArt - Ice Cream Shop',
    category: 'Landing Pages',
    status: 'Completed Solution',
    description: 'Delicious visual experience for artisan ice cream shop.',
    image: '/img/gelatoart.webp',
    tags: ['Astro', 'React', 'GSAP'],
    link: 'https://gelatoart.netlify.app/',
    details: {
      concept: 'Delicious and colorful landing for artisan ice cream shop.',
      features: ['Flavor carousel', 'Drip animations', 'Store locator', 'PDF menu', 'Special of the month', 'Allergen table'],
      stack: ['Astro', 'React', 'TailwindCSS', 'GSAP'],
      time: '5-7 days',
      metrics: ['Lighthouse Score: >95', 'FCP: <1.5s']
    }
  },

  // ── Archived / Reference Web Applications ────────────────────────────────
  {
    id: 'matchvibe',
    title: 'MatchVibe - Dating App',
    category: 'Web Applications',
    status: 'Completed Solution',
    hidden: true,
    description: 'Dating social network based on real interests (Spotify + Netflix).',
    image: '/img/matchvibe.webp',
    tags: ['Next.js', 'Socket.io', 'WebRTC', 'Spotify API'],
    link: '#',
    details: {
      concept: 'Tinder + Spotify + Netflix + Karma system = Dating social network based on real interests.',
      features: ['Swipe system', 'Spotify integration', 'Watch Party', 'Karma system', 'Video calls'],
      stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Socket.io', 'WebRTC'],
      time: '12-16 weeks'
    }
  },
  {
    id: 'namegenius',
    title: 'NameGenius - AI Naming',
    category: 'Web Applications',
    status: 'Completed Solution',
    hidden: true,
    description: 'AI-powered name generator for babies and pets.',
    image: '/img/namegenius.webp',
    tags: ['React', 'OpenAI API', 'Supabase'],
    link: '#',
    details: {
      concept: 'App to generate unique and meaningful names using AI.',
      features: ['Advanced filters', 'AI generation', 'Meaning and history', 'Favorites'],
      stack: ['React', 'Node.js', 'PostgreSQL', 'OpenAI API'],
      time: '2-3 weeks'
    }
  },
  {
    id: 'storygen',
    title: 'StoryGen Kids',
    category: 'Web Applications',
    status: 'Completed Solution',
    hidden: true,
    description: 'Personalized children\'s story generator with AI illustrations.',
    image: '/img/storygen.webp',
    tags: ['Next.js', 'DALL-E 3', 'ElevenLabs'],
    link: '#',
    details: {
      concept: 'Personalized story generator for kids with AI images and animations.',
      features: ['Text and image generation', 'Reading mode', 'PDF/Video export'],
      stack: ['Next.js', 'OpenAI API', 'DALL-E 3', 'ElevenLabs'],
      time: '5-7 weeks'
    }
  },
  {
    id: 'codesnippets',
    title: 'CodeSnippets Pro',
    category: 'Extensions',
    status: 'Completed Solution',
    hidden: true,
    description: 'VSCode extension for intelligent snippet management with AI.',
    image: '/img/CodeSnippetsPro.webp',
    tags: ['VSCode API', 'TypeScript', 'AI'],
    link: '#',
    details: {
      concept: 'Advanced code snippet manager with AI for VSCode.',
      features: ['Smart snippets', 'AI generation', 'Cloud sync'],
      stack: ['TypeScript', 'VSCode Extension API', 'OpenAI API'],
      time: '6-8 weeks'
    }
  }
];
