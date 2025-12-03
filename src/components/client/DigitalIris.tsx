import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface DigitalIrisProps {
  focusState: 'idle' | 'focus' | 'dilate';
}

export default function DigitalIris({ focusState }: DigitalIrisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);
  const irisRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);

  // Mouse Tracking (The Eye Look)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pupilRef.current || !irisRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate normalized position (-1 to 1)
      const x = (clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (clientY - innerHeight / 2) / (innerHeight / 2);

      // Pupil moves more (looking)
      gsap.to(pupilRef.current, {
        x: x * 30,
        y: y * 30,
        duration: 0.5,
        ease: "power2.out"
      });

      // Iris moves slightly (parallax)
      gsap.to(irisRef.current, {
        x: x * 10,
        y: y * 10,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Idle Animations (Rotation)
  useEffect(() => {
    if (!ring1Ref.current || !ring2Ref.current) return;

    gsap.to(ring1Ref.current, {
      rotate: 360,
      duration: 20,
      repeat: -1,
      ease: "linear"
    });

    gsap.to(ring2Ref.current, {
      rotate: -360,
      duration: 15,
      repeat: -1,
      ease: "linear"
    });
  }, []);

  // State Reactions (Focus/Dilate)
  useEffect(() => {
    if (!pupilRef.current || !irisRef.current) return;

    const tl = gsap.timeline();

    if (focusState === 'focus') {
      // Contract pupil (Focusing on password)
      tl.to(pupilRef.current, { scale: 0.5, duration: 0.4, ease: "back.out(1.7)" })
        .to(irisRef.current, { scale: 0.8, borderColor: '#a855f7', duration: 0.4 }, "<"); // Purple focus
    } else if (focusState === 'dilate') {
      // Expand pupil (Excited/Ready)
      tl.to(pupilRef.current, { scale: 1.5, duration: 0.4, ease: "back.out(1.7)" })
        .to(irisRef.current, { scale: 1.2, borderColor: '#22c55e', duration: 0.4 }, "<"); // Green ready
    } else {
      // Idle
      tl.to(pupilRef.current, { scale: 1, duration: 0.5, ease: "power2.out" })
        .to(irisRef.current, { scale: 1, borderColor: '#6366f1', duration: 0.5 }, "<"); // Blue idle
    }
  }, [focusState]);

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
      
      {/* The Eye Assembly */}
      <div className="relative w-[600px] h-[600px] flex items-center justify-center">
        
        {/* Outer Tech Ring (Static-ish) */}
        <div className="absolute inset-0 border border-white/5 rounded-full scale-110" />
        
        {/* Rotating Data Ring 1 */}
        <div ref={ring1Ref} className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-white/10 opacity-50" />
        
        {/* Rotating Data Ring 2 */}
        <div ref={ring2Ref} className="absolute w-[400px] h-[400px] rounded-full border-2 border-transparent border-t-primary/20 border-b-primary/20" />

        {/* The Iris Group */}
        <div ref={irisRef} className="relative w-[200px] h-[200px] rounded-full border-2 border-primary shadow-[0_0_50px_rgba(99,102,241,0.3)] flex items-center justify-center backdrop-blur-sm transition-colors">
          {/* Inner Iris Detail */}
          <div className="absolute inset-2 border border-white/20 rounded-full opacity-50" />
          
          {/* The Pupil */}
          <div ref={pupilRef} className="w-20 h-20 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8)] relative">
            <div className="absolute top-4 right-4 w-4 h-4 bg-black/10 rounded-full" /> {/* Reflection */}
          </div>
        </div>
      </div>
    </div>
  );
}
