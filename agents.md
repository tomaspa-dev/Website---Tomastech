# agents.md — Tomastech 2026 / Negocio
> Sitio comercial + Panel Admin privado de Tomastech — Contexto para agentes de IA
>
> ⚠️ IMPORTANTE: Este proyecto tiene DOS partes:
> 1. **Landing pública** (`/`) — Portafolio y servicios para clientes potenciales
> 2. **Panel Admin privado** (`/panel-56Up89`) — Sistema de gestión solo para el dueño

## 📋 Project Overview

**Nombre:** Tomastech 2026 — Negocio  
**Descripción:** Sitio web comercial con panel de administración privado. Incluye:
- Landing pública: portafolio, servicios, contacto
- Admin Panel: sistema completo de cotizaciones, recibos, clientes, proyectos, contabilidad, PDFs  
**Tipo:** Astro (Landing) + React SPA (Admin Panel) + Netlify Functions (API)  
**Deploy:** Netlify (estático + Netlify Functions + NeonDB en producción)

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Astro | ^4.15 |
| UI Islas | React | ^19 |
| Styling | TailwindCSS | v3 |
| Animaciones | GSAP | ^3.13 |
| React Animations | Framer Motion | ^12 |
| 3D | Three.js + React Three Fiber | ^0.181 |
| Smooth Scroll | Lenis | ^1.3 |
| Fuentes | Space Grotesk, Inter, Outfit, Sora (fontsource) | — |
| Deploy | Netlify | — |

---

## 🏗️ Arquitectura y Estructura

```
src/
├── pages/                        ← Rutas Astro (file-based)
│   ├── index.astro               ← Landing principal (negocio/servicios)
│   ├── portfolio.astro           ← Portfolio de proyectos
│   ├── terms.astro               ← Términos y condiciones
│   └── [paginas].astro
├── components/
│   ├── landing/                  ← Secciones de la landing
│   │   ├── HeroLanding.astro     ← Hero principal
│   │   ├── ServicesTeaser.astro  ← Servicios ofrecidos
│   │   ├── JourneyLines.tsx      ← Animación journey (React)
│   │   ├── ServiceCardsFloatingObjects.tsx
│   │   ├── ContactForm.tsx       ← Formulario de contacto (React)
│   │   └── GeometricCore.tsx     ← Objeto 3D central
│   ├── sections/                 ← Secciones generales
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Process.astro
│   │   └── PortfolioGrid.tsx     ← Grid de proyectos (React)
│   ├── client/                   ← Componentes React pesados (3D, WebGL)
│   │   ├── DigitalIris.tsx
│   │   ├── InterstellarRing.tsx
│   │   ├── LiquidBackground.tsx
│   │   ├── LiquidChrome.tsx
│   │   ├── PortalRing.tsx
│   │   └── VaultVisual.tsx
│   ├── ui/                       ← Componentes UI reutilizables
│   │   ├── AnimatedGrid.tsx
│   │   ├── Grid3D.tsx
│   │   ├── GridHover.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectModal.tsx
│   │   ├── StatsCounter.tsx
│   │   ├── SubtleParallax.tsx
│   │   ├── TechSpinner.tsx
│   │   ├── AnimatedBackground.tsx
│   │   └── InteractiveBackground.tsx
│   ├── dashboard/                ← Componentes del portal cliente
│   │   └── DashboardLayout.tsx
│   └── common/                   ← Navbar, Footer
│       ├── Navbar.astro
│       └── Footer.astro
├── layouts/
│   └── Layout.astro              ← Layout con SEO, fuentes, scripts globales
├── data/                         ← Datos estáticos tipados
├── lib/                          ← Helpers y utilities
├── scripts/                      ← Scripts de animación
│   └── expertise-animations.ts
├── styles/                       ← CSS variables, global styles
└── assets/                       ← Imágenes, SVGs
```

---

## 📐 Convenciones de Código

### Cuándo usar `.astro` vs `.tsx`
- **`.astro`** → Secciones de página, layouts, navbar, footer. Sin estado.
- **`.tsx` con `client:visible`** → Portfolio grid, Contact Form, componentes interactivos
- **`.tsx` con `client:load`** → Solo Hero y elementos above-the-fold críticos
- **`.tsx` con `client:only="react"`** → Three.js, WebGL, componentes que usan `window`

### Componentes Astro
```astro
---
interface Props {
  title?: string
  className?: string
}
const { title = 'Default', className = '' } = Astro.props
---
<section class={`section-name ${className}`}>
  <h2>{title}</h2>
  <slot />
</section>
```

### Animaciones GSAP (patrón del proyecto)
```typescript
// En React → useGSAP SIEMPRE (no useEffect)
import { useGSAP } from '@gsap/react'
useGSAP(() => {
  gsap.from('.element', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' })
}, { scope: containerRef })

// En .astro → dentro de <script>
gsap.from('.hero-title', { y: 50, opacity: 0, duration: 1 })
```

### SEO (obligatorio)
```astro
<Layout title="Página | Tomastech" description="Descripción única de 150-160c">
```

---

## 🧪 Testing

| Tipo | Framework | Estado |
|---|---|---|
| Unit (utils) | Vitest | ❌ No configurado — agregar cuando sea necesario |
| Componentes | Testing Library | ❌ No configurado |
| E2E (form contacto) | Playwright | ❌ Opcional, bajo prioridad |

**Setup cuando se necesite:**
```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## 🔗 Skills Disponibles

> Ruta: `F:\Documentos\AAA GitHub Projects\AAA 2026 Agents\Generar-Arquitectura-Clean-IA\Base\Arquitectura de Software\skills-library\`

| Área | Skill |
|---|---|
| Páginas y componentes Astro | `astro/skill.md` |
| Animaciones GSAP | `gsap/skill.md` |
| Componentes React | `react-components/skill.md` |
| Commits y PRs | `commit/skill.md` |

---

## 📜 Convenciones de Commits

```
feat: agregar sección de testimonios con slider
fix: corregir animación de hero en mobile
perf: lazy load de componentes Three.js
style: ajustar spacing en sección de servicios
```

---

## ⚠️ Reglas Críticas

1. **`<Image>` de Astro** en todas las imágenes — nunca `<img>` sin optimización
2. **SEO obligatorio** en cada página: `title` único, `description` 150-160c, og:image
3. **Un solo `<h1>` por página**
4. **`client:visible`** por defecto — solo `client:load` si es above-the-fold crítico
5. **`client:only="react"`** para componentes con Three.js / `window` / `document`
6. **No mezclar** GSAP y Framer Motion en el mismo elemento
7. **Mobile first** en Tailwind: estilos base para mobile, breakpoints para larger
8. **Datos estáticos** van en `src/data/` — nunca hardcodeados en componentes
9. Los componentes de `client/` son pesados — usarlos con `client:visible` o `client:idle`
10. Lenis (smooth scroll) está configurado globalmente — no agregar otra librería de scroll

---

## 🌐 Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Preview del build
```

**Variables de entorno:**
- `PUBLIC_EMAIL` o similar — para el formulario de contacto
- Revisar `.env.example` para la lista completa
