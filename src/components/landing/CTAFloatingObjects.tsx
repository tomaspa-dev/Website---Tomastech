import React, { useEffect, useRef } from 'react';

export default function CTAFloatingObjects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const planeWhatsAppRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    import('gsap').then(({ gsap }) => {
      const ctx = gsap.context(() => {
        // Envelope floats gently
        gsap.to(envelopeRef.current, {
          y: -20,
          rotation: 2,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });

        // WhatsApp Plane floats gently
        gsap.to(planeWhatsAppRef.current, {
          y: -15,
          rotation: -5,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });

      }, containerRef);

      return () => ctx.revert();
    });
  }, []);

  // Hover effects (Simple scale/move, NO TRAILS)
  useEffect(() => {
    const sendBtn = document.querySelector('button[type="submit"]');
    const whatsappBtn = document.querySelector('[href*="wa.link"]');

    if (sendBtn && envelopeRef.current) {
      const handleEnter = () => {
        import('gsap').then(({ gsap }) => {
          gsap.to(envelopeRef.current, {
            scale: 1.1,
            rotation: 10,
            duration: 0.4,
            ease: 'back.out(1.7)',
          });
        });
      };
      const handleLeave = () => {
        import('gsap').then(({ gsap }) => {
          gsap.to(envelopeRef.current, {
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      };
      sendBtn.addEventListener('mouseenter', handleEnter);
      sendBtn.addEventListener('mouseleave', handleLeave);
    }

    if (whatsappBtn && planeWhatsAppRef.current) {
      const handleEnter = () => {
        import('gsap').then(({ gsap }) => {
          gsap.to(planeWhatsAppRef.current, {
            scale: 1.1,
            rotation: -15,
            duration: 0.4,
            ease: 'back.out(1.7)',
          });
        });
      };
      const handleLeave = () => {
        import('gsap').then(({ gsap }) => {
          gsap.to(planeWhatsAppRef.current, {
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      };
      whatsappBtn.addEventListener('mouseenter', handleEnter);
      whatsappBtn.addEventListener('mouseleave', handleLeave);
    }
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Envelope - Clean, no trails */}
      <div
        ref={envelopeRef}
        className="absolute bottom-[15%] left-[52%] hidden lg:block z-0"
        style={{ width: '100px', height: '120px' }}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl">
          <rect x="8" y="25" width="84" height="65" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
          <path d="M 8 25 L 50 55 L 92 25" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
          <path d="M 8 25 L 50 55 L 92 25 L 92 90 L 8 90 Z" fill="rgba(99,102,241,0.1)"/>
        </svg>
      </div>

      {/* Plane for WhatsApp - Clean, no trails */}
      <div
        ref={planeWhatsAppRef}
        className="absolute bottom-32 left-32 hidden lg:block z-0"
      >
        <svg width="70" height="70" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            stroke="rgba(37,211,102,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(37,211,102,0.2)"
          />
        </svg>
      </div>
    </div>
  );
}
