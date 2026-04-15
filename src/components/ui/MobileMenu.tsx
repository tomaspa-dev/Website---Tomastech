import React, { useState } from 'react';
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

export default function MobileMenu({ isLanding = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const links = isLanding ? landingLinks : portfolioLinks;

  return (
    <div className="md:hidden">
      {/* Theme CSS for mobile menu */}
      <style>{`
        .mm-btn   { color: var(--color-text-primary); }
        .mm-btn:hover { color: var(--color-primary); }
        .mm-panel { background: var(--color-surface); border: 1px solid var(--color-border); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .mm-link  { color: var(--color-text-secondary); }
        .mm-link:hover { color: var(--color-text-primary); background: var(--color-surface-hover); }
        .mm-divider { background: var(--color-border); }
        .mm-cta   { color: var(--color-primary); }
        .mm-cta:hover { color: var(--color-text-primary); background: rgba(99,102,241,0.15); }
      `}</style>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="mm-btn relative z-50 p-2 transition-colors duration-300 focus:outline-none"
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
            className="mm-panel absolute top-16 right-0 w-64 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl origin-top-right"
          >
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="mm-link px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium"
              >
                {link.name}
              </a>
            ))}
            
            {isLanding ? (
              <>
                <a
                  href="/portfolio"
                  onClick={() => setIsOpen(false)}
                  className="mm-link px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                >
                  Portfolio
                </a>
                <div className="mm-divider h-px my-1 mx-2"></div>
                <a
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="mm-cta px-4 py-3 rounded-xl transition-all duration-200 text-base font-bold flex items-center justify-between group"
                >
                  Let's Talk
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </a>
              </>
            ) : (
              <>
                <div className="mm-divider h-px my-1 mx-2"></div>
                <a
                  href="/#contact"
                  onClick={() => setIsOpen(false)}
                  className="mm-cta px-4 py-3 rounded-xl transition-all duration-200 text-base font-bold flex items-center justify-between group"
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
