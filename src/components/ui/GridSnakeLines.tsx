import React, { useEffect, useRef, useState } from 'react';

interface EdgePosition {
  x: number;
  y: number;
  edge: 'top' | 'right' | 'bottom' | 'left';
}

export default function GridSnakeLines() {
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

    // Snake color (primary blue)
    const snakeColor = { r: 99, g: 102, b: 241 };

    // Snake position (which edge it's on)
    let currentX = Math.floor(cols / 2);
    let currentY = Math.floor(rows / 2);
    let currentEdge: 'top' | 'right' | 'bottom' | 'left' = 'top';
    let lastDirection: { dx: number; dy: number } | null = null;

    // Animation loop
    let animationFrameId: number;
    let frameCount = 0;

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

      // Draw hover effect
      const hoveredCol = Math.floor(mousePos.x / cellSize);
      const hoveredRow = Math.floor(mousePos.y / cellSize);
      
      if (hoveredCol >= 0 && hoveredCol < cols && hoveredRow >= 0 && hoveredRow < rows) {
        const x = hoveredCol * cellSize;
        const y = hoveredRow * cellSize;
        
        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      }

      // Move snake every 15 frames (slower)
      if (frameCount % 15 === 0) {
        // Choose next direction (can't go backwards)
        const possibleMoves = [
          { edge: 'top', dx: 0, dy: -1 },
          { edge: 'right', dx: 1, dy: 0 },
          { edge: 'bottom', dx: 0, dy: 1 },
          { edge: 'left', dx: -1, dy: 0 },
        ];

        // Filter out backwards movement
        const validMoves = possibleMoves.filter(move => {
          if (!lastDirection) return true;
          return !(move.dx === -lastDirection.dx && move.dy === -lastDirection.dy);
        });

        // Choose random valid move
        const nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        currentEdge = nextMove.edge as any;
        lastDirection = { dx: nextMove.dx, dy: nextMove.dy };

        // Move to adjacent cell
        currentX = (currentX + nextMove.dx + cols) % cols;
        currentY = (currentY + nextMove.dy + rows) % rows;
      }

      // Draw the snake line (2 cells long on the current edge)
      ctx.strokeStyle = `rgba(${snakeColor.r}, ${snakeColor.g}, ${snakeColor.b}, 1)`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      const x = currentX * cellSize;
      const y = currentY * cellSize;

      ctx.beginPath();
      
      switch (currentEdge) {
        case 'top':
          // Horizontal line spanning 2 cells
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize * 2, y);
          break;
        case 'right':
          // Vertical line spanning 2 cells
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize * 2);
          break;
        case 'bottom':
          // Horizontal line spanning 2 cells
          ctx.moveTo(x, y + cellSize);
          ctx.lineTo(x + cellSize * 2, y + cellSize);
          break;
        case 'left':
          // Vertical line spanning 2 cells
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize * 2);
          break;
      }
      
      ctx.stroke();

      frameCount++;
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
