export interface Project {
  id: string;
  title: string;
  category: 'Landing Pages' | 'Corporate Websites' | 'Web Applications' | 'WordPress Themes' | 'Extensions';
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
    title: 'SummerWave - Summer Clothing',
    category: 'Landing Pages',
    description: 'Vibrant landing page for summer clothing collection with fluid animations.',
    image: '/img/summerwave.webp',
    tags: ['Astro', 'React', 'Tailwind', 'GSAP'],
    link: 'https://summerwave.netlify.app/',
    details: {
      concept: 'Promotional landing page for summer season launch.',
      features: ['Looks carousel', 'Entry animations', 'Custom cursor', 'Smooth scroll'],
      stack: ['Astro', 'React', 'TailwindCSS', 'GSAP'],
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
    tags: ['Astro', 'React', 'Three.js', 'Framer Motion'],
    link: 'https://elegancegala.netlify.app/',
    details: {
      concept: 'Landing for gala dress boutique and elegant women\'s fashion.',
      features: ['Hero slider', 'Interactive lookbook', '360° view', 'Appointment booking'],
      stack: ['Astro', 'React', 'TailwindCSS', 'Three.js'],
      time: '5-7 days'
    }
  },
  {
    id: 'fitpro',
    title: 'FitPro Tracker',
    category: 'Landing Pages',
    description: 'Premium tech landing for smartwatch and fitness app.',
    image: '/img/fitpro.webp',
    tags: ['Astro', 'Three.js', 'React Three Fiber'],
    link: '#',
    details: {
      concept: 'Landing for smartwatch/fitness app with premium tech design.',
      features: ['3D product animation', 'Scroll-triggered animations', 'Plans comparison'],
      stack: ['Astro', 'React', 'Three.js', 'GSAP'],
      time: '7-10 days'
    }
  },
  {
    id: 'gelatoart',
    title: 'GelatoArt - Ice Cream Shop',
    category: 'Landing Pages',
    description: 'Delicious visual experience for artisan ice cream shop.',
    image: '/img/gelatoart.webp',
    tags: ['Astro', 'Lottie', 'Google Maps API'],
    link: '#',
    details: {
      concept: 'Delicious and colorful landing for artisan ice cream shop.',
      features: ['Video hero', 'Drip animations', 'Store locator', 'PDF menu'],
      stack: ['Astro', 'React', 'TailwindCSS', 'Lottie'],
      time: '5-7 days'
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
    link: 'https://rgperu-web.netlify.app/',
    details: {
      concept: 'Professional corporate website for leading ecological distribution company in Peru.',
      features: ['Modern corporate design', 'Sustainable products catalog', 'Contact form', 'Testimonials section'],
      stack: ['Astro', 'React', 'TailwindCSS', 'Netlify'],
      time: '2-3 weeks'
    }
  },
  {
    id: 'buildpro',
    title: 'BuildPro - Construction Company',
    category: 'Corporate Websites',
    description: 'Robust website for construction company with project portfolio.',
    image: '/img/buildpro.webp',
    tags: ['Astro', 'Strapi', 'SEO'],
    link: '#',
    details: {
      concept: 'Corporate website for construction company.',
      features: ['Filterable project gallery', 'History timeline', 'Multi-step quoter'],
      stack: ['Astro', 'React', 'Strapi', 'TailwindCSS'],
      time: '2-3 weeks'
    }
  },

  // --- WEB APPLICATIONS ---
  {
    id: 'matchvibe',
    title: 'MatchVibe - Dating App',
    category: 'Web Applications',
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
