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
  'Extensions',
];

// Attach a one-shot IntersectionObserver to a card so it fades in when visible
function revealOnScroll(el: HTMLElement, delay: number) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'none';

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        setTimeout(() => {
          target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }, delay);
        io.unobserve(target);
      });
    },
    { threshold: 0.08 }
  );
  io.observe(el);
}

export default function PortfolioGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  // ── Modal handlers ─────────────────────────────────────────────────────────
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

  // ── Attach observers after each render (mount + after category change) ─────
  const attachObservers = useCallback(() => {
    if (!gridRef.current) return;
    const items = gridRef.current.querySelectorAll<HTMLElement>('.project-item-wrapper');
    items.forEach((el, i) => revealOnScroll(el, i * 55));
  }, []);

  // On mount
  useEffect(() => {
    attachObservers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // After category change — wait one frame for React to paint the new cards
  useEffect(() => {
    const raf = requestAnimationFrame(() => attachObservers());
    return () => cancelAnimationFrame(raf);
  }, [selectedCategory, attachObservers]);

  // ── Hover particles (GSAP, lazy) ───────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('gsap').then(({ gsap }) => {
      if (!gridRef.current) return;
      gridRef.current.querySelectorAll('.project-card-inner').forEach((card) => {
        const particles = card
          .closest('.project-item-wrapper')
          ?.querySelectorAll('.hover-particle') ?? [];
        card.addEventListener('mouseenter', () => {
          gsap.to(particles, {
            x: 'random(-80,80)', y: 'random(-80,80)',
            opacity: 1, scale: 'random(0.5,1.5)',
            duration: 0.8, ease: 'power2.out', stagger: 0.02,
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(particles, { x: 0, y: 0, opacity: 0, scale: 0, duration: 0.5, ease: 'power2.in' });
        });
      });
    });
  }, [selectedCategory]); // re-bind when cards change

  // ── Category filter with fade-out transition ───────────────────────────────
  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) return;

    // Fade current cards out first
    if (gridRef.current) {
      gridRef.current.querySelectorAll<HTMLElement>('.project-item-wrapper').forEach((el) => {
        el.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
      });
    }

    // Swap category after fade-out completes
    setTimeout(() => setSelectedCategory(cat), 165);
  };

  return (
    <div className="w-full" ref={gridRef}>
      {/* ── Filter tabs ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, index) => (
          <div
            key={project.id}
            className="project-item-wrapper relative"
            style={{ opacity: 0 }} // start invisible; observer will reveal
          >
            {/* Hover particles */}
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
              <ProjectCard project={project} onOpenModal={handleOpenModal} index={index} />
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[var(--color-text-muted)] text-lg">
            No projects found in this category yet.
          </p>
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
