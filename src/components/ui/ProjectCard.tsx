import React from 'react';
import type { Project } from '../../data/projects';
import { ArrowUpRight, Eye } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpenModal: (project: Project) => void;
}

export default function ProjectCard({ project, onOpenModal }: ProjectCardProps) {
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

      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        {/* Shimmer loading placeholder */}
        <div className="absolute inset-0 shimmer-placeholder" />
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400/1a1a1a/6366f1?text=Project+Preview';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Hover Eye Icon with pulse */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 group-hover:animate-pulse-soft">
            <Eye className="text-white w-8 h-8" />
          </div>
        </div>
        
        {/* Category badge with colored accent */}
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {project.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] group-hover:text-primary transition-colors duration-300">
            {project.title}
          </h3>
          
          {/* Arrow Icon */}
          {project.link && project.link !== '#' ? (
            <a 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1 shrink-0 ml-3 z-30 arrow-btn"
              title="View Demo"
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

        {/* Tags with subtle gradient bg */}
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 hover:bg-primary/20 transition-colors duration-200">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-xs text-[var(--color-text-muted)] px-2 py-1">+{project.tags.length - 3}</span>
          )}
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
