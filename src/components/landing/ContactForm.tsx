import React, { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setFormStatus('success');
      
      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast('Message sent successfully! We\'ll reply within 24 hours.', 'success', 5000);
      }
      
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1500);
  };

  const inputStyles = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all duration-300 text-sm";

  return (
    <div id="contact-form" className="w-full max-w-md mx-auto p-6 md:p-8 rounded-2xl shadow-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
      <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Let's Build Something Great
      </h3>
      <p className="mb-5 text-sm text-gray-400">
        Fill out the form and we'll get back to you within 24 hours.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label htmlFor="name" className="block text-xs font-medium mb-1.5 text-gray-400">Name</label>
          <input type="text" id="name" required className={inputStyles} placeholder="John Doe" />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-xs font-medium mb-1.5 text-gray-400">Email</label>
          <input type="email" id="email" required className={inputStyles} placeholder="john@example.com" />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-xs font-medium mb-1.5 text-gray-400">Message</label>
          <textarea id="message" required rows={3} className={`${inputStyles} resize-none`} placeholder="Tell us about your project..."></textarea>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || formStatus === 'success'}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 text-white ${
            formStatus === 'success' 
              ? 'bg-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.3)]' 
              : 'bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(129,140,248,0.3)] hover:shadow-[0_0_30px_rgba(129,140,248,0.5)] hover:scale-[1.02]'
          }`}
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : formStatus === 'success' ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Message Sent!
            </span>
          ) : (
            <>
              <span>Send Message</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
