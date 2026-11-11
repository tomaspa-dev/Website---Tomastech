import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import type { Lang } from '../../i18n/ui';
import { getTranslations } from '../../i18n/translations';

export default function FAQ({ lang = 'en' }: { lang?: Lang }) {
  const t = getTranslations(lang);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="py-32 relative overflow-hidden" id="faq" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="font-semibold tracking-wider uppercase mb-4 block text-sm" style={{ color: '#818cf8', fontFamily: 'Space Grotesk, sans-serif' }}>
            {t.faq.tag}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight" style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            {t.faq.title}
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {t.faq.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {t.faq.items.map((faq, index) => (
            <div 
              key={index}
              className="group rounded-2xl border transition-all duration-300"
              style={{
                background: activeIndex === index ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                borderColor: activeIndex === index ? 'rgba(129, 140, 248, 0.3)' : 'var(--color-border)',
                boxShadow: activeIndex === index ? '0 0 30px rgba(129, 140, 248, 0.08)' : 'none'
              }}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span 
                  className="text-lg font-medium transition-colors"
                  style={{ 
                    color: activeIndex === index ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontFamily: 'Space Grotesk, sans-serif'
                  }}
                >
                  {faq.question}
                </span>
                <span 
                  className="p-2 rounded-full transition-all duration-300 shrink-0 ml-4"
                  style={{
                    background: activeIndex === index ? '#818cf8' : 'var(--color-surface)',
                    color: activeIndex === index ? 'white' : 'var(--color-text-muted)'
                  }}
                >
                  <AnimatePresence mode="wait">
                    {activeIndex === index ? (
                      <motion.div
                        key="minus"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <Minus size={20} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="plus"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <Plus size={20} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </span>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
