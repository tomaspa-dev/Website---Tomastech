import React, { useEffect, useRef } from 'react';

export default function JourneyLines() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || typeof window === 'undefined') return;

    // Dynamic import GSAP with plugins
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const svg = svgRef.current!;
        const path = svg.querySelector('#journey-path') as SVGPathElement;
        
        if (!path) return;

        // Calculate path based on actual step positions
        const updatePath = () => {
          const steps = document.querySelectorAll('.journey-step');
          if (steps.length === 0) return;

          const firstCircle = steps[0].querySelector('.journey-circle') as HTMLElement;
          const lastCircle = steps[steps.length - 1].querySelector('.journey-circle') as HTMLElement;
          
          if (!firstCircle || !lastCircle) return;

          const containerRect = containerRef.current!.getBoundingClientRect();
          const firstRect = firstCircle.getBoundingClientRect();
          const lastRect = lastCircle.getBoundingClientRect();

          const x = firstRect.left + firstRect.width / 2 - containerRect.left;
          const y1 = firstRect.top + firstRect.height / 2 - containerRect.top;
          const y2 = lastRect.top + lastRect.height / 2 - containerRect.top;

          path.setAttribute('d', `M ${x} ${y1} L ${x} ${y2}`);
        };

        updatePath();
        window.addEventListener('resize', updatePath);

        // Animate the SVG path drawing on scroll
        gsap.fromTo(path,
          { strokeDashoffset: path.getTotalLength() },
          {
            strokeDashoffset: 0,
            scrollTrigger: {
              trigger: "#expertise",
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            }
          }
        );

        // Set initial dasharray
        const pathLength = path.getTotalLength();
        path.style.strokeDasharray = `${pathLength}`;
        path.style.strokeDashoffset = `${pathLength}`;

        return () => {
          window.removeEventListener('resize', updatePath);
        };
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="33%" stopColor="#8b5cf6" />
            <stop offset="66%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path
          id="journey-path"
          d="M 48 100 L 48 500"
          stroke="url(#lineGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }}
        />
      </svg>
    </div>
  );
}
