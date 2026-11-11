import type { ComponentType } from 'react';
import { Monitor, Database, Globe, Palette } from 'lucide-react';
import type { Lang } from '../i18n/ui';

export interface ServiceDetail {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  shortDesc: string;
  gradient: string;
  glow: string;
  iconColor: string;
  modalTitle: string;
  modalDesc: string;
  features: string[];
  techStack: string[];
  useCases: string[];
}

interface ServicesContent {
  tag: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  learnMore: string;
  keyFeatures: string;
  useCasesLabel: string;
  discussCta: string;
  items: ServiceDetail[];
}

export function getServicesContent(lang: Lang = 'en'): ServicesContent {
  if (lang === 'es') {
    return {
      tag: 'Lo Que Construyo',
      titlePrefix: 'Desde sitios web hasta',
      titleHighlight: 'software empresarial',
      subtitle:
        'Ya sea que necesites una web de alto rendimiento, un portal de clientes, un sistema interno o software a medida, diseño y construyo la solución adecuada para tu negocio.',
      learnMore: 'Saber Más',
      keyFeatures: 'Características Clave',
      useCasesLabel: 'Casos de Uso',
      discussCta: 'Consultar este servicio',
      items: [
        {
          icon: Monitor,
          title: 'Aplicaciones Web',
          shortDesc:
            'Aplicaciones web personalizadas, dashboards, portales de clientes y plataformas escalables de alto rendimiento.',
          gradient: 'from-indigo-400 to-indigo-600',
          glow: 'rgba(129, 140, 248, 0.15)',
          iconColor: 'text-indigo-400',
          modalTitle: 'Aplicaciones Web y Plataformas',
          modalDesc:
            'Aplicaciones web a medida de tus procesos: desde portales de clientes y paneles operativos hasta plataformas con múltiples roles y alta fiabilidad en tiempo real.',
          features: [
            'Desarrollo web a medida',
            'Dashboards y analítica en tiempo real',
            'Control de acceso por roles (RBAC)',
            'Autenticación y seguridad',
            'Integración de APIs',
            'Arquitectura cloud escalable',
          ],
          techStack: ['React / Next.js', 'Node.js / TypeScript', 'PostgreSQL / Redis', 'TailwindCSS'],
          useCases: [
            'Plataformas de gestión empresarial',
            'Portales de clientes y proveedores',
            'Paneles de control operativo',
            'Productos SaaS',
          ],
        },
        {
          icon: Database,
          title: 'Sistemas Empresariales',
          shortDesc:
            'ERP, inventario, ventas, logística y sistemas operativos adaptados a cómo funciona tu empresa.',
          gradient: 'from-emerald-400 to-emerald-600',
          glow: 'rgba(52, 211, 153, 0.15)',
          iconColor: 'text-emerald-400',
          modalTitle: 'Sistemas Empresariales y ERP a Medida',
          modalDesc:
            'Plataformas integrales diseñadas para tus flujos operativos: unificando ventas, inventario, compras, logística y contabilidad.',
          features: [
            'Desarrollo de ERP a medida',
            'Control de inventario y almacenes',
            'Flujos de compras y ventas',
            'Gestión de rutas y despacho',
            'Generación de reportes automáticos',
            'Pistas de auditoría y trazabilidad',
          ],
          techStack: ['Node.js / TypeScript', 'PostgreSQL / PostGIS', 'React / Next.js', 'Redis / WebSockets'],
          useCases: [
            'Empresas de distribución',
            'Operaciones mayoristas y retail',
            'Cadena de suministro y logística',
            'Flujos de producción y manufactura',
          ],
        },
        {
          icon: Database,
          title: 'Automatización e IA',
          shortDesc:
            'Procesamiento de documentos, automatización de flujos y pipelines de datos inteligentes para elevar la eficiencia operativa.',
          gradient: 'from-violet-400 to-violet-600',
          glow: 'rgba(167, 139, 250, 0.15)',
          iconColor: 'text-violet-400',
          modalTitle: 'Automatización Inteligente y Flujos de Datos',
          modalDesc:
            'Implementamos automatización pragmática: desde extracción y validación de documentos hasta pipelines de negocio guiados por eventos.',
          features: [
            'Extracción y validación documental',
            'Pipelines basados en eventos',
            'Integración práctica de APIs y LLMs',
            'Procesamiento en segundo plano (colas)',
            'Flujos de revisión con validación humana',
            'Registro y auditoría operativa',
          ],
          techStack: ['Python / Node.js', 'BullMQ / Redis', 'PostgreSQL', 'REST / Webhooks'],
          useCases: [
            'Procesamiento de facturas y documentos',
            'Pipelines de datos operativos',
            'Colas de sincronización entre sistemas',
            'Automatización de flujos de trabajo',
          ],
        },
        {
          icon: Database,
          title: 'APIs e Integraciones',
          shortDesc:
            'Conecta herramientas existentes, APIs y sistemas de negocio en un flujo digital unificado y eficiente.',
          gradient: 'from-amber-400 to-amber-600',
          glow: 'rgba(251, 191, 36, 0.15)',
          iconColor: 'text-amber-400',
          modalTitle: 'Desarrollo de APIs e Integración de Sistemas',
          modalDesc:
            'Conecta software disperso, pasarelas de pago, bases de datos y APIs externas en backends seguros, unificados y observables.',
          features: [
            'Diseño de APIs REST y GraphQL',
            'Integración con servicios de terceros',
            'Arquitectura por webhooks y eventos',
            'Modelado de datos y migraciones',
            'Autenticación y rate limiting',
            'Monitoreo y observabilidad',
          ],
          techStack: ['Node.js / Express', 'PostgreSQL', 'Docker', 'REST / Webhooks'],
          useCases: [
            'Integración con CRM y ERP',
            'Conexión a pasarelas de pago',
            'Fuentes de datos externas',
            'Comunicación entre servicios',
          ],
        },
        {
          icon: Globe,
          title: 'Sitios Web',
          shortDesc:
            'Sitios web rápidos y modernos diseñados para atraer clientes, transmitir confianza e impulsar tu negocio.',
          gradient: 'from-pink-400 to-pink-600',
          glow: 'rgba(244, 114, 182, 0.15)',
          iconColor: 'text-pink-400',
          modalTitle: 'Sitios Web Modernos y Alto Rendimiento',
          modalDesc:
            'Sitios corporativos y landing pages construidos con arquitectura web moderna para maximizar visibilidad, velocidad y conversión.',
          features: [
            'Arquitectura orientada a SEO',
            'Carga ultra veloz (95+ Lighthouse)',
            'Diseño responsive mobile-first',
            'Microanimaciones fluidas',
            'Formularios de contacto y captación',
            'Configuración de métricas y analítica',
          ],
          techStack: ['Astro / React', 'TailwindCSS', 'GSAP / Framer Motion', 'Netlify / Cloudflare'],
          useCases: [
            'Sitios web corporativos',
            'Páginas de producto y servicio',
            'Portafolios y showcases',
            'Páginas de campaña',
          ],
        },
        {
          icon: Palette,
          title: 'Diseño UI/UX',
          shortDesc:
            'Interfaces claras e intuitivas diseñadas alrededor de cómo tus usuarios interactúan con tu producto.',
          gradient: 'from-cyan-400 to-cyan-600',
          glow: 'rgba(34, 211, 238, 0.15)',
          iconColor: 'text-cyan-400',
          modalTitle: 'Diseño UI/UX y Experiencia de Producto',
          modalDesc:
            'Diseño centrado en el usuario: prototipos interactivos, flujos limpios y sistemas de diseño consistentes que facilitan el uso del sistema.',
          features: [
            'Investigación y flujos de usuario',
            'Wireframes y prototipos interactivos',
            'Sistemas de diseño y componentes',
            'Accesibilidad y diseño adaptable',
            'Entrega limpia de diseño a código',
            'Consistencia de marca',
          ],
          techStack: ['Figma', 'Design Systems', 'Prototyping'],
          useCases: [
            'Interfaces de aplicaciones web',
            'Diseño de dashboards',
            'Diseños adaptados a móvil',
            'Creación de design systems',
          ],
        },
      ],
    };
  }

  return {
    tag: 'What We Build',
    titlePrefix: 'From websites to',
    titleHighlight: 'business software',
    subtitle:
      'Whether you need a high-performance website, a customer portal, an internal system or a custom business application, I design and build the right solution for your needs.',
    learnMore: 'Learn More',
    keyFeatures: 'Key Features',
    useCasesLabel: 'Use Cases',
    discussCta: 'Discuss This Service',
    items: [
      {
        icon: Monitor,
        title: 'Web Applications',
        shortDesc:
          'Custom web applications, dashboards, client portals and business platforms built for scalability and performance.',
        gradient: 'from-indigo-400 to-indigo-600',
        glow: 'rgba(129, 140, 248, 0.15)',
        iconColor: 'text-indigo-400',
        modalTitle: 'Web Applications & Platforms',
        modalDesc:
          'Custom web applications tailored to your business processes — from client portals and operational dashboards to complex multi-role platforms with real-time updates and high reliability.',
        features: [
          'Custom web app development',
          'Real-time dashboards & analytics',
          'Role-based access control (RBAC)',
          'Authentication & security',
          'API integrations',
          'Scalable cloud architecture',
        ],
        techStack: ['React / Next.js', 'Node.js / TypeScript', 'PostgreSQL / Redis', 'TailwindCSS'],
        useCases: [
          'Business management platforms',
          'Client & vendor portals',
          'Operational dashboards',
          'SaaS products',
        ],
      },
      {
        icon: Database,
        title: 'Business Systems',
        shortDesc:
          'ERP, inventory, sales, logistics and operational systems built around how your business works.',
        gradient: 'from-emerald-400 to-emerald-600',
        glow: 'rgba(52, 211, 153, 0.15)',
        iconColor: 'text-emerald-400',
        modalTitle: 'Business Systems & Custom ERP',
        modalDesc:
          'End-to-end business management platforms designed around your specific operational workflows — unifying sales, inventory, purchasing, logistics and accounting.',
        features: [
          'Custom ERP development',
          'Inventory & warehouse tracking',
          'Purchasing & sales workflows',
          'Route & delivery management',
          'Automated report generation',
          'Audit trail & compliance',
        ],
        techStack: ['Node.js / TypeScript', 'PostgreSQL / PostGIS', 'React / Next.js', 'Redis / WebSockets'],
        useCases: [
          'Distribution companies',
          'Wholesale & retail operations',
          'Supply chain & logistics',
          'Manufacturing workflows',
        ],
      },
      {
        icon: Database,
        title: 'AI & Automation',
        shortDesc:
          'Document processing, workflow automation and intelligent data pipelines to increase operational efficiency.',
        gradient: 'from-violet-400 to-violet-600',
        glow: 'rgba(167, 139, 250, 0.15)',
        iconColor: 'text-violet-400',
        modalTitle: 'Intelligent Automation & Data Workflows',
        modalDesc:
          'We implement practical automation and data processing solutions — from automated document extraction and classification to event-driven business workflow pipelines.',
        features: [
          'Document data extraction & validation',
          'Event-driven workflow pipelines',
          'API & LLM integration where practical',
          'Queue-based background processing',
          'Human-in-the-loop review flows',
          'Operational audit logging',
        ],
        techStack: ['Python / Node.js', 'BullMQ / Redis', 'PostgreSQL', 'REST / Webhooks'],
        useCases: [
          'Automated document & invoice processing',
          'Operational data pipelines',
          'System integration queues',
          'Workflow automation',
        ],
      },
      {
        icon: Database,
        title: 'API & Integrations',
        shortDesc:
          'Connect existing tools, APIs and business systems into a more efficient digital workflow.',
        gradient: 'from-amber-400 to-amber-600',
        glow: 'rgba(251, 191, 36, 0.15)',
        iconColor: 'text-amber-400',
        modalTitle: 'API Development & System Integrations',
        modalDesc:
          'Connect disparate software, third-party APIs, payment gateways and legacy databases into unified, secure and observable backend workflows.',
        features: [
          'REST & GraphQL API design',
          'Third-party system integrations',
          'Webhook & event-driven architecture',
          'Database modeling & migrations',
          'Authentication & rate limiting',
          'Monitoring & logging',
        ],
        techStack: ['Node.js / Express', 'PostgreSQL', 'Docker', 'REST / Webhooks'],
        useCases: [
          'CRM & ERP integrations',
          'Payment gateway connectivity',
          'External data feeds',
          'Microservices communication',
        ],
      },
      {
        icon: Globe,
        title: 'Websites',
        shortDesc:
          'Fast, modern websites designed to attract customers, build credibility and support your business.',
        gradient: 'from-pink-400 to-pink-600',
        glow: 'rgba(244, 114, 182, 0.15)',
        iconColor: 'text-pink-400',
        modalTitle: 'Modern Websites & High-Performance Pages',
        modalDesc:
          'High-performance, beautifully crafted corporate websites and landing pages built with modern web architecture to maximize visibility and conversion.',
        features: [
          'SEO-first architecture',
          'Lightning-fast loading (95+ Lighthouse)',
          'Responsive mobile-first design',
          'Fluid micro-animations',
          'Contact & lead capture forms',
          'Analytics & tracking setup',
        ],
        techStack: ['Astro / React', 'TailwindCSS', 'GSAP / Framer Motion', 'Netlify / Cloudflare'],
        useCases: [
          'Corporate websites',
          'Product & service landing pages',
          'Portfolio & showcase sites',
          'Campaign pages',
        ],
      },
      {
        icon: Palette,
        title: 'UI/UX Design',
        shortDesc:
          'Clear, intuitive interfaces designed around how people actually use your product.',
        gradient: 'from-cyan-400 to-cyan-600',
        glow: 'rgba(34, 211, 238, 0.15)',
        iconColor: 'text-cyan-400',
        modalTitle: 'UI/UX Design & Product Experience',
        modalDesc:
          'User-centered design backed by usability principles — crafting intuitive layouts, interactive prototypes and consistent design systems that make software a joy to use.',
        features: [
          'User research & workflows',
          'Wireframing & interactive prototypes',
          'Design systems & component libraries',
          'Accessibility & responsiveness',
          'Design-to-code handoff',
          'Brand consistency',
        ],
        techStack: ['Figma', 'Design Systems', 'Prototyping'],
        useCases: [
          'Web app interfaces',
          'Dashboard UI/UX',
          'Mobile-responsive layouts',
          'Design system creation',
        ],
      },
    ],
  };
}
