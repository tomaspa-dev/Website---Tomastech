export interface Project {
  id: string;
  title: string;
  category: 'Landing Pages' | 'Corporate Websites' | 'Web Applications' | 'WordPress Themes' | 'Extensions';
  description: string;
  image: string;
  tags: string[];
  link?: string;
  status?: 'In Development' | 'Planned' | 'Completed';
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
  };
}

export const projects: Project[] = [
  // --- WEB APPLICATIONS ---
  {
    id: 'distribution-erp',
    title: 'Distribution ERP',
    category: 'Web Applications',
    status: 'In Development',
    description: 'Full-stack business management system for a wholesale distribution company, covering sales, purchasing, inventory, accounting, logistics and operational reporting.',
    image: '',
    tags: ['Business Systems', 'ERP', 'Architecture', 'AI'],
    link: '#',
    details: {
      concept: 'Business management platform designed to unify commercial, financial, inventory and logistics operations in a single system.',
      features: [
        'Sales & quotations workflow',
        'Purchasing & inventory control',
        'Warehouse & route logistics',
        'Automated accounting & operational reports',
        'User roles, permissions & audit trail'
      ],
      scope: [
        'Sales & quotations',
        'Purchasing',
        'Inventory management',
        'Warehouse operations',
        'Accounting workflows',
        'Route management',
        'Document generation',
        'Operational reports',
        'User roles & permissions',
        'Audit trail'
      ],
      architectureFocus: [
        'Modular business domains',
        'PostgreSQL data model',
        'API-driven backend',
        'Role-based access control',
        'Asynchronous processing',
        'Document generation',
        'AI-assisted workflows'
      ],
      plannedStack: [
        { category: 'Frontend', value: 'React / Next.js' },
        { category: 'Backend', value: 'Node.js' },
        { category: 'Database', value: 'PostgreSQL / Neon' },
        { category: 'Storage', value: 'Supabase' },
        { category: 'Deployment', value: 'Netlify + Render' }
      ],
      currentStatus: 'Architecture & domain modeling',
      caseStudyNote: 'This case study will document the problem, domain modeling, architectural decisions, implementation process and lessons learned as the system evolves.',
      stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Neon', 'Supabase', 'Render'],
      time: 'In Development'
    }
  },
  {
    id: 'logistics-tms',
    title: 'Logistics & TMS Platform',
    category: 'Web Applications',
    status: 'In Development',
    description: 'Transportation management platform designed to coordinate orders, vehicles, drivers, routes, GPS tracking and proof of delivery.',
    image: '',
    tags: ['Logistics', 'Real-time', 'Maps', 'Architecture'],
    link: '#',
    details: {
      concept: 'A transportation management system designed around the operational workflow of a third-party logistics company handling time-sensitive and perishable goods.',
      features: [
        'Transport order coordination',
        'Vehicle & driver fleet management',
        'Route planning & live GPS tracking',
        'Proof of delivery (POD) validation',
        'Incident handling & customer visibility'
      ],
      scope: [
        'Transport orders',
        'Vehicle management',
        'Driver management',
        'Route planning',
        'GPS tracking',
        'Delivery status',
        'Proof of delivery',
        'Route incidents',
        'Customer visibility',
        'Operational reporting'
      ],
      architectureFocus: [
        'Event-driven workflows',
        'Real-time location updates',
        'Geospatial data (PostGIS)',
        'Background jobs & queues',
        'Push notifications & webhooks',
        'Auditability & event logging',
        'Failure recovery & offline handling'
      ],
      plannedStack: [
        { category: 'Frontend', value: 'React / Next.js / Mapbox' },
        { category: 'Backend', value: 'Node.js / Express' },
        { category: 'Database', value: 'PostgreSQL / PostGIS' },
        { category: 'Realtime', value: 'Redis / WebSockets' },
        { category: 'Deployment', value: 'Render / AWS' }
      ],
      currentStatus: 'Domain design & architecture',
      caseStudyNote: 'This case study will document the problem, domain modeling, architectural decisions, implementation process and lessons learned as the system evolves.',
      stack: ['Next.js', 'Node.js', 'PostgreSQL', 'PostGIS', 'Redis', 'WebSockets'],
      time: 'In Development'
    }
  },
  {
    id: 'ai-document-intelligence',
    title: 'AI Document Intelligence',
    category: 'Web Applications',
    status: 'In Development',
    description: 'AI-powered document processing pipeline designed to extract, validate and transform business documents into structured operational data.',
    image: '',
    tags: ['AI', 'Automation', 'Document Processing', 'Architecture'],
    link: '#',
    details: {
      concept: 'A document processing system exploring how AI can reduce manual data entry and transform unstructured business documents into structured, verifiable data.',
      features: [
        'Automated PDF & invoice ingestion',
        'AI document classification & OCR',
        'Structured schema extraction',
        'Human-in-the-loop review interface',
        'Direct export to business ERP systems'
      ],
      scope: [
        'PDF ingestion',
        'Document classification',
        'OCR / extraction',
        'Structured data generation',
        'Validation pipelines',
        'Human review interface',
        'Document storage',
        'Audit trail',
        'Export to business systems'
      ],
      architectureFocus: [
        'Async processing pipelines',
        'Queue-based workflows (BullMQ)',
        'AI model orchestration (LLMs / Vision)',
        'Validation & confidence scoring',
        'Human-in-the-loop fallback',
        'Structured error handling',
        'Operational observability'
      ],
      plannedStack: [
        { category: 'Frontend', value: 'React / TailwindCSS' },
        { category: 'Backend', value: 'Node.js / Python' },
        { category: 'AI Models', value: 'OpenAI / Claude Vision' },
        { category: 'Database', value: 'PostgreSQL / Supabase' },
        { category: 'Queues', value: 'Redis / BullMQ' }
      ],
      currentStatus: 'Architecture & AI workflow design',
      caseStudyNote: 'This case study will document the problem, domain modeling, architectural decisions, implementation process and lessons learned as the system evolves.',
      stack: ['React', 'Node.js', 'Python', 'OpenAI API', 'PostgreSQL', 'Redis'],
      time: 'In Development'
    }
  },
  {
    id: 'cold-chain-wms',
    title: 'Cold Chain & WMS',
    category: 'Web Applications',
    status: 'Planned',
    description: 'Warehouse and cold-chain management system focused on inventory traceability, FEFO, temperature events and operational control.',
    image: '',
    tags: ['WMS', 'Cold Chain', 'IoT', 'Security'],
    link: '#',
    details: {
      concept: 'A warehouse and cold-chain platform focused on traceability of temperature-sensitive inventory from receiving to dispatch.',
      features: [
        'Warehouse zone & location mapping',
        'Batch & lot FEFO expiration tracking',
        'Temperature anomaly alerts',
        'End-to-end inventory movement logs',
        'Dispatch control & compliance audits'
      ],
      scope: [
        'Warehouse management',
        'Batch & lot tracking',
        'FEFO expiration management',
        'Inventory movements & transfers',
        'Storage locations & zones',
        'Temperature sensor events',
        'Real-time alerts',
        'Complete traceability',
        'Dispatch control & manifests'
      ],
      architectureFocus: [
        'Event-driven architecture',
        'Time-series data storage',
        'Inventory consistency & locking',
        'Threshold alert pipelines',
        'Immutable audit trails',
        'System resilience & offline sync',
        'Operational observability'
      ],
      plannedStack: [
        { category: 'Frontend', value: 'React / Next.js' },
        { category: 'Backend', value: 'Node.js / Go' },
        { category: 'Database', value: 'PostgreSQL / TimescaleDB' },
        { category: 'IoT Protocol', value: 'MQTT / WebSockets' },
        { category: 'Deployment', value: 'AWS / Docker' }
      ],
      currentStatus: 'Planned',
      caseStudyNote: 'This case study will document the problem, domain modeling, architectural decisions, implementation process and lessons learned as the system evolves.',
      stack: ['Next.js', 'Node.js', 'PostgreSQL', 'TimescaleDB', 'MQTT', 'Docker'],
      time: 'Planned'
    }
  },
  {
    id: 'matchvibe',
    title: 'MatchVibe - Dating App',
    category: 'Web Applications',
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

  // --- CORPORATE WEBSITES ---
  {
    id: 'rg-distribuciones',
    title: 'RG Distribuciones Perú',
    category: 'Corporate Websites',
    description: 'Corporate website for distribution company with sustainability focus.',
    image: '/img/rg-distribuciones.webp',
    tags: ['Astro', 'React', 'Corporate'],
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

  // --- LANDING PAGES ---
  {
    id: 'summerwave',
    title: 'SummerWave - Summer Clothing',
    category: 'Landing Pages',
    description: 'Vibrant landing page for summer clothing collection with fluid animations.',
    image: '/img/summerwave.webp',
    tags: ['Astro', 'React', 'Tailwind', 'Framer Motion'],
    link: 'https://summerwave.netlify.app/',
    details: {
      concept: 'Promotional landing page for summer season launch.',
      features: ['Looks carousel', 'Entry animations', 'Countdown banner', 'Smooth scroll', 'Style quiz', 'Product gallery'],
      stack: ['Astro', 'React', 'TailwindCSS', 'Framer Motion'],
      time: '5-7 days',
      metrics: ['Lighthouse Score: >95', 'FCP: <1.5s']
    }
  },
  {
    id: 'elegancegala',
    title: 'EleganceGala - Fashion Store',
    category: 'Landing Pages',
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
  {
    id: 'matchvibe',
    title: 'MatchVibe - Dating App',
    category: 'Web Applications',
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

  // --- WORDPRESS THEMES ---
  {
    id: 'fashionhub',
    title: 'FashionHub Theme',
    category: 'WordPress Themes',
    hidden: true,
    description: 'WooCommerce theme specialized for women\'s fashion stores.',
    image: '/img/fashionhub.webp',
    tags: ['WordPress', 'WooCommerce', 'Elementor'],
    link: '#',
    details: {
      concept: 'Premium theme for women\'s clothing stores.',
      features: ['Interactive lookbook', 'Size guide', 'Color swatches', 'Instagram shop'],
      stack: ['WordPress', 'WooCommerce', 'Elementor Pro', 'PHP'],
      time: '4-5 weeks'
    }
  },

  // --- EXTENSIONS ---
  {
    id: 'codesnippets',
    title: 'CodeSnippets Pro',
    category: 'Extensions',
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
