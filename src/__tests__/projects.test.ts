import { describe, it, expect } from 'vitest';
import { projects, type Project } from '../data/projects';

const VALID_CATEGORIES: Project['category'][] = [
  'Landing Pages',
  'Corporate Websites',
  'Web Applications',
  'WordPress Themes',
  'Extensions',
];

// ─── DATA INTEGRITY ────────────────────────────────────────────────────────────

describe('projects data', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
  });

  it('all project IDs are unique', () => {
    const ids = projects.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all project IDs are non-empty strings', () => {
    projects.forEach((p) => {
      expect(typeof p.id).toBe('string');
      expect(p.id.trim().length).toBeGreaterThan(0);
    });
  });

  it('all projects have a non-empty title', () => {
    projects.forEach((p) => {
      expect(typeof p.title).toBe('string');
      expect(p.title.trim().length).toBeGreaterThan(0);
    });
  });

  it('all projects belong to a valid category', () => {
    projects.forEach((p) => {
      expect(VALID_CATEGORIES).toContain(p.category);
    });
  });

  it('all projects have a non-empty description', () => {
    projects.forEach((p) => {
      expect(typeof p.description).toBe('string');
      expect(p.description.trim().length).toBeGreaterThan(0);
    });
  });

  it('all projects have an image path', () => {
    projects.forEach((p) => {
      expect(typeof p.image).toBe('string');
      expect(p.image.trim().length).toBeGreaterThan(0);
    });
  });

  it('all image paths start with /img/', () => {
    projects.forEach((p) => {
      expect(p.image).toMatch(/^\/img\//);
    });
  });

  it('all projects have at least one tag', () => {
    projects.forEach((p) => {
      expect(Array.isArray(p.tags)).toBe(true);
      expect(p.tags.length).toBeGreaterThan(0);
    });
  });
});

// ─── DETAILS SHAPE ─────────────────────────────────────────────────────────────

describe('project details', () => {
  it('all projects have a details object', () => {
    projects.forEach((p) => {
      expect(p.details).toBeDefined();
      expect(typeof p.details).toBe('object');
    });
  });

  it('all details have a non-empty concept string', () => {
    projects.forEach((p) => {
      expect(typeof p.details.concept).toBe('string');
      expect(p.details.concept.trim().length).toBeGreaterThan(0);
    });
  });

  it('all details have at least one feature', () => {
    projects.forEach((p) => {
      expect(Array.isArray(p.details.features)).toBe(true);
      expect(p.details.features.length).toBeGreaterThan(0);
    });
  });

  it('all details have at least one stack technology', () => {
    projects.forEach((p) => {
      expect(Array.isArray(p.details.stack)).toBe(true);
      expect(p.details.stack.length).toBeGreaterThan(0);
    });
  });

  it('all details have a time estimate string', () => {
    projects.forEach((p) => {
      expect(typeof p.details.time).toBe('string');
      expect(p.details.time.trim().length).toBeGreaterThan(0);
    });
  });
});

// ─── CATEGORY DISTRIBUTION ─────────────────────────────────────────────────────

describe('category coverage', () => {
  it('has Landing Pages projects', () => {
    const lps = projects.filter((p) => p.category === 'Landing Pages');
    expect(lps.length).toBeGreaterThan(0);
  });

  it('has Corporate Websites projects', () => {
    const cws = projects.filter((p) => p.category === 'Corporate Websites');
    expect(cws.length).toBeGreaterThan(0);
  });

  it('has Web Applications projects', () => {
    const apps = projects.filter((p) => p.category === 'Web Applications');
    expect(apps.length).toBeGreaterThan(0);
  });
});

// ─── INDIVIDUAL PROJECT SPOTCHECKS ─────────────────────────────────────────────

describe('SummerWave project', () => {
  const p = projects.find((x) => x.id === 'summerwave')!;

  it('exists', () => expect(p).toBeDefined());
  it('is a Landing Page', () => expect(p?.category).toBe('Landing Pages'));
  it('has a live link', () => {
    expect(p?.link).toBeTruthy();
    expect(p?.link).toContain('netlify.app');
  });
  it('includes GSAP in stack', () => {
    expect(p?.details.stack).toContain('GSAP');
  });
});
