import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Moon, Sun, ChevronRight, ChevronLeft, MousePointer2 } from 'lucide-react';

export default function SettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect live theme from DOM
  useEffect(() => {
    const detect = () => {
      const dark = !document.documentElement.classList.contains('light');
      setIsDark(dark);
    };
    detect();
    const obs = new MutationObserver(detect);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
    applyTheme(storedTheme);
    const storedPref = localStorage.getItem('customCursorEnabled');
    if (storedPref !== null) setCursorEnabled(storedPref === 'true');
  }, []);

  const scheduleAutoClose = useCallback(() => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(() => setIsOpen(false), 3000);
  }, []);

  const applyTheme = (t: string) => {
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    scheduleAutoClose();
    if (typeof (window as any).showToast === 'function') {
      (window as any).showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
    }
  };

  const toggleCursor = () => {
    const newState = !cursorEnabled;
    setCursorEnabled(newState);
    localStorage.setItem('customCursorEnabled', String(newState));
    window.dispatchEvent(new CustomEvent('cursor-settings-changed', { detail: { enabled: newState } }));
    scheduleAutoClose();
    if (typeof (window as any).showToast === 'function') {
      (window as any).showToast(`Custom cursor ${newState ? 'enabled' : 'disabled'}`, 'info');
    }
  };

  const handleOpen = () => {
    setIsOpen(o => !o);
    if (!isOpen) scheduleAutoClose();
    else if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
  };

  // Theme-derived colors
  const panelBg   = isDark ? 'rgba(10,10,26,0.96)'    : 'rgba(255,255,255,0.96)';
  const panelBdr  = isDark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.1)';
  const rowBg     = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const rowBdr    = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.06)';
  const labelClr  = isDark ? '#cbd5e1'                 : '#475569';
  const titleClr  = isDark ? '#ffffff'                 : '#0f172a';
  const btnBg     = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const btnBdr    = isDark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.1)';
  const chevClr   = isDark ? '#94a3b8'                 : '#64748b';

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: isOpen ? 'translate(0,-50%)' : 'translate(calc(100% - 36px),-50%)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Toggle tab */}
      <button
        onClick={handleOpen}
        aria-label="Toggle settings"
        style={{
          width: 36, height: 48,
          background: panelBg,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${panelBdr}`,
          borderRight: 'none',
          borderRadius: '12px 0 0 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: chevClr,
          cursor: 'pointer',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
          transition: 'background 0.2s',
        }}
      >
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Panel */}
      <div
        style={{
          background: panelBg,
          backdropFilter: 'blur(24px)',
          border: `1px solid ${panelBdr}`,
          borderRadius: '0 0 0 16px',
          padding: '14px 12px',
          width: 176,
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.12)',
        }}
      >
        <h3 style={{ color: titleClr, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10, fontFamily: 'Space Grotesk, sans-serif' }}>
          Settings
        </h3>

        {/* Theme row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px', borderRadius:10, background: rowBg, border:`1px solid ${rowBdr}`, marginBottom:8 }}>
          <span style={{ color: labelClr, fontSize: 12, display:'flex', alignItems:'center', gap: 8, fontWeight: 500 }}>
            <div style={{ position:'relative', width:16, height:16 }}>
              <Sun size={16} style={{ position:'absolute', inset:0, color:'#f59e0b', transition:'all 0.4s', opacity: theme==='dark'?0:1, transform: theme==='dark'?'rotate(90deg) scale(0.5)':'none' }} />
              <Moon size={16} style={{ position:'absolute', inset:0, color:'#818cf8', transition:'all 0.4s', opacity: theme==='dark'?1:0, transform: theme==='dark'?'none':'rotate(-90deg) scale(0.5)' }} />
            </div>
            Theme
          </span>
          <button onClick={toggleTheme} aria-label="Toggle theme" style={{ width:40, height:20, borderRadius:10, background: theme==='dark'?'#6366f1':'#f59e0b', border:'none', cursor:'pointer', position:'relative', transition:'background 0.4s', boxShadow: theme==='dark'?'0 0 12px rgba(99,102,241,0.5)':'0 0 12px rgba(245,158,11,0.4)' }}>
            <div style={{ position:'absolute', top:2, width:16, height:16, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.4s', left: theme==='dark'?22:2 }} />
          </button>
        </div>

        {/* Cursor row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px', borderRadius:10, background: rowBg, border:`1px solid ${rowBdr}` }}>
          <span style={{ color: labelClr, fontSize: 12, display:'flex', alignItems:'center', gap: 8, fontWeight: 500 }}>
            <MousePointer2 size={15} style={{ color:'#818cf8' }} />
            Cursor
          </span>
          <button onClick={toggleCursor} aria-label="Toggle cursor" style={{ width:40, height:20, borderRadius:10, background: cursorEnabled?'#6366f1':'rgba(100,116,139,0.4)', border:'none', cursor:'pointer', position:'relative', transition:'background 0.4s', boxShadow: cursorEnabled?'0 0 12px rgba(99,102,241,0.4)':'none' }}>
            <div style={{ position:'absolute', top:2, width:16, height:16, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.4s', left: cursorEnabled?22:2 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
