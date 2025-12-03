import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginFormProps {
  onUnlock?: () => void;
  onButtonHover?: () => void;
  onButtonLeave?: () => void;
}

export default function LoginForm({ 
  onUnlock, 
  onButtonHover, 
  onButtonLeave 
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      if (email === 'DemoUser' && password === 'mypassword') {
        if (onUnlock) onUnlock();
        // Redirect to dashboard after animation
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setIsLoading(false);
        alert('Invalid credentials. Try DemoUser / mypassword');
      }
    }, 1500);
  };

  return (
    <div className="relative z-10 w-full max-w-md p-10 bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight font-heading">Client Portal</h1>
        <p className="text-gray-400 text-base">Welcome back. Access your project dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {/* Email Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-white transition-colors duration-300">
              <User size={20} />
            </div>
            <input
              type="text"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 
                         transition-colors duration-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-white transition-colors duration-300">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 
                         transition-colors duration-300"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm pt-2">
          <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors">
            <input type="checkbox" className="rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50" />
            <span>Remember me</span>
          </label>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Forgot password?</a>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full relative group overflow-hidden rounded-xl bg-white text-black p-4 font-bold text-lg transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02]"
          whileTap={{ scale: 0.98 }}
          onMouseEnter={onButtonHover}
          onMouseLeave={onButtonLeave}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="relative z-10 flex items-center justify-center gap-2">
              <span>Enter Dashboard</span>
              {/* Flashy Arrow Animation */}
              <div className="relative w-5 h-5 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:translate-x-full group-hover:opacity-0">
                  <ArrowRight size={20} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center -translate-x-full opacity-0 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:opacity-100">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          )}
        </motion.button>
      </form>
    </div>
  );
}
