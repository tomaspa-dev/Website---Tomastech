import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "What is your typical timeline for a project?",
    answer: "Timelines vary based on complexity. A standard landing page typically takes 3-4 weeks, while a full corporate website or e-commerce store can take 8-12 weeks. We provide a detailed timeline during our initial consultation."
  },
  {
    question: "Do you offer post-launch support?",
    answer: "Absolutely. We offer 30 days of free support after launch to ensure everything runs smoothly. Beyond that, we have maintenance packages to keep your site secure, updated, and optimized."
  },
  {
    question: "Can you help with branding and content?",
    answer: "Yes! While our core focus is development, we partner with expert copywriters and designers to provide a full-service package if you need help with logos, brand identity, or website copy."
  },
  {
    question: "What platforms do you use?",
    answer: "We specialize in modern stacks like Astro, React, and Next.js for custom performance sites. For e-commerce, we are experts in Shopify and WooCommerce, and custom development. We choose the best tool for your specific goals."
  },
  {
    question: "How does payment work?",
    answer: "We typically work with a 50% deposit to start the project and the remaining 50% upon completion and your final approval, before the site goes live."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="py-32 bg-black relative overflow-hidden" id="faq">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wider uppercase mb-4 block">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Common Questions</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Everything you need to know about working with us.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`group rounded-2xl border transition-all duration-300 ${
                activeIndex === index 
                  ? 'bg-white/10 border-primary/50 shadow-[0_0_30px_rgba(79,70,229,0.1)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className={`text-lg font-medium transition-colors ${activeIndex === index ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {faq.question}
                </span>
                <span className={`p-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-primary text-white' : 'bg-white/10 text-gray-400'}`}>
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
                    <div className="p-6 pt-0 text-gray-400 leading-relaxed">
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
