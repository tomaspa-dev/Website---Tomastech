import React, { useState, useEffect } from 'react';
import { Moon, Sun, ChevronRight, ChevronLeft, MousePointer2 } from 'lucide-react';

export default function SettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [cursorEnabled, setCursorEnabled] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
    applyTheme(storedTheme);

    const storedPref = localStorage.getItem('customCursorEnabled');
    if (storedPref !== null) {
      setCursorEnabled(storedPref === 'true');
    }
  }, []);

  const applyTheme = (newTheme: string) => {
    if (newTheme === 'light') {
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
    
    // Toast notification
    if (typeof (window as any).showToast === 'function') {
      (window as any).showToast(
        `Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} mode`,
        'info'
      );
    }
  };

  const toggleCursor = () => {
    const newState = !cursorEnabled;
    setCursorEnabled(newState);
    localStorage.setItem('customCursorEnabled', String(newState));
    
    const event = new CustomEvent('cursor-settings-changed', { 
      detail: { enabled: newState } 
    });
    window.dispatchEvent(event);

    // Toast notification
    if (typeof (window as any).showToast === 'function') {
      (window as any).showToast(
        `Custom cursor ${newState ? 'enabled' : 'disabled'}`,
        'info'
      );
    }
  };

  return (
    <div className={`fixed right-0 top-1/2 -translate-y-1/2 z-[9998] flex items-center transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-36px)]'}`}>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-11 bg-white/5 backdrop-blur-md border-l border-t border-b border-white/10 rounded-l-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors shadow-lg"
        aria-label="Toggle settings"
      >
        {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className="bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 p-3.5 rounded-l-2xl shadow-2xl w-44 space-y-2.5">
        <h3 className="text-white text-[10px] font-bold uppercase tracking-widest mb-2 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Settings
        </h3>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
          <span className="text-gray-300 text-xs flex items-center gap-2.5 font-medium">
            <div className="relative w-4 h-4">
              <Sun 
                size={16} 
                className={`absolute inset-0 text-amber-400 transition-all duration-500 transform ${theme === 'dark' ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} 
              />
              <Moon 
                size={16} 
                className={`absolute inset-0 text-indigo-400 transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} 
              />
            </div>
            Theme
          </span>
          <button 
            onClick={toggleTheme}
            className={`w-10 h-5 rounded-full relative transition-colors duration-500 shadow-inner ${theme === 'dark' ? 'bg-indigo-500/80' : 'bg-amber-400/80'}`}
            aria-label="Toggle theme"
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-500 ${theme === 'dark' ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Cursor Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
          <span className="text-gray-300 text-xs flex items-center gap-2.5 font-medium">
            <MousePointer2 size={16} className="text-indigo-400" />
            Cursor
          </span>
          <button 
            onClick={toggleCursor}
            className={`w-10 h-5 rounded-full relative transition-colors duration-500 shadow-inner ${cursorEnabled ? 'bg-indigo-500/80' : 'bg-zinc-600'}`}
            aria-label="Toggle cursor"
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-500 ${cursorEnabled ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
