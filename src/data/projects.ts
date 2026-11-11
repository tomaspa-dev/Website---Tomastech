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

// Spanish translations for projects (matching exact technical invariants)
const SPANISH_OVERRIDES: Record<string, Partial<Project>> = {
  'api-usage-guard': {
    title: 'API Usage Guard — Control de Cupos y Exportaciones',
    description: 'API multi-inquilino para una plataforma SaaS sintética que aplica cupos de exportación por organización, balance atómico, control de concurrencia y reintentos idempotentes.',
    details: {
      ...projects[0].details,
      concept: 'Una API SaaS sintética que permite a las organizaciones solicitar exportaciones de datos sin exceder su cupo por periodo, garantizando evaluación atómica de saldo y seguridad en reintentos.',
      features: [
        'Resolución de identidad del inquilino desde contexto de autenticación confiable',
        'Deducción atómica de cupo previa a la admisión de la exportación',
        'Soporte de Idempotency-Key para prevenir doble consumo en reintentos de red',
        'Detección determinista de conflicto ante reutilización de llave con distinta carga',
        'Evaluación de semántica HTTP para agotamiento de cupo (403 Prohibido vs 429 Demasiadas Solicitudes) y trazabilidad'
      ],
      scope: [
        'Identificación de inquilino y asignación sintética de cupo',
        'Admisión síncrona de exportación y balance de cupo',
        'Almacén de idempotencia y mecanismo de repetición segura',
        'Prevención de condiciones de carrera y concurrencia',
        'Simulación de fallas de red (respuestas perdidas y reintentos)',
        'Registros observables y script de reinicio para demo'
      ],
      architectureFocus: [
        'Contabilidad atómica de cupo en capa de persistencia',
        'Validación en capa de dominio vs. limitador en API Gateway',
        'Máquina de estados idempotente para deduplicación de solicitudes',
        'Modelado predecible de errores HTTP y seguridad de contrato',
        'Suite de pruebas automatizadas reproducibles con casos límite'
      ],
      domainContext: 'Las solicitudes de exportación en un SaaS deben admitirse solo si el inquilino cuenta con cupo en su ciclo activo. Tiempos de espera en red provocan reintentos frecuentes; el sistema debe garantizar que una solicitud duplicada retorne la respuesta previa sin descontar cupo dos veces.',
      coreInvariants: [
        'El cupo no puede caer bajo cero ante solicitudes concurrentes (bloqueo transaccional atómico).',
        'Reintentar una solicitud con la misma Idempotency-Key devuelve el resultado original sin descontar cupo adicional.',
        'Reutilizar una Idempotency-Key con parámetros diferentes produce un 409 Conflict determinista.',
        'Tener cupo cero devuelve de inmediato un contrato HTTP explícito sin iniciar generación sintética.'
      ],
      architecturalDecisions: [
        {
          question: '¿Por qué validación a nivel de aplicación en lugar de rate limiter en API Gateway?',
          decision: 'Verificación transaccional a nivel de aplicación dentro del dominio del servicio.',
          tradeOff: 'Un API Gateway cuenta peticiones en el borde, pero carece de contexto de negocio multi-inquilino, reversiones transaccionales e invariantes de cupo.',
          status: 'Proposed'
        },
        {
          question: '¿Por qué admisión síncrona antes del procesamiento pesado en segundo plano?',
          decision: 'Validación de cupo y respuesta de admisión síncrona, desacoplada de la generación pesada.',
          tradeOff: 'Respuesta inmediata al cliente sobre la aceptación del cupo sin sobrecargar el alcance del MVP con colas complejas.',
          status: 'Under evaluation'
        }
      ],
      learningMilestones: [
        '1. Definición de actores, aislamiento de inquilinos y unidades de cupo',
        '2. Reglas de periodo y especificación de contrato HTTP predecible',
        '3. Persistencia atómica y mecanismo de idempotencia para solicitudes',
        '4. Pruebas de concurrencia y protección contra condiciones de carrera',
        '5. Simulación de fallas de red y verificación de recuperación en reintentos',
        '6. Entorno local en Docker, pruebas automatizadas y script de reinicio'
      ],
      currentStatus: 'Fase: Definición de Alcance y Diseño de Arquitectura.',
      caseStudyNote: 'Este caso de estudio documenta el modelo de dominio, trade-offs y pruebas de verificación conforme se construye el sistema.'
    }
  },
  'loan-payment-reconciliation': {
    title: 'Loan Payment Operations & Reconciliation — Operaciones de Pago y Conciliación',
    description: 'Simulador de operaciones financieras que coordina cobro de cuotas con un proveedor externo, resuelve tiempos de espera ambiguos mediante consultas activas y concilia libros internos con extractos sintéticos.',
    details: {
      ...projects[1].details,
      concept: 'Simulador de una entidad crediticia que gestiona obligaciones de préstamos. Procesa resultados de pago, maneja tiempos de espera inciertos mediante consulta pull-first y concilia registros internos contra reportes diarios sintéticos.',
      features: [
        'Máquina de estados de cuota (Pendiente, Pagada, Parcial, Ambigua, En Revisión)',
        'Imputación a una única cuota por intento de pago',
        'Consulta de estado activa (pull-first) ante tiempos de espera del proveedor',
        'Prevención de doble aplicación ante respuestas ambiguas o reintentos',
        'Cotejo automatizado entre transacciones internas y reportes del proveedor',
        'Enrutamiento a cola de excepciones para auditoría ante discrepancias'
      ],
      scope: [
        'Modelo de dominio de cuotas, préstamos y cronogramas',
        'Integración simulada con proveedor externo de pagos',
        'Motor de sondeo pull-first para resolución de timeouts',
        'Libro contable de aplicación de pagos idempotente',
        'Detección de discrepancias y marcado de excepciones',
        'Herramienta de conciliación contra extractos diarios sintéticos'
      ],
      architectureFocus: [
        'Consistencia de transiciones en la máquina de estados financiera',
        'Regla objetivo: Prevención de aplicaciones duplicadas de cuotas',
        'Evaluación arquitectónica: Enfoque Pull-first vs. Webhooks',
        'Libro mayor de transacciones determinista y pista de auditoría',
        'Generación de datos sintéticos para conciliación de casos de borde'
      ],
      domainContext: 'Cuando un cliente paga una cuota, la respuesta del proveedor puede sufrir un timeout. Tratar el timeout como fallo arriesga cobrar doble al cliente; tratarlo como éxito arriesga dinero no recaudado. El sistema clasifica el timeout como "Inconcluso" y consulta activamente antes de registrar el abono.',
      coreInvariants: [
        'Una cuota de préstamo no puede pasar a Pagada sin una referencia confirmada y única del proveedor.',
        'Los tiempos de espera de red se tratan como Inconclusos; nunca se asumen automáticamente como Fallidos ni Exitosos.',
        'Las modificaciones de saldo contable son idempotentes; consultar una transacción liquidada no puede duplicar el abono.',
        'Cualquier discrepancia entre el reporte del proveedor y el libro interno detiene el procesamiento automático y marca el registro para auditoría.'
      ],
      architecturalDecisions: [
        {
          question: '¿Por qué consultas de estado pull-first en lugar de webhooks en el MVP inicial?',
          decision: 'Motor de consulta activa pull-first.',
          tradeOff: 'Reduce la superficie de ataque inicial al evitar exponer un endpoint receptor de webhooks. Añade consultas de sondeo y latencia; no elimina por sí solo la necesidad de autenticación, protección de secretos, límites de llamadas ni tratamiento de errores.',
          status: 'Accepted'
        },
        {
          question: '¿Cómo manejar discrepancias de montos y referencias?',
          decision: 'Cola de excepciones para el operador con historial de auditoría completo.',
          tradeOff: 'Previene ajustes contables automáticos erróneos cuando comisiones externas o montos parciales difieren del cronograma programado.',
          status: 'Proposed'
        }
      ],
      learningMilestones: [
        '1. Glosario de dominio: préstamo, cuota, intento, resultado, abono, excepción',
        '2. Máquina de estados finitos y reglas de transición deterministas',
        '3. Persistencia atómica de libros y validación de idempotencia',
        '4. Motor de consulta pull-first para resolución de estados ambiguos',
        '5. Cotejo de transacciones contra reportes sintéticos de liquidación',
        '6. Seguridad, perfiles de operador y banco de pruebas sintéticas'
      ],
      currentStatus: 'Fase: Alcance Definido y Arquitectura Esbozada. Programado para implementación tras el Proyecto 01.',
      caseStudyNote: 'Este caso de estudio describe el diseño de la máquina de estados y la estrategia de conciliación previo a la codificación, basado en datos financieros sintéticos.'
    }
  },
  'construction-equipment-erp': {
    title: 'Construction Equipment Operations ERP — ERP Demo de Venta y Alquiler',
    description: 'ERP de operaciones que separa el inventario de venta de maquinaria nueva de la flota de unidades físicas serializadas para alquiler, aplicando invariantes de disponibilidad temporal sin solapamiento e inspección técnica de retorno.',
    details: {
      ...projects[2].details,
      concept: 'Un ERP operativo diseñado para maquinaria pesada y equipos de construcción. Mantiene separación estricta de dominio entre el inventario de venta y las unidades físicas serializadas alquiladas por ventanas de fecha con inspección técnica obligatoria post-devolución.',
      features: [
        'Separación estricta entre inventario de venta y flota física de alquiler',
        'Reserva temporal de activos que previene solapamiento de fechas',
        'Ciclo de vida de maquinaria (Disponible, Reservada, Despachada, Retornada, En Inspección, Mantenimiento)',
        'Inspección técnica post-devolución que impide re-alquiler inmediato sin visto bueno',
        'Historial de mantenimiento y horómetro por unidad serializada'
      ],
      scope: [
        'Catálogo dual (Stock para venta vs. Flota serializada para alquiler)',
        'Flujo de órdenes de venta directa',
        'Motor de disponibilidad y reservas por rango de fechas',
        'Control de custodia en despacho e inspección de retorno',
        'Bloqueo operativo por mantenimientos preventivos',
        'Roles de operador, registro de auditoría y datos sintéticos de prueba'
      ],
      architectureFocus: [
        'Modelado de dominio: Stock de venta vs. Unidades físicas de alquiler',
        'Concurrencia en reservas temporales y prevención de colisiones',
        'Restricciones de exclusión en PostgreSQL vs. bloqueos en aplicación',
        'Registro inmutable de transiciones de custodia del activo',
        'Conjunto sintético de maquinaria y flujos de órdenes en múltiples etapas'
      ],
      domainContext: 'Una empresa de maquinaria pesada no puede gestionar el alquiler como inventario común: cada máquina tiene número de serie único, horómetro, historial mecánico y calendario. Una máquina alquilada no puede solaparse en fechas, y una retornada debe pasar inspección antes de volver a la flota disponible.',
      coreInvariants: [
        'El stock de venta no puede alquilarse, y las unidades serializadas de la flota de alquiler no pueden descontarse como ventas.',
        'Una máquina de alquiler serializada no puede tener reservas activas solapadas en ningún intervalo de fechas.',
        'El retorno de una unidad la coloca en "Bajo Inspección", impidiendo nueva reserva hasta contar con certificación técnica.',
        'Toda transición de custodia (despacho, retorno, mantenimiento) genera registros inmutables de auditoría.'
      ],
      architecturalDecisions: [
        {
          question: '¿Cómo prevenir reservas solapadas de alquiler en maquinaria serializada?',
          decision: 'Evaluar restricciones de exclusión en PostgreSQL junto a verificaciones a nivel de aplicación.',
          tradeOff: 'Las restricciones de exclusión a nivel de base de datos buscan garantizar intervalos sin solapamientos ante concurrencia, frente a validaciones solo en memoria.',
          status: 'Under evaluation'
        },
        {
          question: '¿Relación con experiencia previa en ERPs privados?',
          decision: 'Proyecto nuevo e independiente desarrollado con datos sintéticos y cero código de empresas privadas.',
          tradeOff: 'Protege la confidencialidad comercial demostrando modelado de dominio riguroso y arquitectura abierta.',
          status: 'Accepted'
        }
      ],
      learningMilestones: [
        '1. Vocabulario de dominio, modelo de entidades y mapa de estados',
        '2. Separación de catálogo de venta y activos serializados de alquiler',
        '3. Motor de reservas y cálculo de disponibilidad temporal',
        '4. Despacho, inspección de retorno y bloqueos de mantenimiento',
        '5. Validación de concurrencia bajo intentos simultáneos de reserva',
        '6. Fixtures de prueba automatizados y entorno local reproducible'
      ],
      currentStatus: 'Fase: Iniciativa Capstone — Concepto e Invariantes Aprobados. Diseño técnico detallado tras Proyectos 01 y 02.',
      caseStudyNote: 'Este proyecto sintetiza experiencia de dominio en una arquitectura abierta y documentada, desarrollada desde cero con datos empresariales sintéticos.'
    }
  }
};

/**
 * Returns the localized project list.
 * Fallback is English.
 */
export function getLocalizedProjects(lang: 'en' | 'es' = 'en'): Project[] {
  if (lang === 'en') return projects;
  
  return projects.map((p) => {
    const override = SPANISH_OVERRIDES[p.id];
    if (!override) return p;
    return {
      ...p,
      ...override,
      details: {
        ...p.details,
        ...(override.details || {})
      }
    };
  });
}
