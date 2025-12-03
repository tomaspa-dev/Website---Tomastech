import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function PortalRing() {
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const glow = glowRef.current;
    if (!ring || !glow) return;

    // Idle animation: Pulse and slight rotation
    gsap.to(ring, {
      scale: 1.05,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(glow, {
      opacity: 0.8,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = ring.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const deltaX = (clientX - centerX) * 0.1;
      const deltaY = (clientY - centerY) * 0.1;

      gsap.to(ring, {
        x: deltaX,
        y: deltaY,
        duration: 0.5,
        ease: "power2.out"
      });

      gsap.to(glow, {
        x: deltaX * 1.5,
        y: deltaY * 1.5,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Background Glow */}
      <div 
        ref={glowRef}
        className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-50"
      />
      
      {/* The Portal Ring */}
      <div 
        ref={ringRef}
        className="relative w-[500px] h-[500px] rounded-full border border-white/10 backdrop-blur-sm flex items-center justify-center"
        style={{
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.2), inset 0 0 50px rgba(99, 102, 241, 0.1)'
        }}
      >
        {/* Inner rotating rings */}
        <div className="absolute inset-0 rounded-full border border-primary/30 border-t-transparent animate-spin-slow" />
        <div className="absolute inset-4 rounded-full border border-purple-500/20 border-b-transparent animate-spin-reverse-slower" />
      </div>
    </div>
  );
}
