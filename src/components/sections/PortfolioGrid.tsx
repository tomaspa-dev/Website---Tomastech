import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [filterKey, setFilterKey] = useState(0); // bumped on each filter change
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const handleOpenModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
    document.body.style.overflow = 'unset';
  };

  // ─── Smooth staggered fade-in on mount + after filter ──────────────────────
  const animateIn = useCallback(() => {
    if (!gridRef.current) return;
    const items = gridRef.current.querySelectorAll<HTMLElement>('.project-item-wrapper');
    items.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'none';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }, []);

  // Run on mount
  useEffect(() => {
    animateIn();
  }, []);

  // Run after filter changes (filterKey bump signals render is done)
  useEffect(() => {
    if (filterKey === 0) return;
    animateIn();
  }, [filterKey, animateIn]);

  // ─── Hover particles via GSAP (only once on mount) ─────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('gsap').then(({ gsap }) => {
      const cards = document.querySelectorAll('.project-card-inner');
      cards.forEach(card => {
        const particles = card.closest('.project-item-wrapper')?.querySelectorAll('.hover-particle') ?? [];
        card.addEventListener('mouseenter', () => {
          gsap.to(particles, { x: 'random(-80,80)', y: 'random(-80,80)', opacity: 1, scale: 'random(0.5,1.5)', duration: 0.8, ease: 'power2.out', stagger: 0.02 });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(particles, { x: 0, y: 0, opacity: 0, scale: 0, duration: 0.5, ease: 'power2.in' });
        });
      });
    });
  }, []);

  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) return;
    // Fade out current cards first
    if (gridRef.current) {
      const items = gridRef.current.querySelectorAll<HTMLElement>('.project-item-wrapper');
      items.forEach(el => {
        el.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
      });
    }
    // After fade-out, change category and trigger fade-in
    setTimeout(() => {
      setSelectedCategory(cat);
      setFilterKey(k => k + 1);
    }, 180);
  };

  return (
    <div className="w-full" ref={gridRef}>
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-item-wrapper relative" style={{ opacity: 0 }}>
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

      {filteredProjects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[var(--color-text-muted)] text-lg">No projects found in this category yet.</p>
        </div>
      )}

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
