import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface InterstellarRingProps {
  warpState: 'idle' | 'hover' | 'warp';
}

export default function InterstellarRing({ warpState }: InterstellarRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ringRef.current || !coreRef.current) return;

    // Base rotation (slow)
    const rotationTween = gsap.to(ringRef.current, {
      rotate: 360,
      duration: 60,
      repeat: -1,
      ease: "linear"
    });

    // Pulse core
    gsap.to(coreRef.current, {
      scale: 1.1,
      opacity: 0.8,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      rotationTween.kill();
    };
  }, []);

  useEffect(() => {
    if (!ringRef.current || !coreRef.current || !containerRef.current) return;

    if (warpState === 'hover') {
      // Accelerate rotation & Redshift
      gsap.to(ringRef.current, { 
        duration: 1, 
        scale: 1.05,
        filter: "hue-rotate(-30deg) brightness(1.5)", // Shift to reddish/orange
        ease: "power2.out" 
      });
      // Speed up rotation simulation by timeScale (requires storing tween, simpler to just rotate faster)
      gsap.to(ringRef.current, { rotate: "+=180", duration: 1, ease: "power1.in" });

    } else if (warpState === 'warp') {
      // WARP SPEED
      const tl = gsap.timeline();
      
      // 1. Contract slightly
      tl.to(containerRef.current, { scale: 0.9, duration: 0.2, ease: "power2.in" })
      // 2. EXPLODE/STRETCH
        .to(containerRef.current, { 
          scale: 20, 
          opacity: 0, 
          duration: 1.5, 
          ease: "expo.in" 
        });

    } else {
      // Return to idle
      gsap.to(ringRef.current, { 
        scale: 1, 
        filter: "hue-rotate(0deg) brightness(1)",
        duration: 1,
        ease: "power2.out"
      });
    }
  }, [warpState]);

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden bg-black">
      {/* Stars Background */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      {/* The Event Horizon */}
      <div className="relative w-[800px] h-[800px] flex items-center justify-center">
        
        {/* Accretion Disk (The Ring) */}
        <div 
          ref={ringRef}
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, #fbbf24 20%, #f59e0b 40%, transparent 60%, #fbbf24 80%, transparent 100%)',
            filter: 'blur(40px)',
            opacity: 0.6,
            mixBlendMode: 'screen'
          }}
        />
        
        {/* Secondary Ring for Volume */}
        <div 
          className="absolute inset-20 rounded-full border-[40px] border-orange-500/20 blur-[60px] animate-spin-slow"
        />

        {/* The Black Hole (Core) */}
        <div 
          ref={coreRef}
          className="absolute w-[400px] h-[400px] bg-black rounded-full shadow-[0_0_100px_rgba(245,158,11,0.5)] z-10"
        />
        
        {/* Photon Ring (Thin bright line) */}
        <div className="absolute w-[410px] h-[410px] rounded-full border border-white/50 blur-[2px] z-20" />

      </div>
    </div>
  );
}
