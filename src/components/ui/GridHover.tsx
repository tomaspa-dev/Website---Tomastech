import React, { useEffect, useRef, useState } from 'react';

export default function GridHover() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1, y: -1 });

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

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Grid settings
    const cellSize = 60;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw static grid (white lines with opacity)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
      }
      
      for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
      }

      // Draw hover effect with neon glow on borders
      const hoveredCol = Math.floor(mousePos.x / cellSize);
      const hoveredRow = Math.floor(mousePos.y / cellSize);
      
      if (hoveredCol >= 0 && hoveredCol < cols && hoveredRow >= 0 && hoveredRow < rows) {
        const x = hoveredCol * cellSize;
        const y = hoveredRow * cellSize;
        
        // Neon glow effect on borders
        const glowColor = 'rgba(99, 102, 241, ';
        
        // Multiple layers for glow effect
        for (let i = 3; i >= 1; i--) {
          ctx.strokeStyle = glowColor + (0.3 / i) + ')';
          ctx.lineWidth = i * 3;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
        
        // Bright inner border
        ctx.strokeStyle = 'rgba(99, 102, 241, 1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellSize, cellSize);
        
        // Subtle fill
        ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos.x, mousePos.y]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
    />
  );
}
