import React, { useEffect, useState } from 'react';
import type { Project } from '../../data/projects';
import { 
  X, ChevronDown, ChevronUp, Calendar, Layers, Zap, Trophy, 
  ExternalLink, Cpu, CheckCircle2, Sparkles, Clock, ShieldCheck, 
  GitBranch, BookOpen, AlertTriangle, Scale 
} from 'lucide-react';

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<'invariants' | 'decisions' | 'roadmap' | 'scope'>('invariants');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      // Stop Lenis so it never hijacks modal wheel scroll
      (window as any).__lenis?.stop();
      setIsContentVisible(true);
      setActiveTab(project.details.coreInvariants ? 'invariants' : 'scope');
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
      (window as any).__lenis?.start();
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
      (window as any).__lenis?.start();
    };
  }, [isOpen, onClose, project]);

  if (!isOpen) return null;

  const isDesignLearning = project.status === 'Selected / Design & Learning';
  const isPlanned = project.status === 'Selected / Planned';
  const isCapstone = project.status === 'Future Capstone / Defined Scope';
  const isArchitectureProject = isDesignLearning || isPlanned || isCapstone;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end justify-center md:items-center p-0 md:p-4 md:pt-24 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      data-lenis-prevent="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        data-lenis-prevent="true"
      />

      {/* Modal Main Container */}
      <div 
        className={`modal-container relative w-full h-[calc(100vh-5rem)] md:h-[86vh] md:max-w-6xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col group mt-20 md:mt-0 transition-all duration-500 ${isAnimating ? 'translate-y-0 scale-100' : 'translate-y-8 scale-[0.97]'}`}
        data-lenis-prevent="true"
      >
        
        {/* Full Background (Image or Technical Blueprint) */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
          {project.image ? (
            <>
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080/1a1a1a/6366f1?text=Project+Detail';
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500 ${isContentVisible ? 'opacity-85' : 'opacity-30'}`} />
            </>
          ) : (
            /* Sleek Dark Blueprint Mesh for Systems Architecture Projects */
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#818cf8_1px,transparent_1px),linear-gradient(to_bottom,#818cf8_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="absolute inset-0 bg-radial-gradient from-indigo-500/20 via-transparent to-black/80" />
              <div className="text-center p-8 opacity-25 select-none pointer-events-none">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-2xl">
                  {project.id === 'api-usage-guard' ? <ShieldCheck size={40} /> : <Cpu size={40} />}
                </div>
                <h3 className="text-lg font-mono tracking-widest uppercase text-indigo-300">
                  {project.workName || 'Backend Architecture & Domain Model'}
                </h3>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-500 ${isContentVisible ? 'opacity-90' : 'opacity-40'}`} />
            </div>
          )}
        </div>

        {/* Top Controls — Always on Top */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2.5 flex-wrap">
            <span className={`px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md border border-white/15 rounded-full text-white shadow-lg transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
              {project.category}
            </span>
            {isDesignLearning && (
              <span className={`px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-purple-500/25 backdrop-blur-md border border-purple-400/40 rounded-full text-purple-200 shadow-lg flex items-center gap-1.5 transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                DESIGN &amp; LEARNING
              </span>
            )}
            {isPlanned && (
              <span className={`px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-cyan-500/25 backdrop-blur-md border border-cyan-400/40 rounded-full text-cyan-300 shadow-lg flex items-center gap-1.5 transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                PLANNED SEQUENCE
              </span>
            )}
            {isCapstone && (
              <span className={`px-3 py-1 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-amber-500/25 backdrop-blur-md border border-amber-400/40 rounded-full text-amber-300 shadow-lg flex items-center gap-1.5 transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                FUTURE CAPSTONE
              </span>
            )}
          </div>

          <button 
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rotate-90 shadow-2xl cursor-pointer"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Floating Bottom Card Container */}
        <div 
          className={`absolute bottom-0 left-0 right-0 md:left-8 md:right-8 md:bottom-8 z-30 transition-transform duration-500 ease-in-out flex flex-col items-center ${isContentVisible ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'}`}
        >
          {/* Toggle Minimize/Maximize Button */}
          <button
            onClick={() => setIsContentVisible(!isContentVisible)}
            className="mb-[-1px] pointer-events-auto w-12 h-8 rounded-t-xl modal-toggle-btn backdrop-blur-xl border-t border-x modal-border flex items-center justify-center modal-text hover:opacity-80 transition-colors z-40 cursor-pointer shadow-lg"
            aria-label="Toggle content visibility"
          >
            {isContentVisible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>

          {/* Content Card with Smooth Native Scroll */}
          <div 
            className="w-full modal-content-card backdrop-blur-xl border-t md:border modal-border md:rounded-2xl p-6 md:p-8 max-h-[62vh] md:max-h-[66vh] overflow-y-auto modal-scrollbar shadow-2xl"
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
          >
            
            {/* Architecture Project Announcement Banner */}
            {isArchitectureProject && (
              <div className={`mb-6 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-start gap-3 shadow-sm ${
                isDesignLearning 
                  ? 'bg-purple-500/10 border border-purple-500/25' 
                  : isPlanned 
                    ? 'bg-cyan-500/10 border border-cyan-500/25' 
                    : 'bg-amber-500/10 border border-amber-500/25'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isDesignLearning 
                    ? 'bg-purple-500/20 text-purple-300' 
                    : isPlanned 
                      ? 'bg-cyan-500/20 text-cyan-300' 
                      : 'bg-amber-500/20 text-amber-300'
                }`}>
                  <Sparkles size={16} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm font-bold font-heading ${
                      isDesignLearning ? 'text-purple-300' : isPlanned ? 'text-cyan-300' : 'text-amber-300'
                    }`}>
                      {isDesignLearning 
                        ? 'Architecture & System Design' 
                        : isPlanned 
                          ? 'Planned System Sequence' 
                          : 'Capstone ERP Architecture'}
                    </h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-white/5 border-white/10 text-slate-300">
                      {isDesignLearning 
                        ? 'Selected · Design & Learning' 
                        : isPlanned 
                          ? 'Planned · Follows Project 01' 
                          : 'Future Capstone · Scope to Validate'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {project.details.caseStudyNote || "This case study documents the problem, domain invariants, architectural trade-offs, and verification test suite as the system is constructed in public."}
                  </p>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  {project.workName && (
                    <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold block mb-1">
                      {project.workName}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold modal-heading mb-3 leading-tight">
                    {project.title}
                  </h2>
                  <p className="text-base md:text-lg modal-body font-light leading-relaxed border-l-4 border-primary pl-4">
                    {project.details.concept}
                  </p>
                </div>

                {/* Architecture Project: Segmented Tabs */}
                {isArchitectureProject ? (
                  <div className="space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-black/30 border modal-border rounded-xl w-fit">
                      {project.details.coreInvariants && (
                        <button
                          onClick={() => setActiveTab('invariants')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'invariants'
                              ? 'bg-primary text-white shadow-md'
                              : 'modal-label hover:modal-heading'
                          }`}
                        >
                          <ShieldCheck size={14} />
                          <span>Core Invariants</span>
                        </button>
                      )}

                      {project.details.architecturalDecisions && (
                        <button
                          onClick={() => setActiveTab('decisions')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'decisions'
                              ? 'bg-primary text-white shadow-md'
                              : 'modal-label hover:modal-heading'
                          }`}
                        >
                          <Scale size={14} />
                          <span>Decisions &amp; ADRs</span>
                        </button>
                      )}

                      {project.details.learningMilestones && (
                        <button
                          onClick={() => setActiveTab('roadmap')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'roadmap'
                              ? 'bg-primary text-white shadow-md'
                              : 'modal-label hover:modal-heading'
                          }`}
                        >
                          <BookOpen size={14} />
                          <span>Learning Roadmap</span>
                        </button>
                      )}

                      {project.details.scope && (
                        <button
                          onClick={() => setActiveTab('scope')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'scope'
                              ? 'bg-primary text-white shadow-md'
                              : 'modal-label hover:modal-heading'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                          <span>Scope &amp; Modules</span>
                        </button>
                      )}
                    </div>

                    {/* Tab 1: Core Invariants */}
                    {activeTab === 'invariants' && project.details.coreInvariants && (
                      <div className="p-4 rounded-xl bg-black/20 border modal-border space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b modal-divider">
                          <h3 className="text-xs font-bold uppercase tracking-wider modal-label flex items-center gap-2">
                            <ShieldCheck size={14} className="text-primary" /> DOMAIN RULES &amp; ENGINEERING INVARIANTS
                          </h3>
                          <span className="text-[10px] modal-label font-mono">Target Rules</span>
                        </div>
                        {project.details.domainContext && (
                          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 italic">
                            "{project.details.domainContext}"
                          </p>
                        )}
                        <ul className="space-y-2.5">
                          {project.details.coreInvariants.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs modal-heading leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tab 2: Architectural Decisions (ADRs) */}
                    {activeTab === 'decisions' && project.details.architecturalDecisions && (
                      <div className="p-4 rounded-xl bg-black/20 border modal-border space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b modal-divider">
                          <h3 className="text-xs font-bold uppercase tracking-wider modal-label flex items-center gap-2">
                            <Scale size={14} className="text-indigo-400" /> ARCHITECTURAL DECISIONS &amp; TRADE-OFFS
                          </h3>
                          <span className="text-[10px] modal-label font-mono">{project.details.architecturalDecisions.length} ADRs</span>
                        </div>
                        <div className="space-y-3">
                          {project.details.architecturalDecisions.map((adr, idx) => (
                            <div key={idx} className="p-3.5 rounded-lg bg-white/5 border border-white/5 space-y-1.5 text-xs">
                              <div className="font-bold modal-heading flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-indigo-400 font-mono text-[10px]">ADR-0{idx + 1}</span>
                                  <span>{adr.question}</span>
                                </div>
                                {adr.status && (
                                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${
                                    adr.status === 'Accepted'
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : adr.status === 'Proposed'
                                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  }`}>
                                    {adr.status}
                                  </span>
                                )}
                              </div>
                              <div className="text-emerald-300/90 font-medium pl-6">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 mr-1.5">Decision:</span>
                                {adr.decision}
                              </div>
                              <div className="text-[var(--color-text-secondary)] pl-6 text-[11px] leading-relaxed">
                                <span className="text-[10px] uppercase tracking-wider text-slate-400 mr-1.5">Trade-off &amp; Rationale:</span>
                                {adr.tradeOff}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Learning Roadmap */}
                    {activeTab === 'roadmap' && project.details.learningMilestones && (
                      <div className="p-4 rounded-xl bg-black/20 border modal-border space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b modal-divider">
                          <h3 className="text-xs font-bold uppercase tracking-wider modal-label flex items-center gap-2">
                            <BookOpen size={14} className="text-primary" /> SEQUENCED MILESTONES &amp; VERIFICATION
                          </h3>
                          <span className="text-[10px] modal-label font-mono">Progressive</span>
                        </div>
                        <ul className="space-y-2">
                          {project.details.learningMilestones.map((ms, idx) => (
                            <li key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs modal-heading">
                              <span className="w-5 h-5 rounded-md bg-primary/20 text-primary text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span>{ms.replace(/^\d+\.\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tab 4: Scope */}
                    {activeTab === 'scope' && project.details.scope && (
                      <div className="p-4 rounded-xl bg-black/20 border modal-border space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b modal-divider">
                          <h3 className="text-xs font-bold uppercase tracking-wider modal-label flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-primary" /> SYSTEM MODULES &amp; FUNCTIONAL SCOPE
                          </h3>
                          <span className="text-[10px] modal-label font-mono">{project.details.scope.length} Modules</span>
                        </div>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {project.details.scope.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-xs modal-heading font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard 2-Column Features & Results Layout for Delivered Sites */
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-bold modal-label uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Zap size={14} className="text-primary" /> Key Features
                      </h3>
                      <ul className="space-y-2">
                        {project.details.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 modal-body text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {project.details.metrics && (
                      <div>
                        <h3 className="text-xs font-bold modal-label uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Trophy size={14} className="text-accent" /> Results &amp; Performance
                        </h3>
                        <div className="space-y-2">
                          {project.details.metrics.map((metric, idx) => (
                            <div key={idx} className="flex items-center gap-2 modal-heading text-sm font-medium modal-metric-bg p-2 rounded-lg modal-metric-border">
                              <span className="text-accent">★</span>
                              <span>{metric}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6 lg:border-l modal-divider lg:pl-8">
                
                <div>
                  <h3 className="text-[10px] font-bold modal-label uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Layers size={12} /> {isArchitectureProject ? 'Candidate Stack & Domain Focus' : 'Tech Stack'}
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
                    <Calendar size={12} /> Current Phase
                  </h3>
                  <p className="modal-heading text-sm font-medium">
                    {project.details.currentStatus || project.details.time}
                  </p>
                </div>

                {isArchitectureProject ? (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-1.5">
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <GitBranch size={14} /> REPOSITORY &amp; VERIFICATION
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Source code repository and reproducible test suites will be linked once published and verified.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border modal-border text-[11px] text-slate-400 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                      <span>Domain modeling, contract safety, and automated test coverage.</span>
                    </div>
                  </div>
                ) : project.link && project.link !== '#' ? (
                  <a 
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] mt-2"
                  >
                    Visit Live Site <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </a>
                ) : null}
              </div>

            </div>
          </div>
        </div>

      </div>

      <style>{`
        /* ── Dark mode (default) ──────────────────────── */
        .modal-container        { background: #0a0a0a; }
        .modal-content-card     { background: rgba(0,0,0,0.65); }
        .modal-toggle-btn       { background: rgba(0,0,0,0.6); }
        .modal-border           { border-color: rgba(255,255,255,0.1); }
        .modal-divider          { border-color: rgba(255,255,255,0.1); }
        .modal-heading          { color: #ffffff; }
        .modal-body             { color: #d1d5db; }
        .modal-label            { color: #9ca3af; }
        .modal-text             { color: #ffffff; }
        .modal-tag              { background: rgba(255,255,255,0.08); }
        .modal-tag:hover        { background: rgba(255,255,255,0.16); }
        .modal-tag-border       { border: 1px solid rgba(255,255,255,0.12); }
        .modal-tag-text         { color: #e5e7eb; }
        .modal-metric-bg        { background: rgba(255,255,255,0.05); }
        .modal-metric-border    { border: 1px solid rgba(255,255,255,0.06); }

        /* ── Light mode overrides ──────────────────────── */
        html.light .modal-container     { background: #ffffff; }
        html.light .modal-content-card  { background: rgba(255,255,255,0.92); }
        html.light .modal-toggle-btn    { background: rgba(255,255,255,0.85); }
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
        .modal-scrollbar::-webkit-scrollbar-thumb  { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
        html.light .modal-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.04); }
        html.light .modal-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
