import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  disabled = false
}: SearchableSelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedOption = options.find(o => o.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When a value is selected externally, clear search
  useEffect(() => {
    if (value && selectedOption) {
      setSearch('');
    }
  }, [value]);

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.sublabel?.toLowerCase().includes(search.toLowerCase())
  );

  const showDropdown = isFocused && (search.length > 0 || !value);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setSearch('');
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={isFocused ? search : (selectedOption ? selectedOption.label : search)}
          onChange={(e) => {
            setSearch(e.target.value);
            if (value && e.target.value !== selectedOption?.label) {
              // User is typing something new, don't clear selection yet
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            if (selectedOption) {
              setSearch(''); // Clear to show all options
            }
          }}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          disabled={disabled}
          className={`w-full bg-white/5 border rounded-xl py-2.5 pl-9 pr-9 text-sm text-white placeholder-gray-500 focus:outline-none transition-all ${
            isFocused
              ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
              : value
                ? 'border-emerald-500/30'
                : 'border-white/10 hover:border-white/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {value && !isFocused && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors z-10"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selected sublabel hint */}
      {value && selectedOption?.sublabel && !isFocused && (
        <div className="mt-0.5 px-1 text-[10px] text-gray-500 truncate">
          {selectedOption.sublabel}
        </div>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[70] w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">
                  {search ? `No se encontró "${search}"` : 'Sin opciones disponibles'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-emerald-500/10 transition-colors flex flex-col ${
                      value === option.id ? 'bg-emerald-500/5 text-emerald-400' : 'text-gray-300'
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.sublabel && <span className="text-[10px] opacity-50">{option.sublabel}</span>}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
