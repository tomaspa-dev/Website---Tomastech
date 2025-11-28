import React, { useEffect, useRef } from 'react';

interface Snake {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  color: { r: number; g: number; b: number };
  trail: { x: number; y: number; age: number }[];
}

export default function GridSnake() {
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
    const cellSize = 50;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);

    // Color palette
    const colors = [
      { r: 99, g: 102, b: 241 },   // primary
      { r: 168, g: 85, b: 247 },   // secondary
      { r: 236, g: 72, b: 153 },   // accent
    ];

    // Cell glow state
    const cellGlow: number[][] = [];
    for (let i = 0; i < rows; i++) {
      cellGlow[i] = [];
      for (let j = 0; j < cols; j++) {
        cellGlow[i][j] = 0;
      }
    }

    // Create snakes
    const snakes: Snake[] = [];
    const numSnakes = 5;

    for (let i = 0; i < numSnakes; i++) {
      const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
      snakes.push({
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
        direction: directions[Math.floor(Math.random() * directions.length)],
        color: colors[i % colors.length],
        trail: [],
      });
    }

    let frameCount = 0;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw static grid
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
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

      // Update snakes every 5 frames
      if (frameCount % 5 === 0) {
        snakes.forEach(snake => {
          // Add current position to trail
          snake.trail.push({ x: snake.x, y: snake.y, age: 0 });
          
          // Activate cell glow
          if (snake.y >= 0 && snake.y < rows && snake.x >= 0 && snake.x < cols) {
            cellGlow[snake.y][snake.x] = 1;
          }

          // Move snake
          const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
          
          // Occasionally change direction
          if (Math.random() < 0.1) {
            snake.direction = directions[Math.floor(Math.random() * directions.length)];
          }

          switch (snake.direction) {
            case 'up':
              snake.y--;
              if (snake.y < 0) { snake.y = rows - 1; snake.direction = 'down'; }
              break;
            case 'down':
              snake.y++;
              if (snake.y >= rows) { snake.y = 0; snake.direction = 'up'; }
              break;
            case 'left':
              snake.x--;
              if (snake.x < 0) { snake.x = cols - 1; snake.direction = 'right'; }
              break;
            case 'right':
              snake.x++;
              if (snake.x >= cols) { snake.x = 0; snake.direction = 'left'; }
              break;
          }

          // Age trail and remove old segments
          snake.trail = snake.trail.map(t => ({ ...t, age: t.age + 1 })).filter(t => t.age < 8);
        });
      }

      // Draw cell glows (fading)
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (cellGlow[i][j] > 0) {
            const x = j * cellSize;
            const y = i * cellSize;
            const alpha = cellGlow[i][j];
            
            ctx.fillStyle = `rgba(99, 102, 241, ${alpha * 0.15})`;
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
            
            // Fade out
            cellGlow[i][j] *= 0.92;
            if (cellGlow[i][j] < 0.01) cellGlow[i][j] = 0;
          }
        }
      }

      // Draw snake trails
      snakes.forEach(snake => {
        snake.trail.forEach((segment, index) => {
          const x = segment.x * cellSize;
          const y = segment.y * cellSize;
          const alpha = 1 - (segment.age / 8);
          
          ctx.fillStyle = `rgba(${snake.color.r}, ${snake.color.g}, ${snake.color.b}, ${alpha * 0.6})`;
          ctx.fillRect(x + cellSize / 4, y + cellSize / 4, cellSize / 2, cellSize / 2);
        });

        // Draw snake head (brighter)
        const headX = snake.x * cellSize;
        const headY = snake.y * cellSize;
        ctx.fillStyle = `rgba(${snake.color.r}, ${snake.color.g}, ${snake.color.b}, 0.9)`;
        ctx.fillRect(headX + cellSize / 4, headY + cellSize / 4, cellSize / 2, cellSize / 2);
      });

      frameCount++;
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
