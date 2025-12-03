import React, { useEffect, useRef } from 'react';

export default function PortfolioBackgroundEffects() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          // Giant numbers parallax
          gsap.utils.toArray('.giant-number').forEach((num: any, i) => {
            gsap.to(num, {
              y: (i + 1) * 100,
              opacity: 0.02,
              scrollTrigger: {
                trigger: containerRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            });
          });

          // Category particles
          // Create random floating movement for particles
          gsap.to('.portfolio-particle', {
            y: 'random(-50, 50)',
            x: 'random(-30, 30)',
            rotation: 'random(-180, 180)',
            duration: 'random(3, 6)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            stagger: 0.1,
          });

        }, containerRef);

        return () => ctx.revert();
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Giant Background Numbers */}
      <div className="absolute top-[10%] left-[-5%] text-[20rem] font-bold text-white opacity-[0.03] giant-number leading-none">01</div>
      <div className="absolute top-[40%] right-[-5%] text-[20rem] font-bold text-white opacity-[0.03] giant-number leading-none">02</div>
      <div className="absolute bottom-[10%] left-[10%] text-[20rem] font-bold text-white opacity-[0.03] giant-number leading-none">03</div>

      {/* Decorative Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="portfolio-particle absolute rounded-full opacity-20"
          style={{
            width: Math.random() * 10 + 5 + 'px',
            height: Math.random() * 10 + 5 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: i % 3 === 0 ? '#4F46E5' : i % 3 === 1 ? '#A855F7' : '#EC4899',
          }}
        />
      ))}
    </div>
  );
}
