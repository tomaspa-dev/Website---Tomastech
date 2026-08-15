import React from 'react';
import type { Project } from '../../data/projects';
import { ArrowUpRight, Eye } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpenModal: (project: Project) => void;
  index?: number;
}

export default function ProjectCard({ project, onOpenModal, index = 0 }: ProjectCardProps) {
  return (
    <div 
      className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 flex flex-col h-full cursor-pointer project-card-hover"
      onClick={() => onOpenModal(project)}
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.3), rgba(236,72,153,0.2), transparent)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor' as any,
          maskComposite: 'exclude' as any,
          padding: '1.5px',
        }}
      />

      {/* Editorial project number — appears on hover */}
      <span
        className="absolute bottom-0 right-4 text-[5rem] font-black leading-none tracking-[-0.04em] pointer-events-none select-none opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 z-10"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Image / Architecture Blueprint Container */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-center">
        {project.image ? (
          <>
            <div className="absolute inset-0 shimmer-placeholder" />
            <img 
              src={project.image} 
              alt={project.title} 
              width={600}
              height={338}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400/1a1a1a/6366f1?text=Project+Preview';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          </>
        ) : (
          /* Sleek Architecture Blueprint Placeholder for in-development projects */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Grid blueprint lines */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#818cf8_1px,transparent_1px),linear-gradient(to_bottom,#818cf8_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-radial-gradient from-indigo-500/15 via-transparent to-black/60" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-[0_0_25px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform duration-500">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6.01" y2="6"></line>
                  <line x1="6" y1="18" x2="6.01" y2="18"></line>
                </svg>
              </div>
              <span className="text-xs font-mono tracking-widest text-indigo-300/80 uppercase font-semibold">
                Architecture &amp; Domain Model
              </span>
            </div>
          </div>
        )}
        
        {/* Hover Eye Icon with pulse */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <Eye size={16} className="text-primary" />
            <span>View Case Study</span>
          </div>
        </div>
        
        {/* Category & Status Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {project.category}
          </span>
          {project.status === 'In Development' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 backdrop-blur-md border border-amber-400/30 rounded-full text-amber-300 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              IN DEVELOPMENT
            </span>
          )}
          {project.status === 'Planned' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 rounded-full text-cyan-300 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              PLANNED
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] group-hover:text-primary transition-colors duration-300">
            {project.title}
          </h3>
          
          {/* Action Icon / Badge */}
          {project.status === 'In Development' || project.status === 'Planned' ? (
            <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary text-xs font-semibold tracking-wide transition-all duration-300 transform group-hover:-translate-y-0.5 shrink-0 ml-3 flex items-center gap-1.5 shadow-sm">
              <span>View Case Study</span>
              <ArrowUpRight size={14} />
            </div>
          ) : project.link && project.link !== '#' ? (
            <a 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1 shrink-0 ml-3 z-30 arrow-btn"
              title="Visit Project"
            >
              <ArrowUpRight size={20} />
            </a>
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1 shrink-0 ml-3 arrow-btn">
              <ArrowUpRight size={20} />
            </div>
          )}
        </div>

        <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2 flex-grow">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 hover:bg-primary/20 transition-colors duration-200">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-700 ease-out" />

      <style>{`
        .shimmer-placeholder {
          background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-hover) 50%, var(--color-surface) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .project-card-hover {
          transition: all 0.5s cubic-bezier(0.25, 0.4, 0.25, 1);
        }
        .project-card-hover:hover {
          transform: translateY(-4px);
        }
        .arrow-btn {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes pulse-soft {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
        }
        .group:hover .animate-pulse-soft {
          animation: pulse-soft 2s infinite;
        }
      `}</style>
    </div>
  );
}
