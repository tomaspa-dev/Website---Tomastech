import React, { useEffect, useRef } from 'react';

export default function ServiceCardsFloatingObjects() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          // Floating objects idle animations
          gsap.to('.float-obj-1', {
            y: '+=30',
            rotation: 360,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
          });

          gsap.to('.float-obj-2', {
            y: '+=25',
            rotation: -360,
            duration: 3.5,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
          });

          gsap.to('.float-obj-3', {
            y: '+=35',
            rotation: 360,
            duration: 4.5,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
          });

          // Parallax on scroll
          gsap.to('.float-obj-1, .float-obj-2, .float-obj-3', {
            y: (i) => (i + 1) * -100,
            scrollTrigger: {
              trigger: '.service-cards-container',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          });

          // Connection lines draw on scroll
          gsap.fromTo('.connection-line',
            { scaleX: 0, transformOrigin: 'left' },
            {
              scaleX: 1,
              scrollTrigger: {
                trigger: '.service-cards-container',
                start: 'top 70%',
                end: 'top 40%',
                scrub: 1,
              },
            }
          );

        }, containerRef);

        return () => ctx.revert();
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating Object 1: Code Cube (Custom Development) */}
      <div className="float-obj-1 absolute left-[10%] top-[20%] w-32 h-32 opacity-20 hidden md:block">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* 3D Cube wireframe */}
          <path d="M 30 20 L 70 20 L 70 60 L 30 60 Z" fill="none" stroke="rgba(99,102,241,0.8)" strokeWidth="2"/>
          <path d="M 40 10 L 80 10 L 80 50 L 40 50 Z" fill="none" stroke="rgba(99,102,241,0.6)" strokeWidth="2"/>
          <line x1="30" y1="20" x2="40" y2="10" stroke="rgba(99,102,241,0.6)" strokeWidth="2"/>
          <line x1="70" y1="20" x2="80" y2="10" stroke="rgba(99,102,241,0.6)" strokeWidth="2"/>
          <line x1="70" y1="60" x2="80" y2="50" stroke="rgba(99,102,241,0.6)" strokeWidth="2"/>
          <line x1="30" y1="60" x2="40" y2="50" stroke="rgba(99,102,241,0.6)" strokeWidth="2"/>
          {/* Code symbols */}
          <text x="45" y="35" fill="rgba(99,102,241,0.9)" fontSize="16" fontFamily="monospace">{'<>'}</text>
        </svg>
      </div>

      {/* Floating Object 2: Morphing Devices (Responsive Design) */}
      <div className="float-obj-2 absolute left-[45%] top-[15%] w-40 h-40 opacity-20 hidden md:block">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {/* Mobile */}
          <rect x="20" y="30" width="25" height="45" rx="3" fill="none" stroke="rgba(168,85,247,0.8)" strokeWidth="2"/>
          <line x1="27" y1="72" x2="37" y2="72" stroke="rgba(168,85,247,0.6)" strokeWidth="1"/>
          {/* Tablet */}
          <rect x="50" y="25" width="35" height="50" rx="4" fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth="2"/>
          <circle cx="67.5" cy="72" r="2" fill="rgba(168,85,247,0.6)"/>
          {/* Desktop */}
          <rect x="30" y="80" width="60" height="35" rx="2" fill="none" stroke="rgba(168,85,247,0.6)" strokeWidth="2"/>
          <line x1="30" y1="110" x2="90" y2="110" stroke="rgba(168,85,247,0.6)" strokeWidth="2"/>
          <line x1="50" y1="110" x2="55" y2="115" stroke="rgba(168,85,247,0.6)" strokeWidth="2"/>
          <line x1="70" y1="110" x2="65" y2="115" stroke="rgba(168,85,247,0.6)" strokeWidth="2"/>
        </svg>
      </div>

      {/* Floating Object 3: Line Graph (SEO & Performance) */}
      <div className="float-obj-3 absolute right-[10%] top-[18%] w-36 h-36 opacity-20 hidden md:block">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Axes */}
          <line x1="20" y1="80" x2="80" y2="80" stroke="rgba(234,179,8,0.6)" strokeWidth="2"/>
          <line x1="20" y1="20" x2="20" y2="80" stroke="rgba(234,179,8,0.6)" strokeWidth="2"/>
          {/* Performance line going up */}
          <path d="M 20 70 L 35 60 L 50 45 L 65 30 L 80 20" fill="none" stroke="rgba(234,179,8,0.9)" strokeWidth="3" strokeLinecap="round"/>
          {/* Data points */}
          <circle cx="20" cy="70" r="3" fill="rgba(234,179,8,0.8)"/>
          <circle cx="35" cy="60" r="3" fill="rgba(234,179,8,0.8)"/>
          <circle cx="50" cy="45" r="3" fill="rgba(234,179,8,0.8)"/>
          <circle cx="65" cy="30" r="3" fill="rgba(234,179,8,0.8)"/>
          <circle cx="80" cy="20" r="3" fill="rgba(234,179,8,0.8)"/>
        </svg>
      </div>

      {/* Connection Lines between cards */}
      <div className="service-cards-container absolute inset-0">
        {/* Line 1 to 2 */}
        <div className="connection-line absolute top-1/2 left-[33%] w-[10%] h-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30" style={{ transformOrigin: 'left' }} />
        {/* Line 2 to 3 */}
        <div className="connection-line absolute top-1/2 left-[57%] w-[10%] h-0.5 bg-gradient-to-r from-purple-500/30 to-accent/30" style={{ transformOrigin: 'left' }} />
      </div>
    </div>
  );
}
