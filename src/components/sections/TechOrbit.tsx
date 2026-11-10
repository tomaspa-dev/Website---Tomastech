import React from 'react';

// Inline SVGs — official mark versions of core engineering technologies
// All use circular containers (border-radius: 50%)
const TECHS = [
  // --- Outer Orbit (r: 150) ---
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
    name: 'PostgreSQL',
    r: 150, startAngle: Math.PI * 1.1, speed: 32,
    color: '#336791', bg: 'rgba(51,103,145,0.18)', border: 'rgba(51,103,145,0.48)',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#336791"/>
      <path d="M12 4.5c-3.5 0-5.5 2.1-5.5 4.8 0 1.8.9 3.2 2.3 4v3.2c0 .6.4 1 1 1h4.4c.6 0 1-.4 1-1v-3.2c1.4-.8 2.3-2.2 2.3-4 0-2.7-2-4.8-5.5-4.8zm-1.8 8.2v-1.9c-.8-.2-1.4-.8-1.4-1.6 0-1 .9-1.8 2-1.8.6 0 1.1.2 1.5.6l.8-.8c-.6-.6-1.4-.9-2.3-.9-1.7 0-3.1 1.2-3.1 2.8 0 1.2.8 2.2 2 2.5v1.9c.9.2 1.6.8 1.6 1.7 0 1-.9 1.8-2.1 1.8-.7 0-1.3-.3-1.8-.8l-.8.8c.7.7 1.6 1.1 2.6 1.1 1.8 0 3.2-1.3 3.2-3 0-1.3-.9-2.3-2.3-2.7z" fill="white"/>
    </svg>`,
  },
  {
    name: 'Docker',
    r: 150, startAngle: Math.PI * 1.65, speed: 32,
    color: '#2496ED', bg: 'rgba(36,150,237,0.18)', border: 'rgba(36,150,237,0.48)',
    svg: `<svg viewBox="0 0 24 24" fill="#2496ED" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8" width="3" height="3" rx="0.5" fill="#2496ED"/>
      <rect x="6" y="8" width="3" height="3" rx="0.5" fill="#2496ED"/>
      <rect x="10" y="8" width="3" height="3" rx="0.5" fill="#2496ED"/>
      <rect x="6" y="4.5" width="3" height="3" rx="0.5" fill="#2496ED"/>
      <rect x="10" y="4.5" width="3" height="3" rx="0.5" fill="#2496ED"/>
      <rect x="14" y="8" width="3" height="3" rx="0.5" fill="#2496ED"/>
      <path d="M22 11c-.4-.3-1.2-.4-1.8-.2-.3-.5-.8-.8-1.4-.8-.1 0-.3 0-.4.1-.4-1.3-1.5-2.1-2.9-2.1v4H1c0 3.9 3.1 7 7 7 4.2 0 7.8-2.6 9.3-6.4.5-.1 1.4-.4 1.8-1.3.6.1 1.4-.1 1.9-.3.3-.1.7-.5 1-1z" fill="#2496ED"/>
    </svg>`,
  },

  // --- Inner Orbit (r: 105) ---
  {
    name: 'Python',
    r: 105, startAngle: Math.PI * 0.2, speed: 24,
    color: '#3776AB', bg: 'rgba(55,118,171,0.18)', border: 'rgba(55,118,171,0.45)',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#3776AB" d="M11.9 2C8 2 8.3 3.7 8.3 3.7l.01 1.9h3.8v.6H4.4S1.9 5.8 1.9 9.8c0 4 2.2 3.9 2.2 3.9h1.3v-1.8s-.1-2.2 2.2-2.2h3.7v-.6H7.5s-2.1 0-2.1-2.1c0-2.1 1.9-2.1 1.9-2.1h5.6s1.8 0 1.8-1.7C16.9 2.6 15 2 11.9 2zm-2 1.2a.6.6 0 1 1 0 1.2.6.6 0 0 1 0-1.2z"/>
      <path fill="#FFD43B" d="M12.1 22c3.9 0 3.6-1.7 3.6-1.7l-.01-1.9H11.9v-.6h7.7s2.5.4 2.5-3.6c0-4-2.2-3.9-2.2-3.9h-1.3v1.8s.1 2.2-2.2 2.2h-3.7v.6h3.8s2.1 0 2.1 2.1c0 2.1-1.9 2.1-1.9 2.1H9.2s-1.8 0-1.8 1.7c0 1.8 1.9 2.4 5 2.4zm2-1.2a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z"/>
    </svg>`,
  },
  {
    name: 'Node.js',
    r: 105, startAngle: Math.PI * 0.87, speed: 24,
    color: '#68A063', bg: 'rgba(104,160,99,0.15)', border: 'rgba(104,160,99,0.45)',
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#68A063" d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.18L19.82 8.5 12 12.82 4.18 8.5 12 4.18zM3.5 9.72l8 4.4v7.71L3.5 17.4V9.72zm9.5 12.11v-7.71l8-4.4v7.69l-8 4.42z"/>
    </svg>`,
  },
  {
    name: 'Next.js',
    r: 105, startAngle: Math.PI * 1.54, speed: 24,
    color: '#ffffff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.28)',
    svg: `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 14H9V9h2v7Zm5.62 0-4.12-5.79V16h-2V8h1.88l4.12 5.79V8h2v8h-1.88Z"/>
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
      {TECHS.map((tech) => (
        <div
          key={tech.name}
          className="tech-planet absolute rounded-full flex items-center justify-center pointer-events-auto"
          title={tech.name}
          data-r={tech.r}
          data-angle={tech.startAngle}
          data-speed={tech.speed}
          style={{
            width: 44,
            height: 44,
            backgroundColor: tech.bg,
            border: `1.5px solid ${tech.border}`,
            boxShadow: `0 0 14px ${tech.border}`,
            left: 170 - 22,
            top: 170 - 22,
            transform: `translate(${Math.cos(tech.startAngle) * tech.r}px, ${Math.sin(tech.startAngle) * tech.r}px)`,
          }}
        >
          <span
            className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5"
            dangerouslySetInnerHTML={{ __html: tech.svg }}
          />
        </div>
      ))}
    </div>
  );
}
