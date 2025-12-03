import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface LiquidChromeProps {
  distortionState: 'idle' | 'hover' | 'active';
}

export default function LiquidChrome({ distortionState }: LiquidChromeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    // Idle Animation: Organic morphing
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    if (turbulenceRef.current) {
      tl.to(turbulenceRef.current, {
        attr: { baseFrequency: "0.02 0.03" },
        duration: 8,
        ease: "sine.inOut"
      });
    }
  }, []);

  useEffect(() => {
    if (!ringRef.current || !displacementRef.current) return;

    if (distortionState === 'hover') {
      // Magnetic Pull / High Distortion
      gsap.to(displacementRef.current, {
        attr: { scale: 100 },
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
      });
      gsap.to(ringRef.current, {
        strokeWidth: 60,
        duration: 0.5,
        ease: "power2.out"
      });
    } else if (distortionState === 'active') {
      // Meltdown
      gsap.to(displacementRef.current, {
        attr: { scale: 200 },
        duration: 1.5,
        ease: "expo.in"
      });
      gsap.to(ringRef.current, {
        strokeWidth: 0,
        scale: 0,
        transformOrigin: "center",
        duration: 1,
        ease: "power2.in"
      });
    } else {
      // Idle
      gsap.to(displacementRef.current, {
        attr: { scale: 30 },
        duration: 1,
        ease: "power2.out"
      });
      gsap.to(ringRef.current, {
        strokeWidth: 40,
        scale: 1,
        duration: 1,
        ease: "power2.out"
      });
    }
  }, [distortionState]);

  // Mouse Interaction (Displacement)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) * 0.05;
      const y = (e.clientY - innerHeight / 2) * 0.05;

      if (containerRef.current) {
        gsap.to(containerRef.current, {
          x: x,
          y: y,
          duration: 1,
          ease: "power3.out"
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden bg-black">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_70%)] opacity-50" />

      {/* SVG Liquid Filter */}
      <svg width="0" height="0">
        <defs>
          <filter id="liquid-metal">
            {/* 1. Create Noise */}
            <feTurbulence 
              ref={turbulenceRef}
              type="fractalNoise" 
              baseFrequency="0.01 0.01" 
              numOctaves="3" 
              result="noise" 
            />
            {/* 2. Displace the source graphic using noise */}
            <feDisplacementMap 
              ref={displacementRef}
              in="SourceGraphic" 
              in2="noise" 
              scale="30" 
              xChannelSelector="R" 
              yChannelSelector="G" 
              result="displaced"
            />
            {/* 3. Lighting for 3D/Metallic look */}
            <feGaussianBlur in="displaced" stdDeviation="2" result="blurred" />
            <feSpecularLighting 
              in="blurred" 
              surfaceScale="5" 
              specularConstant="1.5" 
              specularExponent="30" 
              lightingColor="#ffffff" 
              result="specular"
            >
              <fePointLight x="-500" y="-500" z="600" />
            </feSpecularLighting>
            {/* 4. Composite lighting with original */}
            <feComposite in="specular" in2="displaced" operator="in" result="composite" />
            <feComposite in="SourceGraphic" in2="composite" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>
      </svg>

      {/* The Ring Element */}
      <svg 
        viewBox="0 0 600 600" 
        className="w-[600px] h-[600px] relative z-10"
        style={{ filter: 'url(#liquid-metal)' }}
      >
        <circle 
          ref={ringRef}
          cx="300" 
          cy="300" 
          r="150" 
          fill="none" 
          stroke="url(#metal-gradient)" 
          strokeWidth="40"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="metal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e0e0" />
            <stop offset="25%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#9ca3af" />
            <stop offset="75%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
