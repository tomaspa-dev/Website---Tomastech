import React, { useEffect, useRef } from 'react';

export default function AnimatedGrid() {
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
    const cellSize = 40;
    const cols = Math.ceil(canvas.width / cellSize) + 1;
    const rows = Math.ceil(canvas.height / cellSize) + 1;

    // Color palette
    const colors = [
      { r: 99, g: 102, b: 241 },   // primary (indigo)
      { r: 168, g: 85, b: 247 },   // secondary (purple)
      { r: 236, g: 72, b: 153 },   // accent (pink)
    ];

    // Grid state
    const grid: number[][] = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        grid[i][j] = 0;
      }
    }

    let time = 0;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      // Update and draw grid
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * cellSize;
          const y = i * cellSize;

          // Create wave pattern
          const distance = Math.sqrt(
            Math.pow(j - cols / 2, 2) + Math.pow(i - rows / 2, 2)
          );
          
          // Multiple wave patterns
          const wave1 = Math.sin(distance * 0.3 - time * 3) * 0.5 + 0.5;
          const wave2 = Math.sin(j * 0.2 + time * 2) * 0.5 + 0.5;
          const wave3 = Math.sin(i * 0.2 - time * 2.5) * 0.5 + 0.5;
          
          // Combine waves
          const intensity = (wave1 + wave2 + wave3) / 3;
          
          // Color selection based on position and time
          const colorIndex = Math.floor((distance + time * 5) % 3);
          const color = colors[colorIndex];

          // Draw cell with glow
          if (intensity > 0.3) {
            const alpha = (intensity - 0.3) * 1.4;
            
            // Outer glow
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.15})`;
            ctx.fillRect(x - 2, y - 2, cellSize + 4, cellSize + 4);
            
            // Inner cell
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.4})`;
            ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
            
            // Bright center
            if (intensity > 0.7) {
              ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.6})`;
              ctx.fillRect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
            }
          }
        }
      }

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
