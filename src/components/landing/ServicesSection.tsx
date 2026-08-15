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
    shortDesc: "Custom web applications, dashboards, client portals and business platforms built for scalability and performance.",
    gradient: "from-indigo-400 to-indigo-600",
    glow: "rgba(129, 140, 248, 0.15)",
    iconColor: "text-indigo-400",
    modalTitle: "Web Applications & Platforms",
    modalDesc: "Custom web applications tailored to your business processes — from client portals and operational dashboards to complex multi-role platforms with real-time updates and high reliability.",
    features: ["Custom web app development", "Real-time dashboards & analytics", "Role-based access control (RBAC)", "Authentication & security", "API integrations", "Scalable cloud architecture"],
    techStack: ["React / Next.js", "Node.js / TypeScript", "PostgreSQL / Redis", "TailwindCSS"],
    useCases: ["Business management platforms", "Client & vendor portals", "Operational dashboards", "SaaS products"],
  },
  {
    icon: Database,
    title: "Business Systems",
    shortDesc: "ERP, inventory, sales, logistics and operational systems built around how your business works.",
    gradient: "from-emerald-400 to-emerald-600",
    glow: "rgba(52, 211, 153, 0.15)",
    iconColor: "text-emerald-400",
    modalTitle: "Business Systems & Custom ERP",
    modalDesc: "End-to-end business management platforms designed around your specific operational workflows — unifying sales, inventory, purchasing, logistics and accounting.",
    features: ["Custom ERP development", "Inventory & warehouse tracking", "Purchasing & sales workflows", "Route & delivery management", "Automated report generation", "Audit trail & compliance"],
    techStack: ["Node.js / TypeScript", "PostgreSQL / PostGIS", "React / Next.js", "Redis / WebSockets"],
    useCases: ["Distribution companies", "Wholesale & retail operations", "Supply chain & logistics", "Manufacturing workflows"],
  },
  {
    icon: Database,
    title: "AI & Automation",
    shortDesc: "Autonomous agents, custom LLMs, document processing and intelligent workflow automation to supercharge your business efficiency.",
    gradient: "from-violet-400 to-violet-600",
    glow: "rgba(167, 139, 250, 0.15)",
    iconColor: "text-violet-400",
    modalTitle: "AI & Intelligent Automation",
    modalDesc: "We integrate practical Artificial Intelligence into your business — from automated document extraction and classification to intelligent agents and workflow automation pipelines.",
    features: ["Document AI & OCR extraction", "Autonomous AI Agents", "Custom LLM Integration", "Intelligent workflow queues", "Human-in-the-loop validation", "Predictive data analytics"],
    techStack: ["OpenAI / Claude Vision", "Python / Node.js", "BullMQ / Redis", "PostgreSQL"],
    useCases: ["Automated invoice & document processing", "Customer support intelligence", "Data extraction & transformation", "Workflow automation"],
  },
  {
    icon: Database,
    title: "API & Integrations",
    shortDesc: "Connect existing tools, APIs and business systems into a more efficient digital workflow.",
    gradient: "from-amber-400 to-amber-600",
    glow: "rgba(251, 191, 36, 0.15)",
    iconColor: "text-amber-400",
    modalTitle: "API Development & System Integrations",
    modalDesc: "Connect disparate software, third-party APIs, payment gateways and legacy databases into unified, secure and observable backend workflows.",
    features: ["REST & GraphQL API design", "Third-party system integrations", "Webhook & event-driven architecture", "Database modeling & migrations", "Authentication & rate limiting", "Monitoring & logging"],
    techStack: ["Node.js / Express", "PostgreSQL", "Docker", "REST / Webhooks"],
    useCases: ["CRM & ERP integrations", "Payment gateway connectivity", "External data feeds", "Microservices communication"],
  },
  {
    icon: Globe,
    title: "Websites",
    shortDesc: "Fast, modern websites designed to attract customers, build credibility and support your business.",
    gradient: "from-pink-400 to-pink-600",
    glow: "rgba(244, 114, 182, 0.15)",
    iconColor: "text-pink-400",
    modalTitle: "Modern Websites & High-Performance Pages",
    modalDesc: "High-performance, beautifully crafted corporate websites and landing pages built with modern web architecture to maximize visibility and conversion.",
    features: ["SEO-first architecture", "Lightning-fast loading (95+ Lighthouse)", "Responsive mobile-first design", "Fluid micro-animations", "Contact & lead capture forms", "Analytics & tracking setup"],
    techStack: ["Astro / React", "TailwindCSS", "GSAP / Framer Motion", "Netlify / Cloudflare"],
    useCases: ["Corporate websites", "Product & service landing pages", "Portfolio & showcase sites", "Campaign pages"],
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    shortDesc: "Clear, intuitive interfaces designed around how people actually use your product.",
    gradient: "from-cyan-400 to-cyan-600",
    glow: "rgba(34, 211, 238, 0.15)",
    iconColor: "text-cyan-400",
    modalTitle: "UI/UX Design & Product Experience",
    modalDesc: "User-centered design backed by usability principles — crafting intuitive layouts, interactive prototypes and consistent design systems that make software a joy to use.",
    features: ["User research & workflows", "Wireframing & interactive prototypes", "Design systems & component libraries", "Accessibility & responsiveness", "Design-to-code handoff", "Brand consistency"],
    techStack: ["Figma", "Design Systems", "Prototyping"],
    useCases: ["Web app interfaces", "Dashboard UI/UX", "Mobile-responsive layouts", "Design system creation"],
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
      {/* Theme CSS */}
      <style>{`
        .svc-modal      { background: #0c0c1d; border: 1px solid rgba(255,255,255,0.1); }
        .svc-modal-h    { color: #ffffff; }
        .svc-modal-p    { color: #d1d5db; }
        .svc-modal-label{ color: #ffffff; }
        .svc-modal-muted{ color: #9ca3af; }
        .svc-modal-tag  { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #d1d5db; }
        .svc-modal-close{ background: rgba(255,255,255,0.05); color: #9ca3af; }
        .svc-modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
        html.light .svc-modal      { background: #ffffff; border: 1px solid rgba(0,0,0,0.1); }
        html.light .svc-modal-h    { color: #0f172a; }
        html.light .svc-modal-p    { color: #374151; }
        html.light .svc-modal-label{ color: #0f172a; }
        html.light .svc-modal-muted{ color: #6b7280; }
        html.light .svc-modal-tag  { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.1); color: #374151; }
        html.light .svc-modal-close{ background: rgba(0,0,0,0.04); color: #6b7280; }
        html.light .svc-modal-close:hover { background: rgba(0,0,0,0.08); color: #0f172a; }
        .svc-modal-scroll::-webkit-scrollbar { width: 5px; }
        .svc-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .svc-modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        html.light .svc-modal-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        onClick={(e) => e.stopPropagation()}
        className="svc-modal relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl"
      >
        {/* Header gradient */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${service.gradient} rounded-t-2xl`} />
        
        <div className="svc-modal-scroll flex-1 overflow-y-auto p-6 md:p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="svc-modal-close absolute top-4 right-4 p-2 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: service.glow }}>
              <Icon size={24} className={service.iconColor} />
            </div>
            <div>
              <h3 className="svc-modal-h text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {service.modalTitle}
              </h3>
            </div>
          </div>
          
          <p className="svc-modal-p leading-relaxed mb-6 text-sm md:text-base">{service.modalDesc}</p>

          {/* Features */}
          <div className="mb-6">
            <h4 className="svc-modal-label text-sm font-bold uppercase tracking-wider mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Key Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm svc-modal-p">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-6">
            <h4 className="svc-modal-label text-sm font-bold uppercase tracking-wider mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Use Cases</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.useCases.map((u, i) => (
                <div key={i} className="flex items-center gap-2 text-sm svc-modal-muted">
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
      <section className="py-24 lg:py-32 relative overflow-hidden" id="services" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Background gradient accents */}
        <div className="absolute inset-0 section-gradient opacity-60 pointer-events-none" />
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-7xl mx-auto px-8 sm:px-10 md:px-14 lg:px-20 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-indigo-400 font-semibold tracking-wider uppercase text-xs md:text-sm mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>What We Build</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 tracking-tight leading-[1.1]" style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
              From websites to <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                business software
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Whether you need a high-performance website, a customer portal, an internal system or a custom business application, I design and build the right solution for your needs.
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
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                  }}
                  className="service-card group relative p-6 md:p-7 rounded-2xl text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-lg cursor-pointer"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Hover glow — now properly tracks mouse */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${service.glow}, transparent 70%)` }}
                  />
                  {/* Service index — editorial detail */}
                  <span className="absolute top-4 right-5 text-[10px] font-bold tracking-[0.2em] opacity-0 group-hover:opacity-40 transition-opacity duration-300" style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

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
