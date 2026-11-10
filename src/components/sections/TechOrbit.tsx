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
    color: '#336791', bg: 'rgba(51,103,145,0.22)', border: 'rgba(51,103,145,0.55)',
    svg: `<svg viewBox="0 0 128 128" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path fill="#336791" d="M115.731 77.44c-13.925 2.873-14.882-1.842-14.882-1.842 14.703-21.816 20.849-49.51 15.545-56.287C101.924.823 76.875 9.566 76.457 9.793l-.135.024c-2.751-.571-5.83-.911-9.291-.967-6.301-.103-11.08 1.652-14.707 4.402 0 0-44.684-18.408-42.606 23.151.442 8.842 12.672 66.899 27.26 49.363 5.332-6.412 10.483-11.834 10.483-11.834 2.559 1.699 5.622 2.567 8.833 2.255l.25-.212c-.078.796-.042 1.575.1 2.497-3.758 4.199-2.654 4.936-10.167 6.482-7.602 1.566-3.136 4.355-.22 5.084 3.534.884 11.712 2.136 17.237-5.598l-.221.882c1.473 1.18 2.507 7.672 2.334 13.557-.174 5.885-.29 9.926.871 13.082 1.16 3.156 2.316 10.256 12.192 8.14 8.252-1.768 12.528-6.351 13.124-13.995.422-5.435 1.377-4.631 1.438-9.49l.767-2.3c.884-7.367.14-9.743 5.225-8.638l1.235.108c3.742.17 8.639-.602 11.514-1.938 6.19-2.871 9.861-7.667 3.758-6.408z"/>
      <path fill="#ffffff" d="M75.957 122.307c-8.232 0-10.84-6.519-11.907-9.185-1.562-3.907-1.899-19.069-1.551-31.503a1.59 1.59 0 011.64-1.55 1.594 1.594 0 011.55 1.639c-.401 14.341.168 27.337 1.324 30.229 1.804 4.509 4.54 8.453 12.275 6.796 7.343-1.575 10.093-4.359 11.318-11.46.94-5.449 2.799-20.951 3.028-24.01a1.593 1.593 0 011.71-1.472 1.597 1.597 0 011.472 1.71c-.239 3.185-2.089 18.657-3.065 24.315-1.446 8.387-5.185 12.191-13.794 14.037-1.463.313-2.792.453-4 .454zM31.321 90.466a6.71 6.71 0 01-2.116-.35c-5.347-1.784-10.44-10.492-15.138-25.885-3.576-11.717-5.842-23.947-6.041-27.922-.589-11.784 2.445-20.121 9.02-24.778 13.007-9.216 34.888-.44 35.813-.062a1.596 1.596 0 01-1.207 2.955c-.211-.086-21.193-8.492-32.768-.285-5.622 3.986-8.203 11.392-7.672 22.011.167 3.349 2.284 15.285 5.906 27.149 4.194 13.742 8.967 22.413 13.096 23.79.648.216 2.62.873 5.439-2.517A245.272 245.272 0 0145.88 73.046a1.596 1.596 0 012.304 2.208c-.048.05-4.847 5.067-10.077 11.359-2.477 2.979-4.851 3.853-6.786 3.853zm69.429-13.445a1.596 1.596 0 01-1.322-2.487c14.863-22.055 20.08-48.704 15.612-54.414-5.624-7.186-13.565-10.939-23.604-11.156-7.433-.16-13.341 1.738-14.307 2.069l-.243.099c-.971.305-1.716-.227-1.997-.849a1.6 1.6 0 01.631-2.025c.046-.027.192-.089.429-.176l-.021.006.021-.007c1.641-.601 7.639-2.4 15.068-2.315 11.108.118 20.284 4.401 26.534 12.388 2.957 3.779 2.964 12.485.019 23.887-3.002 11.625-8.651 24.118-15.497 34.277-.306.457-.81.703-1.323.703z"/>
    </svg>`,
  },
  {
    name: 'Docker',
    r: 150, startAngle: Math.PI * 1.65, speed: 32,
    color: '#2496ED', bg: 'rgba(36,150,237,0.18)', border: 'rgba(36,150,237,0.48)',
    svg: `<svg viewBox="0 0 24 24" fill="#2496ED" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.186v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"/>
    </svg>`,
  },

  // --- Inner Orbit (r: 105) ---
  {
    name: 'Python',
    r: 105, startAngle: Math.PI * 0.2, speed: 24,
    color: '#3776AB', bg: 'rgba(55,118,171,0.2)', border: 'rgba(55,118,171,0.5)',
    svg: `<svg viewBox="0 0 128 128" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path fill="#3776AB" d="M63.391 12.248c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V77.494c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V26.093c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 19.817c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z"/>
      <path fill="#FFD43B" d="M91.682 38.64v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 98.187c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z"/>
    </svg>`,
  },
  {
    name: 'Node.js',
    r: 105, startAngle: Math.PI * 0.87, speed: 24,
    color: '#68A063', bg: 'rgba(104,160,99,0.15)', border: 'rgba(104,160,99,0.45)',
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path fill="#68A063" d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.18L19.82 8.5 12 12.82 4.18 8.5 12 4.18zM3.5 9.72l8 4.4v7.71L3.5 17.4V9.72zm9.5 12.11v-7.71l8-4.4v7.69l-8 4.42z"/>
    </svg>`,
  },
  {
    name: 'Next.js',
    r: 105, startAngle: Math.PI * 1.54, speed: 24,
    color: '#ffffff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.28)',
    svg: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z"/>
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

      {/* Tech logo planets — rotating around center */}
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
              width: 44, height: 44,
              borderRadius: '50%',
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
        .tech-orbit-badge svg {
          width: 100%;
          height: 100%;
          display: block;
        }
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
