import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function LiquidBackground() {
  const blobsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const blobs = blobsRef.current;
    if (blobs.length === 0) return;

    // Animate blobs with smoother, slower movement
    blobs.forEach((blob, i) => {
      // Randomize start position
      gsap.set(blob, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
      });

      // Float animation
      gsap.to(blob, {
        x: "random(-200, 200, true)",
        y: "random(-200, 200, true)",
        duration: "random(15, 25)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      
      // Pulse animation
      gsap.to(blob, {
        scale: "random(0.8, 1.2)",
        opacity: "random(0.3, 0.6)",
        duration: "random(5, 10)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 1
      });
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505]">
      {/* Deep Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black pointer-events-none" />

      {/* CSS Blur Blobs (Smoother than SVG filter) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            ref={(el) => { if (el) blobsRef.current[i] = el; }}
            className={`absolute rounded-full mix-blend-screen filter blur-[120px]
              ${i % 2 === 0 ? 'bg-indigo-600' : 'bg-purple-700'}
            `}
            style={{
              width: '40vw',
              height: '40vw',
              opacity: 0.4,
              left: 0,
              top: 0,
            }}
          />
        ))}
      </div>
      
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}>
      </div>
    </div>
  );
}
