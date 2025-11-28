import React, { useEffect, useRef } from 'react';

export default function Grid3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid settings
    const gridSize = 50;
    const perspective = 500;
    let offset = 0;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move grid forward
      offset += 0.5;
      if (offset >= gridSize) offset = 0;

      // Set perspective
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Draw horizontal lines
      for (let i = -10; i <= 10; i++) {
        const y = i * gridSize - offset;
        const z = perspective;
        
        // Calculate perspective projection
        const scale = perspective / (perspective + y);
        const projectedY = y * scale;
        
        if (scale > 0 && scale < 2) {
          const alpha = Math.max(0, Math.min(1, scale - 0.2));
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.3})`; // primary color
          ctx.lineWidth = 1 * scale;
          
          ctx.beginPath();
          ctx.moveTo(-canvas.width, projectedY);
          ctx.lineTo(canvas.width, projectedY);
          ctx.stroke();
        }
      }

      // Draw vertical lines
      for (let i = -20; i <= 20; i++) {
        const x = i * gridSize;
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)'; // primary color
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(x, -canvas.height);
        ctx.lineTo(x * 0.5, canvas.height);
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
