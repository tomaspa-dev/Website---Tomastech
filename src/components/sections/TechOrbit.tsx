import React from 'react';

// Inline SVGs — correct, official mark versions of each logo
// All use circular containers (border-radius: 50%)
const TECHS = [
  {
    name: 'React',
    r: 150, startAngle: 0, speed: 32,
    color: '#61DAFB', bg: 'rgba(97,218,251,0.15)', border: 'rgba(97,218,251,0.4)',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2.1" fill="#61DAFB"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" stroke-width="1.4" fill="none"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" stroke-width="1.4" fill="none" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" stroke-width="1.4" fill="none" transform="rotate(120 12 12)"/>
    </svg>`,
  },
  {
    name: 'TypeScript',
    r: 150, startAngle: Math.PI * 0.55, speed: 32,
    color: '#3178C6', bg: 'rgba(49,120,198,0.15)', border: 'rgba(49,120,198,0.45)',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="3" fill="#3178C6"/>
      <path d="M9.5 10.5H14.5V12H12.5V18H11V12H9.5V10.5Z" fill="white"/>
      <path d="M15.5 14.5C15.5 14.5 16.2 15 17 15C17.8 15 18 14.6 18 14.3C18 13.4 15.5 13.3 15.5 11.8C15.5 10.7 16.4 10 17.5 10C18.4 10 19 10.4 19 10.4L18.5 11.7C18.5 11.7 18 11.3 17.4 11.3C16.8 11.3 16.6 11.6 16.6 11.9C16.6 12.7 19 12.7 19 14.3C19 15.5 18.2 16.3 17 16.3C15.8 16.3 15 15.6 15 15.6L15.5 14.5Z" fill="white"/>
    </svg>`,
  },
  {
    name: 'Astro',
    r: 150, startAngle: Math.PI * 1.1, speed: 32,
    color: '#FF5D01', bg: 'rgba(255,93,1,0.14)', border: 'rgba(255,93,1,0.42)',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 3L7 14l2 1.5c1-1.5 2.5-2 3-2l1.5 2L17 14 14.5 3H9.5Z" fill="#FF5D01"/>
      <path d="M7 14c0 0-1 4 5 4s5-4 5-4l-1.5-2c-.5 0-2 .5-3 2-1-1.5-2.5-2-3-2L7 14Z" fill="#FF9070"/>
    </svg>`,
  },
  {
    name: 'Next.js',
    r: 150, startAngle: Math.PI * 1.65, speed: 32,
    color: '#ffffff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.28)',
    svg: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 14H9V9h2v7Zm5.62 0-4.12-5.79V16h-2V8h1.88l4.12 5.79V8h2v8h-1.88Z"/>
    </svg>`,
  },
  {
    name: 'Tailwind',
    r: 105, startAngle: Math.PI * 0.2, speed: 24,
    color: '#38BDF8', bg: 'rgba(56,189,248,0.13)', border: 'rgba(56,189,248,0.4)',
    svg: `<svg viewBox="0 0 24 24" fill="#38BDF8" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.1 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C15.62 7.15 14.5 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.1 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C10.62 13.15 9.5 12 7 12z"/>
    </svg>`,
  },
  {
    name: 'Node.js',
    r: 105, startAngle: Math.PI * 0.87, speed: 24,
    color: '#68A063', bg: 'rgba(104,160,99,0.13)', border: 'rgba(104,160,99,0.4)',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#68A063" d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.18L19.82 8.5 12 12.82 4.18 8.5 12 4.18zM3.5 9.72l8 4.4v7.71L3.5 17.4V9.72zm9.5 12.11v-7.71l8-4.4v7.69l-8 4.42z"/>
    </svg>`,
  },
  {
    name: 'Three.js',
    r: 105, startAngle: Math.PI * 1.54, speed: 24,
    color: '#ffffff', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.22)',
    svg: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3l7.5 18 3.5-8.5L21 3H3zm3.1 2h11.8l-4.4 8.8L9.9 9.3 6.1 5zm4.6 5.6l2.3 4.6-1.5 3.6L9 11.3l1.7-.7z"/>
    </svg>`,
  },
];

export default function TechOrbit() {
  return (
    <div className="relative flex-shrink-0" style={{ width: 340, height: 340 }} aria-hidden="true">
      {/* Orbit rings */}
      <div className="absolute rounded-full pf-orbit-ring" style={{ width: 300, height: 300, left: 20, top: 20 }} />
      <div className="absolute rounded-full pf-orbit-ring" style={{ width: 210, height: 210, left: 65, top: 65 }} />

      {/* Center dot */}
      <div className="absolute rounded-full pf-orbit-center" style={{ width: 10, height: 10, left: 165, top: 165 }} />

      {/* Tech logo planets — perfectly circular */}
      {TECHS.map((tech, i) => (
        <div
          key={tech.name}
          className="absolute tech-orbit-badge"
          style={{
            left: '50%', top: '50%',
            animationName: `techOrbit${i}`,
            animationDuration: `${tech.speed}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${-(i * tech.speed) / TECHS.length}s`,
          } as React.CSSProperties}
        >
          <div
            title={tech.name}
            style={{
              width: 42, height: 42,
              borderRadius: '50%',           // ← PERFECT CIRCLE
              background: tech.bg,
              border: `1.5px solid ${tech.border}`,
              boxShadow: `0 0 12px ${tech.bg}, 0 0 6px ${tech.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'translate(-50%, -50%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
              overflow: 'hidden',
            }}
          >
            <div
              style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{ __html: tech.svg }}
            />
          </div>
        </div>
      ))}

      <style>{`
        .pf-orbit-ring {
          border: 1px solid rgba(129,140,248,0.13);
        }
        .pf-orbit-center {
          background: rgba(129,140,248,0.35);
          box-shadow: 0 0 8px rgba(129,140,248,0.5);
        }
        :global(.light) .pf-orbit-ring {
          border-color: rgba(99,102,241,0.18);
        }
        :global(.light) .pf-orbit-center {
          background: rgba(99,102,241,0.4);
        }
        .tech-orbit-badge { width: 0; height: 0; position: absolute; }
        .tech-orbit-badge > div:hover {
          transform: translate(-50%, -50%) scale(1.25) !important;
          box-shadow: 0 0 20px rgba(129,140,248,0.4) !important;
        }
        ${TECHS.map((tech, i) => `
          @keyframes techOrbit${i} {
            from { transform: rotate(${tech.startAngle}rad) translateX(${tech.r}px) rotate(${-tech.startAngle}rad); }
            to   { transform: rotate(${tech.startAngle + Math.PI * 2}rad) translateX(${tech.r}px) rotate(${-(tech.startAngle + Math.PI * 2)}rad); }
          }
        `).join('')}
        @media (prefers-reduced-motion: reduce) {
          .tech-orbit-badge { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
