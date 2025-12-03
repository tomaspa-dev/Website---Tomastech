import React, { useEffect, useRef } from 'react';

export default function GeometricCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dynamic import GSAP
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        let width = canvas.clientWidth;
        let height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;

        // --- 3D MATH & SHAPES ---
        
        // Base vertices for different shapes (normalized -1 to 1)
        const shapes = {
          sphere: [] as any[],
          cube: [] as any[],
          pyramid: [] as any[],
          icosahedron: [] as any[]
        };

        // 1. Icosahedron (12 vertices) - The "Master" count
        const t = (1.0 + Math.sqrt(5.0)) / 2.0;
        const rawIco = [
          [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
          [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
          [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
        ];
        // Normalize Ico
        shapes.icosahedron = rawIco.map(v => {
          const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
          return { x: v[0]/len, y: v[1]/len, z: v[2]/len };
        });

        // 2. Sphere (Same 12 vertices but we'll treat them as points on a sphere - which Ico already is)
        // To make it look more "sphere-like" in wireframe, we might want more points, but for morphing 12 is the constraint.
        // Actually, Ico IS a sphere approximation. Let's make "Sphere" a bit more random/cloud-like or just the Ico itself but rotating differently?
        // Better: Let's make "Sphere" actually be the Icosahedron but with curved edges? No, too complex for simple canvas.
        // Let's stick to Icosahedron as the "Sphere" representation (it's roundish).
        // Wait, user wanted: Sphere -> Cube -> Pyramid -> Icosahedron.
        // Maybe "Sphere" can be a Dodecahedron? Or just the Ico.
        // Let's use Ico vertices for Sphere.
        shapes.sphere = shapes.icosahedron.map(v => ({ ...v }));

        // 3. Cube (8 vertices) -> Map to 12
        // Cube vertices: (+-1, +-1, +-1)
        const rawCube = [
          [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1],
          [-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]
        ];
        // Map 8 to 12: Duplicate the first 4
        const mappedCube = [...rawCube, ...rawCube.slice(0, 4)]; 
        shapes.cube = mappedCube.map(v => {
          const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
          // Normalize but keep cube shape (project to sphere? No, keep cube)
          // Actually, for wireframe cube, we need exact coords.
          // Let's just use raw coords normalized by max value to fit in 1.
          return { x: v[0], y: v[1], z: v[2] };
        });

        // 4. Pyramid (Tetrahedron - 4 vertices) -> Map to 12
        const rawPyramid = [
          [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]
        ];
        // Map 4 to 12: Repeat 3 times
        const mappedPyramid = [...rawPyramid, ...rawPyramid, ...rawPyramid];
        shapes.pyramid = mappedPyramid.map(v => ({ x: v[0], y: v[1], z: v[2] }));


        // Current State
        const currentVertices = shapes.sphere.map(v => ({ ...v }));
        const rotation = { x: 0, y: 0, z: 0 };
        const state = { progress: 0 }; // 0=Sphere, 1=Cube, 2=Pyramid, 3=Ico

        // Edges (Indices) - We need a consistent edge set or draw all connections?
        // Drawing all connections (fully connected graph) looks messy.
        // Let's define edges for the "Master" Icosahedron and just let them distort for others.
        // Icosahedron edges:
        const edges = [
          [0, 11], [0, 5], [0, 1], [0, 7], [0, 10], [1, 5], [1, 9], [1, 8], [1, 7],
          [2, 11], [2, 10], [2, 6], [2, 3], [2, 4], [3, 4], [3, 9], [3, 8], [3, 6],
          [4, 5], [4, 9], [4, 11], [5, 11], [6, 7], [6, 8], [6, 10], [7, 8], [7, 10],
          [8, 9], [9, 11], [10, 11]
        ];

        // --- ANIMATION LOOP ---
        const animate = () => {
          ctx.clearRect(0, 0, width, height);
          
          // Center
          const cx = width / 2;
          const cy = height / 2;
          const scale = Math.min(width, height) * 0.25; // Size of object

          // Rotate
          rotation.x += 0.005;
          rotation.y += 0.008;

          // Interpolate Vertices based on state.progress
          // 0-1: Sphere -> Cube
          // 1-2: Cube -> Pyramid
          // 2-3: Pyramid -> Icosahedron
          
          let targetShape: any[] = [];
          let prevShape: any[] = [];
          let blend = 0;

          if (state.progress < 1) {
            prevShape = shapes.sphere;
            targetShape = shapes.cube;
            blend = state.progress;
          } else if (state.progress < 2) {
            prevShape = shapes.cube;
            targetShape = shapes.pyramid;
            blend = state.progress - 1;
          } else {
            prevShape = shapes.pyramid;
            targetShape = shapes.icosahedron;
            blend = state.progress - 2;
          }
          // Clamp blend
          blend = Math.max(0, Math.min(1, blend));

          // Update current vertices
          for (let i = 0; i < 12; i++) {
            const p = prevShape[i];
            const t = targetShape[i];
            currentVertices[i].x = p.x + (t.x - p.x) * blend;
            currentVertices[i].y = p.y + (t.y - p.y) * blend;
            currentVertices[i].z = p.z + (t.z - p.z) * blend;
          }

          // Project and Draw
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'; // Indigo
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();

          const projected = currentVertices.map(v => {
            // Rotate
            let x = v.x;
            let y = v.y;
            let z = v.z;

            // Rot X
            let y1 = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
            let z1 = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);
            // Rot Y
            let x2 = x * Math.cos(rotation.y) + z1 * Math.sin(rotation.y);
            let z2 = -x * Math.sin(rotation.y) + z1 * Math.cos(rotation.y);

            // Project
            const fov = 500;
            const pScale = fov / (fov + z2 * scale + 400);
            return {
              x: cx + x2 * scale * pScale,
              y: cy + y1 * scale * pScale
            };
          });

          // Draw Edges
          edges.forEach(edge => {
            const p1 = projected[edge[0]];
            const p2 = projected[edge[1]];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          });
          
          ctx.stroke();

          // Draw Vertices (Dots)
          ctx.fillStyle = '#fff';
          projected.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
          });

          requestAnimationFrame(animate);
        };

        animate();

        // --- SCROLL TRIGGER ---
        // We want the shape to morph as we scroll through the steps.
        // The steps are in #expertise section.
        // Let's assume the container is the trigger.
        
        ScrollTrigger.create({
          trigger: "#expertise",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            // Map scroll progress (0 to 1) to shape states (0 to 3)
            // We have 4 steps, so we want:
            // Start: 0 (Sphere)
            // End: 3 (Ico)
            state.progress = self.progress * 3;
          }
        });

        const handleResize = () => {
          width = canvas.clientWidth;
          height = canvas.clientHeight;
          canvas.width = width;
          canvas.height = height;
        };
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
          ScrollTrigger.getAll().forEach(t => t.kill());
        };
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none z-0 opacity-40 md:opacity-100">
      <canvas ref={canvasRef} className="w-full h-full max-w-2xl max-h-2xl" />
    </div>
  );
}
