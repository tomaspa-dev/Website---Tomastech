import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isLanding?: boolean;
  lang?: 'en' | 'es';
}

const landingLinksEn = [
  { name: "Services", href: "#services" },
  { name: "Scope", href: "#scope" },
  { name: "Contact", href: "#contact" },
];

const landingLinksEs = [
  { name: "Servicios", href: "#services" },
  { name: "Alcance", href: "#scope" },
  { name: "Contacto", href: "#contact" },
];

const portfolioLinksEn = [
  { name: "Services", href: "/#services" },
  { name: "How I Work", href: "#process" },
  { name: "Portfolio", href: "#work" },
  { name: "About", href: "#about" },
];

const portfolioLinksEs = [
  { name: "Servicios", href: "/es/#services" },
  { name: "Cómo Trabajo", href: "#process" },
  { name: "Portafolio", href: "#work" },
  { name: "Sobre Mí", href: "#about" },
];

// Theme-aware styles
const darkStyles = {
  panel: { background: 'rgba(10, 10, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' } as React.CSSProperties,
  link: { color: 'rgba(255,255,255,0.7)' },
  linkHover: { color: '#ffffff', background: 'rgba(255,255,255,0.08)' },
  divider: { background: 'rgba(255,255,255,0.1)' },
  cta: { color: '#818cf8' },
  ctaHover: { color: '#ffffff', background: 'rgba(99,102,241,0.15)' },
};

const lightStyles = {
  panel: { background: 'rgba(255, 255, 255, 0.97)', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } as React.CSSProperties,
  link: { color: '#475569' },
  linkHover: { color: '#0f172a', background: 'rgba(0,0,0,0.04)' },
  divider: { background: 'rgba(0,0,0,0.08)' },
  cta: { color: '#6366f1' },
  ctaHover: { color: '#0f172a', background: 'rgba(99,102,241,0.08)' },
};

export default function MobileMenu({ isLanding = false, lang = 'en' }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredCta, setHoveredCta] = useState(false);

  const isEs = lang === 'es';
  const links = isLanding 
    ? (isEs ? landingLinksEs : landingLinksEn)
    : (isEs ? portfolioLinksEs : portfolioLinksEn);

  const portfolioHref = isEs ? '/es/portfolio' : '/portfolio';
  const contactHref = isLanding ? '#contact' : (isEs ? '/es/#contact' : '/#contact');
  const ctaText = isEs ? 'Conversemos' : "Let's Talk";
  const portfolioLabel = isEs ? 'Portafolio' : 'Portfolio';

  const theme = isLight ? lightStyles : darkStyles;

  useEffect(() => {
    const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Click-outside Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative z-50 p-2 transition-colors duration-300 focus:outline-none"
        style={{ color: 'var(--color-text-primary)' }}
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X size={26} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={26} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-16 right-0 w-64 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl origin-top-right z-50"
            style={theme.panel}
          >
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
                className="px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                style={hoveredLink === link.name ? theme.linkHover : theme.link}
              >
                {link.name}
              </a>
            ))}
            
            {isLanding && (
              <a
                href={portfolioHref}
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setHoveredLink('portfolio')}
                onMouseLeave={() => setHoveredLink(null)}
                className="px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                style={hoveredLink === 'portfolio' ? theme.linkHover : theme.link}
              >
                {portfolioLabel}
              </a>
            )}

            <div className="h-px my-1 mx-2" style={theme.divider}></div>
            
            {/* CTA Button */}
            <a
              href={contactHref}
              onClick={() => setIsOpen(false)}
              onMouseEnter={() => setHoveredCta(true)}
              onMouseLeave={() => setHoveredCta(false)}
              className="px-4 py-3 rounded-xl transition-all duration-200 text-base font-bold flex items-center justify-between group"
              style={hoveredCta ? theme.ctaHover : theme.cta}
            >
              {ctaText}
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Language Switcher in Mobile Menu (shown on mobile phones where navbar has no room) */}
            <div className="h-px my-1 mx-2 sm:hidden" style={theme.divider}></div>
            <div className="p-2 flex items-center justify-between sm:hidden">
              <span className="text-xs font-mono" style={theme.link}>
                {isEs ? 'Idioma' : 'Language'}:
              </span>
              <div className="inline-flex items-center p-0.5 rounded-full border border-border/80 bg-surface/50 text-xs font-mono">
                <a
                  href={isLanding ? '/' : '/portfolio'}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    !isEs ? 'bg-primary text-white font-bold' : 'text-text-muted'
                  }`}
                >
                  EN
                </a>
                <a
                  href={isLanding ? '/es' : '/es/portfolio'}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    isEs ? 'bg-primary text-white font-bold' : 'text-text-muted'
                  }`}
                >
                  ES
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
