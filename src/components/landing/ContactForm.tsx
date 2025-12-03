import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
      // Reset after 3 seconds
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div id="contact-form" className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-2">Let's Build Something Great</h3>
      <p className="text-gray-400 mb-6 text-sm">Fill out the form below and we'll get back to you within 24 hours.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            id="name"
            required
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            id="email"
            required
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
            placeholder="john@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
          <textarea
            id="message"
            required
            rows={4}
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-500 transition-all resize-none"
            placeholder="Tell us about your project..."
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || formStatus === 'success'}
          className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            formStatus === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-primary text-black hover:bg-primary/90'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : formStatus === 'success' ? (
            "Message Sent!"
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
