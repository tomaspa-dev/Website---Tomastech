import React, { useState } from 'react';
import ProjectCard from '../ui/ProjectCard';
import ProjectModal from '../ui/ProjectModal';
import { projects, type Project } from '../../data/projects';

const categories = [
  'All',
  'Landing Pages',
  'Corporate Websites',
  'Web Applications',
  'WordPress Themes',
  'Extensions'
];

export default function PortfolioGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const handleOpenModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300); // Wait for animation
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div key={project.id} className="animate-in fade-in zoom-in duration-500">
            <ProjectCard project={project} onOpenModal={handleOpenModal} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No projects found in this category yet.</p>
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}
