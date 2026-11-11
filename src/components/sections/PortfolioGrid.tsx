import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProjectCard from '../ui/ProjectCard';
import ProjectModal from '../ui/ProjectModal';
import { getLocalizedProjects, type Project } from '../../data/projects';
import type { Lang } from '../../i18n/ui';

interface PortfolioGridProps {
  lang?: Lang;
}

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

export default function PortfolioGrid({ lang = 'en' }: PortfolioGridProps) {
  const isEs = lang === 'es';
  const categories = [
    { id: 'all', label: isEs ? 'Todos' : 'All' },
    { id: 'Systems & Backend', label: isEs ? 'Sistemas y Backend' : 'Systems & Backend' },
    { id: 'Corporate Websites', label: isEs ? 'Sitios Corporativos' : 'Corporate Websites' },
    { id: 'Landing Pages', label: 'Landing Pages' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const projects = getLocalizedProjects(lang);
  const filteredProjects =
    selectedCategory === 'all'
      ? projects.filter((p) => !p.hidden)
      : projects.filter((p) => p.category === selectedCategory && !p.hidden);

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
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === cat.id
                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Category Explainer Note (when Systems & Backend is selected) ─── */}
      {selectedCategory === 'Systems & Backend' && (
        <div className="max-w-2xl mx-auto mb-10 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-center">
          <p className="text-xs text-indigo-700 dark:text-indigo-300 font-mono uppercase tracking-wider font-bold mb-1">
            {isEs ? 'Casos de Estudio · Arquitectura de Software & Sistemas' : "Case Studies · Software Architecture & Systems Design"}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {isEs 
              ? 'Casos de estudio que documentan arquitectura de software, modelado de dominio, reglas de concurrencia y decisiones técnicas (ADRs).'
              : 'Case studies detailing domain invariants, concurrency boundaries, and architectural trade-offs (ADRs) as each system evolves.'}
          </p>
        </div>
      )}

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
              <ProjectCard project={project} onOpenModal={handleOpenModal} index={index} lang={lang} />
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[var(--color-text-muted)] text-lg">
            {isEs ? 'No se encontraron proyectos en esta categoría aún.' : 'No projects found in this category yet.'}
          </p>
        </div>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          lang={lang}
        />
      )}
    </div>
  );
}
