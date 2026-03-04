import React, { useState } from 'react';
import { X, ArrowRight, Monitor, Smartphone, Database, Globe, MapPin, Palette, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceDetail {
  icon: React.ElementType;
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

const services: ServiceDetail[] = [
  {
    icon: Monitor,
    title: "Web Applications",
    shortDesc: "Custom ERP systems, dashboards, and business management platforms built for scalability and performance.",
    gradient: "from-indigo-400 to-indigo-600",
    glow: "rgba(129, 140, 248, 0.15)",
    iconColor: "text-indigo-400",
    modalTitle: "Web Applications & ERP Systems",
    modalDesc: "We build custom web applications tailored to your business processes — from inventory management and billing systems to full-scale ERPs with role-based access, real-time analytics, and automated workflows.",
    features: ["Custom ERP development", "Billing & invoicing systems", "Real-time dashboards & analytics", "Role-based access control", "API integrations", "Automated workflows"],
    techStack: ["React / Next.js", "Node.js / Python", "PostgreSQL / MongoDB", "REST & GraphQL APIs"],
    useCases: ["Business management platforms", "Inventory & supply chain", "Client portals", "Financial reporting systems"],
  },
  {
    icon: MapPin,
    title: "GPS & Location Apps",
    shortDesc: "Real-time tracking, route optimization, and location-based services for logistics and fleet management.",
    gradient: "from-emerald-400 to-emerald-600",
    glow: "rgba(52, 211, 153, 0.15)",
    iconColor: "text-emerald-400",
    modalTitle: "GPS & Location-Based Applications",
    modalDesc: "We develop applications with real-time geolocation capabilities — fleet tracking, delivery route optimization, geofencing, and custom mapping solutions integrated with Google Maps, Mapbox, or Leaflet.",
    features: ["Real-time GPS tracking", "Route optimization", "Geofencing & alerts", "Custom map interfaces", "Vehicle fleet management", "Delivery tracking systems"],
    techStack: ["Google Maps API / Mapbox", "WebSocket for real-time data", "React / React Native", "Node.js backend"],
    useCases: ["Delivery & logistics platforms", "Fleet management", "Field service tracking", "Ride-sharing applications"],
  },
  {
    icon: Database, // Will change to Bot/Brain if available, for now Database fits "data/intelligence"
    title: "AI & Automation",
    shortDesc: "Autonomous agents, custom LLMs, and intelligent workflow automation to supercharge your business efficiency.",
    gradient: "from-violet-400 to-violet-600",
    glow: "rgba(167, 139, 250, 0.15)",
    iconColor: "text-violet-400",
    modalTitle: "AI & Intelligent Automation",
    modalDesc: "We integrate cutting-edge Artificial Intelligence into your business core — from custom AI agents that handle tasks autonomously to intelligent data processing and LLM-powered interfaces.",
    features: ["Autonomous AI Agents", "Custom LLM Integration", "Natural Language Processing", "AI-powered data analytics", "Intelligent workflow automation", "Predictive modeling"],
    techStack: ["OpenAI / Anthropic", "LangChain / LlamaIndex", "Python / FastAPI", "Pinecone (Vector DB)"],
    useCases: ["Intelligent customer support", "Automated document processing", "AI-driven decision making", "Predictive maintenance systems"],
  },
  {
    icon: Globe,
    title: "Landing Pages",
    shortDesc: "High-converting, SEO-optimized landing pages and corporate websites that capture leads and build trust.",
    gradient: "from-pink-400 to-pink-600",
    glow: "rgba(244, 114, 182, 0.15)",
    iconColor: "text-pink-400",
    modalTitle: "Landing Pages & Corporate Websites",
    modalDesc: "We craft premium landing pages and corporate websites designed to convert — with SEO-first architecture, stunning animations, A/B testing readiness, and analytics integration to maximize your ROI.",
    features: ["SEO-first architecture", "Responsive design", "Performance-optimized (90+ Lighthouse)", "Analytics integration", "Contact form & CRM hooks", "A/B testing ready"],
    techStack: ["Astro / Next.js", "TailwindCSS", "GSAP animations", "Netlify / Vercel"],
    useCases: ["Product launches", "Corporate websites", "Portfolio sites", "Event & campaign pages"],
  },
  {
    icon: Database,
    title: "API & Backend",
    shortDesc: "Robust backends, RESTful APIs, database architecture, and cloud deployment for your applications.",
    gradient: "from-amber-400 to-amber-600",
    glow: "rgba(251, 191, 36, 0.15)",
    iconColor: "text-amber-400",
    modalTitle: "API Development & Backend Services",
    modalDesc: "We design and build robust API architectures and backend services — from database modeling and authentication to cloud deployment and serverless functions, ensuring your data flows securely and efficiently.",
    features: ["RESTful & GraphQL APIs", "Database design & optimization", "Authentication & security", "Cloud deployment (AWS, GCP)", "Serverless functions", "CI/CD pipelines"],
    techStack: ["Node.js / Python / Go", "PostgreSQL / MongoDB", "Docker & Kubernetes", "AWS / GCP / Netlify"],
    useCases: ["SaaS backends", "Mobile app APIs", "Microservices architecture", "Third-party integrations"],
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    shortDesc: "User-centered design with wireframing, prototyping, and design systems that elevate your brand identity.",
    gradient: "from-cyan-400 to-cyan-600",
    glow: "rgba(34, 211, 238, 0.15)",
    iconColor: "text-cyan-400",
    modalTitle: "UI/UX Design & Branding",
    modalDesc: "We design beautiful, user-centered interfaces backed by research and best practices — from wireframes and interactive prototypes to complete design systems and brand identity guidelines.",
    features: ["User research & personas", "Wireframing & prototyping", "Design system creation", "Responsive design", "Accessibility (WCAG)", "Brand identity"],
    techStack: ["Figma", "Framer", "Storybook"],
    useCases: ["App redesigns", "New product design", "Brand refresh", "Design system setup"],
  },
];

function ServiceModal({ service, onClose }: { service: ServiceDetail; onClose: () => void }) {
  const Icon = service.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0c0c1d] border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Header gradient */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${service.gradient} rounded-t-2xl`} />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: service.glow }}>
              <Icon size={24} className={service.iconColor} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {service.modalTitle}
              </h3>
            </div>
          </div>
          
          <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">{service.modalDesc}</p>

          {/* Features */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Key Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {service.techStack.map((t, i) => (
                <span key={i} className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Use Cases</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.useCases.map((u, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <ArrowRight size={12} className="text-indigo-400 shrink-0" />
                  {u}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky CTA footer */}
        <div className="shrink-0 p-6 md:px-8 md:pb-8 pt-0">
          <a 
            href="#contact" 
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(129,140,248,0.3)]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Discuss This Service
            <ExternalLink size={14} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  return (
    <>
      <section className="relative overflow-hidden py-24 md:py-32" id="services" style={{ background: 'var(--color-bg)' }}>
        {/* Section gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent pointer-events-none" />
        
        <div className="w-full max-w-7xl mx-auto px-8 sm:px-10 md:px-14 lg:px-20 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-indigo-400 font-semibold tracking-wider uppercase text-xs md:text-sm mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>What We Build</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight" style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Services That <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Deliver Results</span>
            </h2>
            <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              From custom web applications to high-converting landing pages — we build digital solutions that drive your business forward.
            </p>
          </div>
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedService(service)}
                  className="service-card group relative p-6 md:p-7 rounded-2xl text-left transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${service.glow}, transparent 40%)` }}
                  />

                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500" style={{ background: service.glow }}>
                      <Icon size={22} className={service.iconColor} />
                    </div>

                    <h3 className="text-lg font-bold mb-2.5 transition-colors duration-300" style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {service.title}
                    </h3>

                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {service.shortDesc}
                    </p>

                    {/* Learn More indicator */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:gap-2.5 transition-all duration-300">
                      Learn More <ArrowRight size={12} />
                    </div>

                    {/* Bottom accent line */}
                    <div className={`mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${service.gradient} rounded-full transition-all duration-500`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedService && (
          <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
