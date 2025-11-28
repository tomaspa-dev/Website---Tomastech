export interface Project {
  id: string;
  title: string;
  category: 'Landing Pages' | 'Webs Corporativas' | 'Aplicaciones Web' | 'Temas WordPress' | 'Extensiones';
  description: string;
  image: string;
  tags: string[];
  link?: string;
  details: {
    concept: string;
    features: string[];
    stack: string[];
    time: string;
    metrics?: string[];
  };
}

export const projects: Project[] = [
  // --- LANDING PAGES ---
  {
    id: 'summerwave',
    title: 'SummerWave - Ropa de Verano',
    category: 'Landing Pages',
    description: 'Landing page vibrante para colección de ropa de verano con animaciones fluidas.',
    image: '/img/summerwave.webp',
    tags: ['Astro', 'React', 'Tailwind', 'GSAP'],
    link: 'https://summerwave.netlify.app/',
    details: {
      concept: 'Landing page promocional para lanzamiento de temporada de verano.',
      features: ['Carrusel de looks', 'Animaciones de entrada', 'Cursor personalizado', 'Smooth scroll'],
      stack: ['Astro', 'React', 'TailwindCSS', 'GSAP'],
      time: '5-7 days',
      metrics: ['Lighthouse Score: >95', 'FCP: <1.5s']
    }
  },
  {
    id: 'elegancegala',
    title: 'EleganceGala - Tienda de Modas',
    category: 'Landing Pages',
    description: 'Boutique de vestidos de gala con experiencia de usuario premium.',
    image: '/img/elegancegala.webp',
    tags: ['Astro', 'React', 'Three.js', 'Framer Motion'],
    link: 'https://elegancegala.netlify.app/',
    details: {
      concept: 'Landing para boutique de vestidos de gala y moda femenina elegante.',
      features: ['Hero slider', 'Lookbook interactivo', 'Vista 360°', 'Booking de cita'],
      stack: ['Astro', 'React', 'TailwindCSS', 'Three.js'],
      time: '5-7 days'
    }
  },
  {
    id: 'fitpro',
    title: 'FitPro Tracker',
    category: 'Landing Pages',
    description: 'Landing tech premium para smartwatch y app de fitness.',
    image: '/img/fitpro.webp',
    tags: ['Astro', 'Three.js', 'React Three Fiber'],
    link: '#',
    details: {
      concept: 'Landing para smartwatch/app de fitness con diseño tech premium.',
      features: ['Animación 3D del producto', 'Scroll-triggered animations', 'Comparativa de planes'],
      stack: ['Astro', 'React', 'Three.js', 'GSAP'],
      time: '7-10 days'
    }
  },
  {
    id: 'gelatoart',
    title: 'GelatoArt - Heladería',
    category: 'Landing Pages',
    description: 'Experiencia visual deliciosa para heladería artesanal.',
    image: '/img/gelatoart.webp',
    tags: ['Astro', 'Lottie', 'Google Maps API'],
    link: '#',
    details: {
      concept: 'Landing deliciosa y colorida para heladería artesanal.',
      features: ['Video hero', 'Animaciones de goteo', 'Localizador de tiendas', 'Menú PDF'],
      stack: ['Astro', 'React', 'TailwindCSS', 'Lottie'],
      time: '5-7 days'
    }
  },

  // --- WEBS CORPORATIVAS ---
  {
    id: 'rg-distribuciones',
    title: 'RG Distribuciones Perú',
    category: 'Webs Corporativas',
    description: 'Web corporativa para empresa de distribución con enfoque en sostenibilidad.',
    image: '/img/rg-distribuciones.webp',
    tags: ['Astro', 'React', 'Corporate'],
    link: 'https://rgperu-web.netlify.app/',
    details: {
      concept: 'Web corporativa profesional para empresa líder en distribución ecológica en Perú.',
      features: ['Diseño corporativo moderno', 'Catálogo de productos sostenibles', 'Formulario de contacto', 'Sección de testimonios'],
      stack: ['Astro', 'React', 'TailwindCSS', 'Netlify'],
      time: '2-3 weeks'
    }
  },
  {
    id: 'buildpro',
    title: 'BuildPro - Constructora',
    category: 'Webs Corporativas',
    description: 'Sitio web robusto para empresa de construcción con portafolio de obras.',
    image: '/img/buildpro.webp',
    tags: ['Astro', 'Strapi', 'SEO'],
    link: '#',
    details: {
      concept: 'Web corporativa para empresa de construcción.',
      features: ['Galería de proyectos filtrable', 'Timeline de historia', 'Cotizador multi-step'],
      stack: ['Astro', 'React', 'Strapi', 'TailwindCSS'],
      time: '2-3 weeks'
    }
  },

  // --- APLICACIONES WEB ---
  {
    id: 'matchvibe',
    title: 'MatchVibe - Dating App',
    category: 'Aplicaciones Web',
    description: 'Red social de citas basada en intereses reales (Spotify + Netflix).',
    image: '/img/matchvibe.webp',
    tags: ['Next.js', 'Socket.io', 'WebRTC', 'Spotify API'],
    link: '#',
    details: {
      concept: 'Tinder + Spotify + Netflix + Karma system = Red social de citas basada en intereses reales.',
      features: ['Swipe system', 'Spotify integration', 'Watch Party', 'Karma system', 'Video calls'],
      stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Socket.io', 'WebRTC'],
      time: '12-16 weeks'
    }
  },
  {
    id: 'namegenius',
    title: 'NameGenius - AI Naming',
    category: 'Aplicaciones Web',
    description: 'Generador de nombres para bebés y mascotas potenciado por IA.',
    image: '/img/namegenius.webp',
    tags: ['React', 'OpenAI API', 'Supabase'],
    link: '#',
    details: {
      concept: 'App para generar nombres únicos y significativos usando IA.',
      features: ['Filtros avanzados', 'Generación con IA', 'Significado e historia', 'Favoritos'],
      stack: ['React', 'Node.js', 'PostgreSQL', 'OpenAI API'],
      time: '2-3 weeks'
    }
  },
  {
    id: 'storygen',
    title: 'StoryGen Kids',
    category: 'Aplicaciones Web',
    description: 'Generador de cuentos infantiles personalizados con ilustraciones IA.',
    image: '/img/storygen.webp',
    tags: ['Next.js', 'DALL-E 3', 'ElevenLabs'],
    link: '#',
    details: {
      concept: 'Generador de cuentos personalizados para niños con imágenes IA y animaciones.',
      features: ['Generación de texto e imagen', 'Modo lectura', 'Exportación PDF/Video'],
      stack: ['Next.js', 'OpenAI API', 'DALL-E 3', 'ElevenLabs'],
      time: '5-7 weeks'
    }
  },

  // --- TEMAS WORDPRESS ---
  {
    id: 'fashionhub',
    title: 'FashionHub Theme',
    category: 'Temas WordPress',
    description: 'Tema WooCommerce especializado para tiendas de moda femenina.',
    image: '/img/fashionhub.webp',
    tags: ['WordPress', 'WooCommerce', 'Elementor'],
    link: '#',
    details: {
      concept: 'Tema premium para tiendas de ropa de mujer.',
      features: ['Lookbook interactivo', 'Size guide', 'Color swatches', 'Instagram shop'],
      stack: ['WordPress', 'WooCommerce', 'Elementor Pro', 'PHP'],
      time: '4-5 weeks'
    }
  },

  // --- EXTENSIONES ---
  {
    id: 'codesnippets',
    title: 'CodeSnippets Pro',
    category: 'Extensiones',
    description: 'Extensión de VSCode para gestión inteligente de snippets con IA.',
    image: '/img/matchvibe.webp',
    tags: ['VSCode API', 'TypeScript', 'AI'],
    link: '#',
    details: {
      concept: 'Gestor avanzado de snippets de código con IA para VSCode.',
      features: ['Snippets inteligentes', 'Generación con IA', 'Sincronización en nube'],
      stack: ['TypeScript', 'VSCode Extension API', 'OpenAI API'],
      time: '6-8 weeks'
    }
  }
];
