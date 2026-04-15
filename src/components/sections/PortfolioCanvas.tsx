import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
  glowColor: string;
}

export default function PortfolioCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const isLight = document.documentElement.classList.contains('light');
    const palette = isLight
      ? [
          { color: 'rgba(99,102,241,0.7)', glow: 'rgba(99,102,241,0.25)' },
          { color: 'rgba(168,85,247,0.6)', glow: 'rgba(168,85,247,0.2)' },
          { color: 'rgba(236,72,153,0.5)', glow: 'rgba(236,72,153,0.18)' },
        ]
      : [
          { color: 'rgba(129,140,248,0.95)', glow: 'rgba(129,140,248,0.4)' },
          { color: 'rgba(192,132,252,0.85)', glow: 'rgba(192,132,252,0.35)' },
          { color: 'rgba(244,114,182,0.75)', glow: 'rgba(244,114,182,0.3)' },
          { color: 'rgba(99,102,241,0.9)',   glow: 'rgba(99,102,241,0.38)' },
        ];

    const MAX_DIST = 165;
    const MOUSE_RADIUS = 220;
    const MOUSE_STRENGTH = 0.04;

    function buildNodes(w: number, h: number): Node[] {
      const count = Math.min(Math.floor((w * h) / 12000), 70);
      return Array.from({ length: count }, () => {
        const p = palette[Math.floor(Math.random() * palette.length)];
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.48,
          vy: (Math.random() - 0.5) * 0.48,
          radius: Math.random() * 2.4 + 0.8,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.012 + Math.random() * 0.022,
          color: p.color,
          glowColor: p.glow,
        };
      });
    }

    function resize() {
      width = canvas.offsetWidth || window.innerWidth;
      height = canvas.offsetHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      nodesRef.current = buildNodes(width, height);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    function drawNode(node: Node, time: number) {
      const pulse = Math.sin(node.pulsePhase + time * node.pulseSpeed) * 0.5 + 0.5;
      const r = node.radius + pulse * 1.8;
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 9);
      grad.addColorStop(0, node.glowColor);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawEdge(a: Node, b: Node, dist: number) {
      const alpha = (1 - dist / MAX_DIST) * 0.38;
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      const ca = a.color.replace(/[\d.]+\)$/, `${alpha})`);
      const cb = b.color.replace(/[\d.]+\)$/, `${alpha})`);
      grad.addColorStop(0, ca);
      grad.addColorStop(1, cb);
      ctx.strokeStyle = grad;
      ctx.lineWidth = (1 - dist / MAX_DIST) * 1.3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    let time = 0;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      const nodes = nodesRef.current;
      const { x: mx, y: my } = mouseRef.current;

      nodes.forEach(n => {
        const dx = n.x - mx;
        const dy = n.y - my;
        const dd = Math.sqrt(dx * dx + dy * dy);
        if (dd < MOUSE_RADIUS && dd > 0.1) {
          const force = ((MOUSE_RADIUS - dd) / MOUSE_RADIUS) * MOUSE_STRENGTH;
          n.x += (dx / dd) * force * MOUSE_RADIUS * 0.5;
          n.y += (dy / dd) * force * MOUSE_RADIUS * 0.5;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0)     { n.x = 0;     n.vx = Math.abs(n.vx); }
        if (n.x > width) { n.x = width;  n.vx = -Math.abs(n.vx); }
        if (n.y < 0)     { n.y = 0;     n.vy = Math.abs(n.vy); }
        if (n.y > height){ n.y = height; n.vy = -Math.abs(n.vy); }
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) drawEdge(nodes[i], nodes[j], dist);
        }
      }
      nodes.forEach(n => drawNode(n, time));
      time++;
      rafRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', background: 'transparent' }}
    />
  );
}
