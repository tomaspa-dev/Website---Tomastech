import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface MobileMenuProps {
  isLanding?: boolean;
}

const landingLinks = [
  { name: "Services", href: "#services" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

const portfolioLinks = [
  { name: "Work", href: "#work" },
  { name: "Process", href: "#process" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "/#contact" },
];

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1],
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  },
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const linkVariants: Variants = {
  closed: { opacity: 0, x: 50 },
  open: { opacity: 1, x: 0 }
};

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

export default function MobileMenu({ isLanding = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredCta, setHoveredCta] = useState(false);
  const links = isLanding ? landingLinks : portfolioLinks;
  const theme = isLight ? lightStyles : darkStyles;

  useEffect(() => {
    const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="md:hidden">
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
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-16 right-0 w-64 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl origin-top-right"
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
            
            {isLanding ? (
              <>
                <a
                  href="/portfolio"
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => setHoveredLink('portfolio')}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                  style={hoveredLink === 'portfolio' ? theme.linkHover : theme.link}
                >
                  Portfolio
                </a>
                <div className="h-px my-1 mx-2" style={theme.divider}></div>
                <a
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => setHoveredCta(true)}
                  onMouseLeave={() => setHoveredCta(false)}
                  className="px-4 py-3 rounded-xl transition-all duration-200 text-base font-bold flex items-center justify-between group"
                  style={hoveredCta ? theme.ctaHover : theme.cta}
                >
                  Let's Talk
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </a>
              </>
            ) : (
              <>
                <div className="h-px my-1 mx-2" style={theme.divider}></div>
                <a
                  href="/#contact"
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => setHoveredCta(true)}
                  onMouseLeave={() => setHoveredCta(false)}
                  className="px-4 py-3 rounded-xl transition-all duration-200 text-base font-bold flex items-center justify-between group"
                  style={hoveredCta ? theme.ctaHover : theme.cta}
                >
                  Let's Talk
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </a>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

