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
  { name: "Contact", href: "#contact" },
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
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative z-50 p-2 text-white hover:text-primary transition-colors duration-300 focus:outline-none"
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
            className="absolute top-16 right-0 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl origin-top-right"
          >
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium"
              >
                {link.name}
              </a>
            ))}
            
            {isLanding ? (
              <>
                <a
                  href="/portfolio"
                  className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium"
                >
                  Portfolio
                </a>
                <div className="h-px bg-white/10 my-1 mx-2"></div>
                <a
                  href="/client-access"
                  className="text-primary hover:text-white hover:bg-primary/20 px-4 py-3 rounded-xl transition-all duration-200 text-base font-bold flex items-center justify-between group"
                >
                  Client Login
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </a>
              </>
            ) : (
              <>
                <div className="h-px bg-white/10 my-1 mx-2"></div>
                <a
                  href="#contact"
                  className="text-primary hover:text-white hover:bg-primary/20 px-4 py-3 rounded-xl transition-all duration-200 text-base font-bold flex items-center justify-between group"
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
