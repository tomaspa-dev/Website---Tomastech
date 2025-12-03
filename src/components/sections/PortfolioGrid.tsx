import React, { useState, useEffect, useRef } from 'react';
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
  const gridRef = useRef<HTMLDivElement>(null);

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

  // GSAP Animations for Grid Items
  useEffect(() => {
    if (!gridRef.current || typeof window === 'undefined') return;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          const items = gsap.utils.toArray('.project-item-wrapper');
          
          items.forEach((item: any) => {
            // Reveal animation: Circle to Rectangle clip-path
            gsap.fromTo(item, 
              { 
                clipPath: 'circle(0% at 50% 50%)',
                opacity: 0
              },
              {
                clipPath: 'circle(150% at 50% 50%)',
                opacity: 1,
                duration: 1.5,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: item,
                  start: 'top 85%',
                  end: 'top 50%',
                  toggleActions: 'play none none reverse'
                }
              }
            );

            // Hover particles effect
            const particles = item.querySelectorAll('.hover-particle');
            const card = item.querySelector('.project-card-inner');
            
            if (card) {
              card.addEventListener('mouseenter', () => {
                gsap.to(particles, {
                  x: 'random(-100, 100)',
                  y: 'random(-100, 100)',
                  opacity: 1,
                  scale: 'random(0.5, 1.5)',
                  duration: 0.8,
                  ease: 'power2.out',
                  stagger: 0.02
                });
              });

              card.addEventListener('mouseleave', () => {
                gsap.to(particles, {
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0,
                  duration: 0.5,
                  ease: 'power2.in'
                });
              });
            }
          });
        }, gridRef);

        return () => ctx.revert();
      });
    });
  }, [filteredProjects]); // Re-run when projects change

  return (
    <div className="w-full" ref={gridRef}>
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
          <div key={project.id} className="project-item-wrapper relative">
            {/* Hover Particles */}
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="hover-particle absolute w-2 h-2 rounded-full bg-primary/50 opacity-0"
                  style={{ transform: 'scale(0)' }}
                />
              ))}
            </div>
            
            <div className="project-card-inner relative z-10">
              <ProjectCard project={project} onOpenModal={handleOpenModal} />
            </div>
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
