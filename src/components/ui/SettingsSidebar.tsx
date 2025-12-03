import React, { useState, useEffect } from 'react';
import { Moon, Sun, Languages, ChevronRight, ChevronLeft, MousePointer2 } from 'lucide-react';

export default function SettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');
  const [cursorEnabled, setCursorEnabled] = useState(true);

  useEffect(() => {
    const storedPref = localStorage.getItem('customCursorEnabled');
    if (storedPref !== null) {
      setCursorEnabled(storedPref === 'true');
    }
  }, []);

  const toggleCursor = () => {
    const newState = !cursorEnabled;
    setCursorEnabled(newState);
    localStorage.setItem('customCursorEnabled', String(newState));
    
    // Dispatch event for CustomCursor component
    const event = new CustomEvent('cursor-settings-changed', { 
      detail: { enabled: newState } 
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    // Check system preference or localStorage
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setTheme('dark');
    }
  };

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'es' : 'en';
    setLang(newLang);
    // Here you would implement actual language switching logic
    console.log('Language switched to:', newLang);
  };

  return (
    <div className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-12 bg-white/10 backdrop-blur-md border-l border-t border-b border-white/20 rounded-l-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-lg"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Panel */}
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-l-2xl shadow-2xl w-48 space-y-4">
        <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2 text-center">Settings</h3>
        
        {/* Theme Toggle */}
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          <span className="text-gray-300 text-sm flex items-center gap-3 font-medium">
            <div className="relative w-5 h-5">
              <Sun 
                size={20} 
                className={`absolute inset-0 text-yellow-400 transition-all duration-500 transform ${theme === 'dark' ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} 
              />
              <Moon 
                size={20} 
                className={`absolute inset-0 text-primary transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} 
              />
            </div>
            Theme
          </span>
          <button 
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full relative transition-colors duration-500 shadow-inner ${theme === 'dark' ? 'bg-primary/80' : 'bg-yellow-400/80'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          <span className="text-gray-300 text-sm flex items-center gap-3 font-medium">
            <Languages size={20} className="text-accent" />
            Lang
          </span>
          <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => { setLang('en'); console.log('Language switched to: en'); }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-300 ${lang === 'en' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              EN
            </button>
            <button 
              onClick={() => { setLang('es'); console.log('Language switched to: es'); }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-300 ${lang === 'es' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              ES
            </button>
          </div>
        </div>

        {/* Cursor Toggle */}
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          <span className="text-gray-300 text-sm flex items-center gap-3 font-medium">
            <MousePointer2 size={20} className="text-primary" />
            Cursor
          </span>
          <button 
            onClick={toggleCursor}
            className={`w-12 h-6 rounded-full relative transition-colors duration-500 shadow-inner ${cursorEnabled ? 'bg-primary/80' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${cursorEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

    </div>
  );
}
