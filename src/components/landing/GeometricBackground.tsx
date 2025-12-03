import React, { useEffect, useRef } from 'react';

export default function GeometricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // 3D Shape Classes
    class Shape {
      vertices: { x: number; y: number; z: number }[];
      edges: number[][];
      x: number;
      y: number;
      z: number;
      rx: number;
      ry: number;
      rz: number;
      scale: number;
      color: string;
      speedX: number;
      speedY: number;
      rotationSpeed: number;

      constructor(x: number, y: number, scale: number, color: string) {
        this.x = x;
        this.y = y;
        this.z = 0;
        this.rx = Math.random() * Math.PI;
        this.ry = Math.random() * Math.PI;
        this.rz = Math.random() * Math.PI;
        this.scale = scale;
        this.color = color;
        this.speedX = (Math.random() - 0.5) * 0.2; // Slower, more elegant
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
        this.vertices = [];
        this.edges = [];
      }

      project(x: number, y: number, z: number) {
        const fov = 300;
        const scale = fov / (fov + z + 200); // Simple perspective
        return {
          x: this.x + x * scale * this.scale,
          y: this.y + y * scale * this.scale,
        };
      }

      rotate(x: number, y: number, z: number) {
        // Rotate X
        let y1 = y * Math.cos(this.rx) - z * Math.sin(this.rx);
        let z1 = y * Math.sin(this.rx) + z * Math.cos(this.rx);
        // Rotate Y
        let x2 = x * Math.cos(this.ry) + z1 * Math.sin(this.ry);
        let z2 = -x * Math.sin(this.ry) + z1 * Math.cos(this.ry);
        // Rotate Z
        let x3 = x2 * Math.cos(this.rz) - y1 * Math.sin(this.rz);
        let y3 = x2 * Math.sin(this.rz) + y1 * Math.cos(this.rz);
        
        return { x: x3, y: y3, z: z2 };
      }

      update() {
        this.rx += this.rotationSpeed;
        this.ry += this.rotationSpeed;
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges with buffer
        if (this.x < -100 || this.x > width + 100) this.speedX *= -1;
        if (this.y < -100 || this.y > height + 100) this.speedY *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2; // Thicker lines
        ctx.beginPath();
        
        const projectedVertices = this.vertices.map(v => {
          const rotated = this.rotate(v.x, v.y, v.z);
          return this.project(rotated.x, rotated.y, rotated.z);
        });

        this.edges.forEach(edge => {
          const v1 = projectedVertices[edge[0]];
          const v2 = projectedVertices[edge[1]];
          ctx.moveTo(v1.x, v1.y);
          ctx.lineTo(v2.x, v2.y);
        });
        
        ctx.stroke();
      }
    }

    class Icosahedron extends Shape {
      constructor(x: number, y: number, scale: number, color: string) {
        super(x, y, scale, color);
        const t = (1.0 + Math.sqrt(5.0)) / 2.0;
        this.vertices = [
          {x: -1, y: t, z: 0}, {x: 1, y: t, z: 0}, {x: -1, y: -t, z: 0}, {x: 1, y: -t, z: 0},
          {x: 0, y: -1, z: t}, {x: 0, y: 1, z: t}, {x: 0, y: -1, z: -t}, {x: 0, y: 1, z: -t},
          {x: t, y: 0, z: -1}, {x: t, y: 0, z: 1}, {x: -t, y: 0, z: -1}, {x: -t, y: 0, z: 1}
        ];
        this.edges = [
          [0, 11], [0, 5], [0, 1], [0, 7], [0, 10], [1, 5], [1, 9], [1, 8], [1, 7],
          [2, 11], [2, 10], [2, 6], [2, 3], [2, 4], [3, 4], [3, 9], [3, 8], [3, 6],
          [4, 5], [4, 9], [4, 11], [5, 11], [6, 7], [6, 8], [6, 10], [7, 8], [7, 10],
          [8, 9], [9, 11], [10, 11]
        ];
      }
    }

    class Cube extends Shape {
      constructor(x: number, y: number, scale: number, color: string) {
        super(x, y, scale, color);
        this.vertices = [
          {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1}, {x: 1, y: 1, z: -1}, {x: -1, y: 1, z: -1},
          {x: -1, y: -1, z: 1}, {x: 1, y: -1, z: 1}, {x: 1, y: 1, z: 1}, {x: -1, y: 1, z: 1}
        ];
        this.edges = [
          [0, 1], [1, 2], [2, 3], [3, 0], // Back face
          [4, 5], [5, 6], [6, 7], [7, 4], // Front face
          [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting lines
        ];
      }
    }

    const shapes: Shape[] = [];
    // Create shapes with HIGHER OPACITY and VIBRANT colors
    shapes.push(new Icosahedron(width * 0.2, height * 0.3, 120, 'rgba(59, 130, 246, 0.6)')); // Bright Blue
    shapes.push(new Cube(width * 0.8, height * 0.7, 100, 'rgba(168, 85, 247, 0.6)')); // Bright Purple
    shapes.push(new Icosahedron(width * 0.5, height * 0.5, 180, 'rgba(255, 255, 255, 0.15)')); // White center
    shapes.push(new Cube(width * 0.1, height * 0.8, 80, 'rgba(236, 72, 153, 0.5)')); // Pink

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Rich Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f172a'); // Slate 900 (Dark Blue)
      gradient.addColorStop(0.5, '#020617'); // Slate 950 (Darker)
      gradient.addColorStop(1, '#000000'); // Black
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add subtle "Aurora" mesh effect (simple circles for now)
      const aurora = ctx.createRadialGradient(width * 0.8, 0, 0, width * 0.8, 0, width * 0.6);
      aurora.addColorStop(0, 'rgba(99, 102, 241, 0.1)'); // Indigo
      aurora.addColorStop(1, 'transparent');
      ctx.fillStyle = aurora;
      ctx.fillRect(0, 0, width, height);

      const aurora2 = ctx.createRadialGradient(0, height, 0, 0, height, width * 0.6);
      aurora2.addColorStop(0, 'rgba(236, 72, 153, 0.08)'); // Pink
      aurora2.addColorStop(1, 'transparent');
      ctx.fillStyle = aurora2;
      ctx.fillRect(0, 0, width, height);

      shapes.forEach(shape => {
        shape.update();
        shape.draw(ctx);
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
