import React, { useEffect, useState } from 'react';

export default function SubtleParallax() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Very subtle movement - only 5% of mouse position
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 0.1,
        y: (e.clientY / window.innerHeight - 0.5) * 0.1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Large geometric shapes with very subtle colors
  const shapes = [
    { 
      size: 800, 
      x: 15, 
      y: 20, 
      color: 'rgba(99, 102, 241, 0.15)',
      depth: 0.3,
      type: 'circle'
    },
    { 
      size: 600, 
      x: 75, 
      y: 60, 
      color: 'rgba(168, 85, 247, 0.2)',
      depth: 0.5,
      type: 'circle'
    },
    { 
      size: 700, 
      x: 50, 
      y: 50, 
      color: 'rgba(236, 72, 153, 0.12)',
      depth: 0.2,
      type: 'square'
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, index) => (
        <div
          key={index}
          className="absolute transition-transform duration-700 ease-out"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            transform: `translate(-50%, -50%) translate(${mousePosition.x * shape.depth * 50}px, ${mousePosition.y * shape.depth * 50}px)`,
          }}
        >
          <div
            className={`w-full h-full ${shape.type === 'circle' ? 'rounded-full' : 'rounded-3xl rotate-12'} blur-3xl animate-pulse-slow`}
            style={{
              background: shape.color,
              animationDelay: `${index * 1}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
