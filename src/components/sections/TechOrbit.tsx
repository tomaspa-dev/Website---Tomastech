import React from 'react';

// Pure SVG tech logos — no text labels
const TECHS = [
  {
    name: 'React',
    r: 158, startAngle: 0, speed: 30,
    color: '#61DAFB', bg: 'rgba(97,218,251,0.12)', border: 'rgba(97,218,251,0.35)',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="#61DAFB"><ellipse cx="12" cy="12" rx="2" ry="2"/><ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" stroke-width="1.5" fill="none"/><ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" stroke-width="1.5" fill="none" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="3.8" stroke="#61DAFB" stroke-width="1.5" fill="none" transform="rotate(120 12 12)"/></g></svg>`,
  },
  {
    name: 'TypeScript',
    r: 158, startAngle: Math.PI * 0.5, speed: 30,
    color: '#3178C6', bg: 'rgba(49,120,198,0.12)', border: 'rgba(49,120,198,0.4)',
    svg: `<svg viewBox="0 0 24 24" fill="#3178C6" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M13 11h4v1.5h-1.2V17h-1.6v-4.5H13V11zM11.3 13.3c0-.3-.2-.5-.7-.5s-.8.2-.8.5c0 .3.2.5.9.7 1 .3 1.5.7 1.5 1.5 0 .9-.7 1.5-2 1.5-1.2 0-2-.5-2-1.5h1.4c0 .4.3.6.7.6.4 0 .7-.2.7-.5 0-.3-.2-.5-1-.8-.9-.3-1.4-.7-1.4-1.5 0-.9.7-1.4 2-1.4 1.1 0 1.8.5 1.8 1.4h-1.1z" fill="white"/></svg>`,
  },
  {
    name: 'Astro',
    r: 158, startAngle: Math.PI, speed: 30,
    color: '#FF5D01', bg: 'rgba(255,93,1,0.12)', border: 'rgba(255,93,1,0.4)',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#FF5D01" d="M16.074 16.86c-.72.616-2.157 1.035-3.812 1.035-2.032 0-3.735-.632-4.187-1.483-.161-.3-.198-.63-.198-.88v-.1c0-1.157.82-2.16 1.997-2.64-.08.22-.12.45-.12.69 0 1.245.976 2.06 2.31 2.06.556 0 1.075-.15 1.524-.41L16.074 16.86z"/><path fill="#FF5D01" d="M12.002 2c-.5 0-.94.07-1.33.2L5.12 9.28c.15-.1.31-.19.49-.26l4.63-1.8c.4-.16.83-.24 1.27-.24.43 0 .86.08 1.27.24l4.63 1.8c.18.07.34.16.49.26L12.002 2z"/><path fill="#FF5D01" d="M12.002 7.02c-.44 0-.87.08-1.27.24L6.1 9.06c-.18.07-.34.16-.49.26l5.81 9.09c.16.25.53.25.69 0l5.81-9.09c-.15-.1-.31-.19-.49-.26l-4.63-1.8c-.4-.16-.83-.24-1.27-.24z" opacity=".6"/></svg>`,
  },
  {
    name: 'Next.js',
    r: 158, startAngle: Math.PI * 1.5, speed: 30,
    color: '#ffffff', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.25)',
    svg: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.2 14.8l-4-5.6V16H5.6V8h1.4l3.8 5.3V8h1.2v8.8H10.8zm7.6 0h-1.2l-2.4-3.3-1 1.1V16.8H12.6V8h1.2v5.4l3.2-5.4H18.3l-2.8 4.7 2.9 4.1z"/></svg>`,
  },
  {
    name: 'Tailwind',
    r: 112, startAngle: Math.PI * 0.25, speed: 22,
    color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.38)',
    svg: `<svg viewBox="0 0 24 24" fill="#38BDF8" xmlns="http://www.w3.org/2000/svg"><path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.1 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C15.62 7.15 14.5 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.1 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C10.62 13.15 9.5 12 7 12z"/></svg>`,
  },
  {
    name: 'Node.js',
    r: 112, startAngle: Math.PI * 1.0, speed: 22,
    color: '#68A063', bg: 'rgba(104,160,99,0.12)', border: 'rgba(104,160,99,0.38)',
    svg: `<svg viewBox="0 0 24 24" fill="#68A063" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.09L3 7v10l9 4.91L21 17V7L12 2.09zm0 1.82l7 3.82v8.54l-7 3.82-7-3.82V7.73l7-3.82zm0 2.27L6.5 9v6l5.5 3 5.5-3V9L12 6.18zm0 1.82l4 2.18v4.64l-4 2.18-4-2.18V10.18l4-2.18z"/></svg>`,
  },
  {
    name: 'PostgreSQL',
    r: 112, startAngle: Math.PI * 1.75, speed: 22,
    color: '#4169E1', bg: 'rgba(65,105,225,0.12)', border: 'rgba(65,105,225,0.38)',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#4169E1" d="M17.128 0a10.134 10.134 0 00-2.755.403l-.063.02A10.922 10.922 0 0012.6.289C11.14.289 9.72.615 8.427 1.28a9.89 9.89 0 00-2.885 2.395 9.456 9.456 0 00-1.817 3.899 14.09 14.09 0 00-.199 3.47c.084 1.97.756 2.85 1.232 3.156 1.464.93 2.926.344 3.616-.047a4.543 4.543 0 01.26-.135.376.376 0 00.085-.056c.074-.066.072-.15.074-.314l.003-.342a8.88 8.88 0 01.041-.74 5.3 5.3 0 01.162-.918c.136-.46.362-.871.682-1.225A2.85 2.85 0 0112 10.5c1.48 0 2.584.988 2.584 2.25 0 1.24-.936 2.25-2.33 2.25-.68 0-1.24-.244-1.52-.634"/></svg>`,
  },
];

export default function TechOrbit() {
  return (
    <div className="relative flex-shrink-0" style={{ width: 340, height: 340 }} aria-hidden="true">
      {/* Orbit rings only — no center sphere */}
      <div className="absolute rounded-full pf-orbit-ring" style={{ width: 316, height: 316, left: 12, top: 12 }} />
      <div className="absolute rounded-full pf-orbit-ring" style={{ width: 224, height: 224, left: 58, top: 58 }} />

      {/* Tech logo badges */}
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
              width: 40, height: 40,
              borderRadius: 10,
              background: tech.bg,
              border: `1px solid ${tech.border}`,
              boxShadow: `0 4px 16px ${tech.bg}, 0 0 8px ${tech.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'translate(-50%, -50%)',
              backdropFilter: 'blur(8px)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
            dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">${tech.svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] || ''}</svg>` }}
          />
        </div>
      ))}

      <style>{`
        .pf-orbit-ring {
          border: 1px solid rgba(129,140,248,0.12);
        }
        :global(.light) .pf-orbit-ring {
          border-color: rgba(99,102,241,0.15);
        }
        .tech-orbit-badge { width: 0; height: 0; }
        .tech-orbit-badge > div:hover {
          transform: translate(-50%, -50%) scale(1.2) !important;
          box-shadow: 0 8px 24px rgba(129,140,248,0.3) !important;
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
