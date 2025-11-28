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
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 flex flex-col h-full cursor-pointer"
      onClick={() => onOpenModal(project)}
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gray-800 animate-pulse" /> {/* Placeholder bg */}
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400/1a1a1a/6366f1?text=Project+Preview';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Hover Eye Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <Eye className="text-white w-8 h-8" />
          </div>
        </div>
        
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 text-xs font-medium bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white">
            {project.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
            {project.title}
          </h3>
          
          {/* Arrow Icon */}
          {/* Arrow Icon - Links to Demo */}
          {project.link && project.link !== '#' ? (
            <a 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1 z-30"
              title="View Demo"
            >
              <ArrowUpRight size={20} />
            </a>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1">
              <ArrowUpRight size={20} />
            </div>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-primary-300 bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">+{project.tags.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
}
