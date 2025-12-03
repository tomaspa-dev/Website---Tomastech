import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

export default function VaultVisual({ isUnlocked }: { isUnlocked: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Security Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
        }}
      />

      {/* Central Lock Mechanism */}
      <div className="relative">
        {/* Rotating Rings */}
        <motion.div 
          className="absolute inset-0 -m-20 border border-primary/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-0 -m-12 border border-dashed border-white/10 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Lock Icon Container */}
        <motion.div 
          className="relative w-32 h-32 bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.15)]"
          animate={{
            scale: isUnlocked ? 1.2 : 1,
            borderColor: isUnlocked ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.1)',
            boxShadow: isUnlocked ? '0 0 100px rgba(34, 197, 94, 0.3)' : '0 0 50px rgba(99,102,241,0.15)'
          }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {isUnlocked ? (
              <motion.div
                key="unlocked"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Unlock size={48} className="text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="locked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Lock size={48} className="text-white/80" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
