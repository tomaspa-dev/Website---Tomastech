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

    // Smooth mouse tracking
    let targetMX = width * 0.5;
    let targetMY = height * 0.5;
    let currentMX = targetMX;
    let currentMY = targetMY;

    const onMouse = (e: MouseEvent) => { targetMX = e.clientX; targetMY = e.clientY; };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // ─── Shape Base ───────────────────────────────────────────────────────
    class Shape {
      vertices: { x: number; y: number; z: number }[] = [];
      edges: number[][] = [];
      x: number; y: number; z = 0;
      rx: number; ry: number; rz: number;
      scale: number;
      color: string;
      lineWidth: number;
      speedX: number; speedY: number;
      rotSpeedX: number; rotSpeedY: number;

      constructor(x: number, y: number, scale: number, color: string, lw = 1.2) {
        this.x = x; this.y = y; this.scale = scale; this.color = color; this.lineWidth = lw;
        this.rx = Math.random() * Math.PI;
        this.ry = Math.random() * Math.PI;
        this.rz = Math.random() * Math.PI;
        this.speedX = (Math.random() - 0.5) * 0.12;
        this.speedY = (Math.random() - 0.5) * 0.12;
        this.rotSpeedX = (Math.random() - 0.5) * 0.004;
        this.rotSpeedY = (Math.random() - 0.5) * 0.004;
      }

      project(x: number, y: number, z: number, ox: number, oy: number) {
        const fov = 320;
        const s = fov / (fov + z + 200);
        return { x: ox + x * s * this.scale, y: oy + y * s * this.scale };
      }

      rotate3D(x: number, y: number, z: number) {
        // X-axis
        let y1 = y * Math.cos(this.rx) - z * Math.sin(this.rx);
        let z1 = y * Math.sin(this.rx) + z * Math.cos(this.rx);
        // Y-axis
        let x2 = x * Math.cos(this.ry) + z1 * Math.sin(this.ry);
        let z2 = -x * Math.sin(this.ry) + z1 * Math.cos(this.ry);
        // Z-axis
        let x3 = x2 * Math.cos(this.rz) - y1 * Math.sin(this.rz);
        let y3 = x2 * Math.sin(this.rz) + y1 * Math.cos(this.rz);
        return { x: x3, y: y3, z: z2 };
      }

      update(mouseX: number, mouseY: number) {
        // Mouse-driven gentle rotation bias
        const mxN = (mouseX / width - 0.5) * 0.003;
        const myN = (mouseY / height - 0.5) * 0.003;
        this.rx += this.rotSpeedX + myN;
        this.ry += this.rotSpeedY + mxN;
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -120 || this.x > width + 120) this.speedX *= -1;
        if (this.y < -120 || this.y > height + 120) this.speedY *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        const proj = this.vertices.map(v => {
          const r = this.rotate3D(v.x, v.y, v.z);
          return this.project(r.x, r.y, r.z, this.x, this.y);
        });
        ctx.beginPath();
        this.edges.forEach(([a, b]) => {
          ctx.moveTo(proj[a].x, proj[a].y);
          ctx.lineTo(proj[b].x, proj[b].y);
        });
        ctx.stroke();
      }
    }

    // ─── Icosahedron ──────────────────────────────────────────────────────
    class Icosahedron extends Shape {
      constructor(x: number, y: number, scale: number, color: string, lw?: number) {
        super(x, y, scale, color, lw);
        const t = (1 + Math.sqrt(5)) / 2;
        this.vertices = [
          {x:-1,y:t,z:0},{x:1,y:t,z:0},{x:-1,y:-t,z:0},{x:1,y:-t,z:0},
          {x:0,y:-1,z:t},{x:0,y:1,z:t},{x:0,y:-1,z:-t},{x:0,y:1,z:-t},
          {x:t,y:0,z:-1},{x:t,y:0,z:1},{x:-t,y:0,z:-1},{x:-t,y:0,z:1},
        ];
        this.edges = [
          [0,11],[0,5],[0,1],[0,7],[0,10],[1,5],[1,9],[1,8],[1,7],
          [2,11],[2,10],[2,6],[2,3],[2,4],[3,4],[3,9],[3,8],[3,6],
          [4,5],[4,9],[4,11],[5,11],[6,7],[6,8],[6,10],[7,8],[7,10],
          [8,9],[9,11],[10,11],
        ];
      }
    }

    // ─── Cube ─────────────────────────────────────────────────────────────
    class Cube extends Shape {
      constructor(x: number, y: number, scale: number, color: string, lw?: number) {
        super(x, y, scale, color, lw);
        this.vertices = [
          {x:-1,y:-1,z:-1},{x:1,y:-1,z:-1},{x:1,y:1,z:-1},{x:-1,y:1,z:-1},
          {x:-1,y:-1,z:1},{x:1,y:-1,z:1},{x:1,y:1,z:1},{x:-1,y:1,z:1},
        ];
        this.edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      }
    }

    // ─── Octahedron ───────────────────────────────────────────────────────
    class Octahedron extends Shape {
      constructor(x: number, y: number, scale: number, color: string, lw?: number) {
        super(x, y, scale, color, lw);
        this.vertices = [
          {x:0,y:1,z:0},{x:1,y:0,z:0},{x:0,y:0,z:1},
          {x:-1,y:0,z:0},{x:0,y:0,z:-1},{x:0,y:-1,z:0},
        ];
        this.edges = [[0,1],[0,2],[0,3],[0,4],[5,1],[5,2],[5,3],[5,4],[1,2],[2,3],[3,4],[4,1]];
      }
    }

    // ─── Torus (approximated with lat/lon rings) ───────────────────────────
    class Torus extends Shape {
      constructor(x: number, y: number, scale: number, color: string, lw?: number) {
        super(x, y, scale, color, lw);
        const R = 1.6, r = 0.5;
        const latSegs = 10, lonSegs = 16;
        const verts: {x:number;y:number;z:number}[] = [];
        for (let i = 0; i < latSegs; i++) {
          const theta = (i / latSegs) * Math.PI * 2;
          for (let j = 0; j < lonSegs; j++) {
            const phi = (j / lonSegs) * Math.PI * 2;
            verts.push({
              x: (R + r * Math.cos(phi)) * Math.cos(theta),
              y: r * Math.sin(phi),
              z: (R + r * Math.cos(phi)) * Math.sin(theta),
            });
          }
        }
        this.vertices = verts;
        const edges: number[][] = [];
        for (let i = 0; i < latSegs; i++) {
          for (let j = 0; j < lonSegs; j++) {
            const a = i * lonSegs + j;
            const b = i * lonSegs + (j + 1) % lonSegs;
            const c = ((i + 1) % latSegs) * lonSegs + j;
            edges.push([a, b], [a, c]);
          }
        }
        this.edges = edges;
      }
    }

    // ─── Build shapes ─────────────────────────────────────────────────────
    const isMobile = width < 768;
    const isLight = document.documentElement.classList.contains('light');

    const c1 = isLight ? 'rgba(99,102,241,0.28)'  : 'rgba(99,102,241,0.42)';
    const c2 = isLight ? 'rgba(168,85,247,0.22)'  : 'rgba(168,85,247,0.36)';
    const c3 = isLight ? 'rgba(236,72,153,0.18)'  : 'rgba(236,72,153,0.28)';
    const c4 = isLight ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)';
    const c5 = isLight ? 'rgba(52,211,153,0.18)'  : 'rgba(52,211,153,0.25)';

    const shapes: Shape[] = isMobile
      ? [
          new Icosahedron(width * 0.78, height * 0.14, 50, c1, 1),
          new Torus(width * 0.15, height * 0.78, 28, c2, 0.8),
        ]
      : [
          new Icosahedron(width * 0.72, height * 0.34, 110, c1, 1.4),
          new Cube(    width * 0.84, height * 0.66, 82, c2, 1.1),
          new Torus(   width * 0.20, height * 0.55, 65, c5, 0.9),
          new Octahedron(width * 0.5,  height * 0.78, 55, c3, 0.9),
          new Icosahedron(width * 0.12, height * 0.22, 45, c4, 0.8),
          new Cube(    width * 0.62, height * 0.12, 42, c3, 0.85),
        ];

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      // Smooth mouse lerp
      currentMX += (targetMX - currentMX) * 0.04;
      currentMY += (targetMY - currentMY) * 0.04;
      shapes.forEach(s => { s.update(currentMX, currentMY); s.draw(ctx); });
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}
