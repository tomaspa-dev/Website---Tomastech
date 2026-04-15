import React, { useEffect, useState } from 'react';
import type { Project } from '../../data/projects';
import { X, ChevronDown, ChevronUp, Calendar, Layers, Zap, Trophy, ExternalLink } from 'lucide-react';

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      setIsContentVisible(true);
      // Trigger entrance animation
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
    }
    
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-end justify-center md:items-center p-0 md:p-4 md:pt-24 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop — slightly adapted */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`modal-container relative w-full h-[calc(100vh-6rem)] md:h-[85vh] md:max-w-6xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col group mt-24 md:mt-0 transition-all duration-500 ${isAnimating ? 'translate-y-0 scale-100' : 'translate-y-8 scale-[0.97]'}`}>
        
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080/1a1a1a/6366f1?text=Project+Detail';
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500 ${isContentVisible ? 'opacity-80' : 'opacity-30'}`} />
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-50 pointer-events-none">
          <span className={`px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
            {project.category}
          </span>

          <button 
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rotate-90 shadow-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Floating Content Card Container */}
        <div 
          className={`absolute bottom-0 left-0 right-0 md:left-8 md:right-8 md:bottom-8 z-30 transition-transform duration-500 ease-in-out flex flex-col items-center ${isContentVisible ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'}`}
        >
           {/* Toggle Button */}
           <button
            onClick={() => setIsContentVisible(!isContentVisible)}
            className="mb-[-1px] pointer-events-auto w-12 h-8 rounded-t-xl modal-toggle-btn backdrop-blur-xl border-t border-x modal-border flex items-center justify-center modal-text hover:opacity-80 transition-colors z-40"
          >
            {isContentVisible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>

          {/* Content Card — theme-aware */}
          <div className="w-full modal-content-card backdrop-blur-xl border-t md:border modal-border md:rounded-2xl p-6 md:p-8 max-h-[60vh] overflow-y-auto modal-scrollbar shadow-2xl">
            
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold modal-heading mb-3 leading-tight">{project.title}</h2>
                  <p className="text-base md:text-lg modal-body font-light leading-relaxed border-l-4 border-primary pl-4">
                    {project.details.concept}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold modal-label uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Zap size={14} className="text-primary" /> Key Features
                    </h3>
                    <ul className="space-y-2">
                      {project.details.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 modal-body text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {project.details.metrics && (
                    <div>
                      <h3 className="text-xs font-bold modal-label uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Trophy size={14} className="text-accent" /> Results
                      </h3>
                      <div className="space-y-2">
                        {project.details.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center gap-2 modal-heading text-sm font-medium modal-metric-bg p-2 rounded-lg modal-metric-border">
                            <span className="text-accent">★</span>
                            {metric}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6 lg:border-l modal-divider lg:pl-8">
                
                <div>
                  <h3 className="text-[10px] font-bold modal-label uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Layers size={12} /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.details.stack.map((tech) => (
                      <span key={tech} className="px-2.5 py-1 modal-tag modal-tag-border rounded-full text-[10px] md:text-xs modal-tag-text transition-colors cursor-default">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold modal-label uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Calendar size={12} /> Timeline
                  </h3>
                  <p className="modal-heading text-sm font-medium">{project.details.time}</p>
                </div>

                {project.link && project.link !== '#' && (
                  <a 
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] mt-2"
                  >
                    Visit Project <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      <style>{`
        /* ── Dark mode (default) ──────────────────────── */
        .modal-container        { background: #0a0a0a; }
        .modal-content-card     { background: rgba(0,0,0,0.6); }
        .modal-toggle-btn       { background: rgba(0,0,0,0.55); }
        .modal-border           { border-color: rgba(255,255,255,0.1); }
        .modal-divider          { border-color: rgba(255,255,255,0.1); }
        .modal-heading          { color: #ffffff; }
        .modal-body             { color: #d1d5db; }
        .modal-label            { color: #9ca3af; }
        .modal-text             { color: #ffffff; }
        .modal-tag              { background: rgba(255,255,255,0.08); }
        .modal-tag              { background: rgba(255,255,255,0.08); }
        .modal-tag:hover        { background: rgba(255,255,255,0.16); }
        .modal-tag-border       { border: 1px solid rgba(255,255,255,0.12); }
        .modal-tag-text         { color: #e5e7eb; }
        .modal-metric-bg        { background: rgba(255,255,255,0.05); }
        .modal-metric-border    { border: 1px solid rgba(255,255,255,0.06); }

        /* ── Light mode overrides ──────────────────────── */
        html.light .modal-container     { background: #ffffff; }
        html.light .modal-content-card  { background: rgba(255,255,255,0.88); }
        html.light .modal-toggle-btn    { background: rgba(255,255,255,0.75); }
        html.light .modal-border        { border-color: rgba(0,0,0,0.1); }
        html.light .modal-divider       { border-color: rgba(0,0,0,0.1); }
        html.light .modal-heading       { color: #0f172a; }
        html.light .modal-body          { color: #374151; }
        html.light .modal-label         { color: #6b7280; }
        html.light .modal-text          { color: #0f172a; }
        html.light .modal-tag           { background: rgba(0,0,0,0.05); }
        html.light .modal-tag:hover     { background: rgba(0,0,0,0.09); }
        html.light .modal-tag-border    { border: 1px solid rgba(0,0,0,0.1); }
        html.light .modal-tag-text      { color: #1f2937; }
        html.light .modal-metric-bg     { background: rgba(0,0,0,0.04); }
        html.light .modal-metric-border { border: 1px solid rgba(0,0,0,0.07); }

        /* Scrollbar */
        .modal-scrollbar::-webkit-scrollbar       { width: 6px; }
        .modal-scrollbar::-webkit-scrollbar-track  { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .modal-scrollbar::-webkit-scrollbar-thumb  { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        html.light .modal-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.04); }
        html.light .modal-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); }
      `}</style>
    </div>
  );
}
