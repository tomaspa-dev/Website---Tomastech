import React, { useEffect, useRef } from 'react';
import JourneyLines from './JourneyLines';

export default function ExpertiseBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        // Remove containerRef scope since we are animating elements outside of this component
        const ctx = gsap.context(() => {
          console.log('🎬 GSAP Expertise animations initializing...');

          // 1. Subtitle Color Fill Effect
          const subtitles = document.querySelectorAll('.subtitle-fill span:first-child');
          subtitles.forEach((subtitle: any) => {
            gsap.fromTo(subtitle, 
              { backgroundSize: "0% 100%" },
              {
                backgroundSize: "100% 100%",
                ease: "none",
                scrollTrigger: {
                  trigger: subtitle,
                  start: "top 80%",
                  end: "top 40%",
                  scrub: 1,
                }
              }
            );
          });

          // 2. Asterisk Spin Effect (Steps 1 & 4)
          const asteriskContainers = document.querySelectorAll('.asterisk-container');
          asteriskContainers.forEach((container: any, index: number) => {
            const asterisks = container.querySelectorAll('.asterisk-spin');
            
            // Rotate forward on scroll down, backward on scroll up
            gsap.to(asterisks, {
              rotation: 360 * 2,
              ease: "none",
              scrollTrigger: {
                trigger: container,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              }
            });
          });

          // 3. Hole Effect (Steps 2 & 3)
          const holeSteps = document.querySelectorAll('.hole-effect-step');
          holeSteps.forEach((step: any) => {
            const target = step.querySelector('.hole-target');
            const voidCircle = step.querySelector('.hole-void');
            
            if (target && voidCircle) {
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: step,
                  start: "top 20%", // Start effect when near top
                  end: "bottom top",
                  scrub: 1,
                  toggleActions: "play reverse play reverse"
                }
              });

              // As we scroll past, scale down into the hole
              tl.to(voidCircle, { scale: 1.5, duration: 0.5 }) // Open hole
                .to(target, { scale: 0, opacity: 0, rotation: 180, duration: 0.5 }, "<") // Suck into hole
                .to(voidCircle, { scale: 0, duration: 0.3 }); // Close hole
            }
          });

          // 4. Content Fade In (Existing)
          const contents = document.querySelectorAll('.journey-content');
          contents.forEach((content: any, index: number) => {
            gsap.fromTo(content,
              { opacity: 0, scale: 0.9, y: 30 },
              {
                opacity: 1,
                scale: 1,
                y: 0,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: content,
                  start: 'top 85%',
                  end: 'top 50%',
                  scrub: 1,
                }
              }
            );
          });

          console.log('✅ GSAP Expertise animations initialized successfully');

        }); // Scope removed

        return () => ctx.revert();
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* GSAP Journey Lines */}
      <JourneyLines />
    </div>
  );
}
