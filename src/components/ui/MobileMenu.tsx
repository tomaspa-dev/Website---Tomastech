import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function MobileMenu({ isLanding = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const links = isLanding ? landingLinks : portfolioLinks;

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-white p-2"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl"
          >
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-primary text-lg font-medium py-2 border-b border-white/5 last:border-none"
              >
                {link.name}
              </a>
            ))}
            
            {isLanding ? (
              <>
                <a
                  href="/portfolio"
                  className="text-gray-300 hover:text-primary text-lg font-medium py-2 border-b border-white/5"
                >
                  Portfolio
                </a>
                <a
                  href="/client-portal"
                  className="text-primary hover:text-white text-lg font-medium py-2"
                >
                  Client Access
                </a>
              </>
            ) : (
              <a
                href="#contact"
                className="text-primary hover:text-white text-lg font-medium py-2"
              >
                Let's Talk
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
