import React from 'react';

interface TechSpinnerProps {
  type: 'design' | 'code' | 'performance' | 'deploy';
  color: string;
}

export default function TechSpinner({ type, color }: TechSpinnerProps) {
  // Define colors based on type/prop
  const colors = {
    design: '#ec4899', // pink
    code: '#a855f7',   // purple
    performance: '#3b82f6', // blue
    deploy: '#10b981', // green
  };

  const mainColor = color || colors[type];

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer Ring - Rotating Slow */}
      <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke={mainColor} strokeWidth="0.5" strokeOpacity="0.3" />
        <path d="M50 2 A48 48 0 0 1 98 50" fill="none" stroke={mainColor} strokeWidth="1" strokeLinecap="round" />
        <path d="M50 98 A48 48 0 0 1 2 50" fill="none" stroke={mainColor} strokeWidth="1" strokeLinecap="round" />
      </svg>

      {/* Middle Ring - Rotating Fast Reverse */}
      <svg className="absolute inset-0 w-full h-full animate-[spin_5s_linear_infinite_reverse] scale-75" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke={mainColor} strokeWidth="0.5" strokeOpacity="0.5" strokeDasharray="4 4" />
      </svg>

      {/* Inner Ring - Pulsing */}
      <svg className="absolute inset-0 w-full h-full animate-pulse scale-50" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke={mainColor} strokeWidth="2" strokeOpacity="0.8" />
      </svg>

      {/* Center Icon Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          {/* Icons will be passed as children or handled here */}
          {type === 'design' && (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          )}
          {type === 'code' && (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          )}
          {type === 'performance' && (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {type === 'deploy' && (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
