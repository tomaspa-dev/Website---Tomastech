import React, { useEffect, useState } from 'react';

export default function ParallaxLayers() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Layer configurations (depth determines parallax intensity)
  const layers = [
    { depth: 0.15, shapes: [
      { type: 'circle', size: 600, x: 15, y: 15, color: 'rgba(99, 102, 241, 0.25)' },
      { type: 'circle', size: 500, x: 85, y: 75, color: 'rgba(168, 85, 247, 0.2)' },
      { type: 'square', size: 400, x: 50, y: 90, color: 'rgba(236, 72, 153, 0.18)', rotation: 20 },
    ]},
    { depth: 0.3, shapes: [
      { type: 'square', size: 400, x: 75, y: 25, color: 'rgba(99, 102, 241, 0.28)', rotation: 45 },
      { type: 'circle', size: 350, x: 25, y: 65, color: 'rgba(236, 72, 153, 0.22)' },
      { type: 'circle', size: 300, x: 60, y: 40, color: 'rgba(168, 85, 247, 0.2)' },
    ]},
    { depth: 0.5, shapes: [
      { type: 'circle', size: 450, x: 45, y: 55, color: 'rgba(168, 85, 247, 0.3)' },
      { type: 'square', size: 350, x: 10, y: 85, color: 'rgba(99, 102, 241, 0.25)', rotation: 30 },
      { type: 'circle', size: 280, x: 80, y: 20, color: 'rgba(236, 72, 153, 0.22)' },
    ]},
    { depth: 0.8, shapes: [
      { type: 'circle', size: 300, x: 90, y: 45, color: 'rgba(236, 72, 153, 0.35)' },
      { type: 'square', size: 250, x: 35, y: 15, color: 'rgba(168, 85, 247, 0.3)', rotation: 15 },
      { type: 'circle', size: 220, x: 65, y: 70, color: 'rgba(99, 102, 241, 0.28)' },
    ]},
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {layers.map((layer, layerIndex) => (
        <div
          key={layerIndex}
          className="absolute inset-0 transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${mousePosition.x * layer.depth * 80}px, ${mousePosition.y * layer.depth * 80 - scrollY * layer.depth * 0.8}px)`,
          }}
        >
          {layer.shapes.map((shape, shapeIndex) => (
            <div
              key={shapeIndex}
              className="absolute animate-float-slow"
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: `${shape.size}px`,
                height: `${shape.size}px`,
                transform: `translate(-50%, -50%) ${shape.rotation ? `rotate(${shape.rotation}deg)` : ''}`,
                animationDelay: `${layerIndex * 0.5 + shapeIndex * 0.3}s`,
              }}
            >
              <div
                className={`w-full h-full ${shape.type === 'circle' ? 'rounded-full' : 'rounded-3xl'} blur-3xl`}
                style={{
                  background: shape.color,
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
