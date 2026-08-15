# Estrategia de Internacionalización (i18n) — Tomastech

Este documento registra la arquitectura, decisiones y roadmap para la futura implementación de soporte multi-idioma (Inglés + Español) en `tomastech.dev`.

---

## 🎯 1. Filosofía y Objetivos

* **Idioma Principal:** **English** (en la raíz `/` y `/portfolio`). Orientado a USA, Canadá, UK, Australia, Nueva Zelanda y mercado internacional.
* **Idioma Secundario:** **Español** (en `/es/` y `/es/portfolio`). Orientado a Perú, Colombia, México, Chile, Argentina y clientes corporativos de habla hispana.
* **Sin colisiones ni duplicidad:** Cada versión ataca un cluster de keywords y una intención de búsqueda distinta adaptada a su mercado.

---

## 🏗️ 2. Arquitectura de URLs

```text
tomastech.dev
│
├── /                               → Home (English - Commercial / Global)
├── /portfolio/                     → Portfolio (English - Technical Authority)
│
└── /es/
    ├── /                           → Home (Español - Negocios / LATAM)
    └── /portfolio/                 → Portfolio (Español - Perfil Profesional)
```

---

## 🔍 3. Estrategia de SEO y Hreflang

* **No redirigir automáticamente por IP ni navegador:** Google recomienda enlaces explícitos y selector manual (`EN | ES`).
* **Etiquetas Hreflang cruzadas en `BaseLayout.astro`:**
  * Versión EN: `<link rel="alternate" hreflang="en" href="https://tomastech.dev/..." />`
  * Versión ES: `<link rel="alternate" hreflang="es" href="https://tomastech.dev/es/..." />`
  * Default: `<link rel="alternate" hreflang="x-default" href="https://tomastech.dev/..." />`
* **Sitemap Canónico:** `sitemap.xml` contendrá las versiones de ambos idiomas sin hashes (`#`).

---

## 📝 4. Keyword Mapping por Idioma

| Concepto | Inglés (`/` & `/portfolio`) | Español (`/es/` & `/es/portfolio`) |
|---|---|---|
| **Comercial** | Custom Web Applications, Business Software, Custom Software Development | Desarrollo de aplicaciones web, Software empresarial, Desarrollo de software a medida |
| **Sistemas** | ERP Development, Logistics Platform, Business Automation, API Integrations | Desarrollo de ERP, Software de logística, Automatización de procesos, Integraciones API |
| **Ingeniería** | Software Engineer, Software Architecture, Distributed Systems, Cloud & Security | Ingeniero de Software, Arquitectura de Software, Sistemas Distribuidos, Cloud y Seguridad |

---

## 🚀 5. Roadmap de Implementación (Fase 2)

1. [ ] **Configuración en `astro.config.mjs`:**
   ```javascript
   i18n: {
     defaultLocale: 'en',
     locales: ['en', 'es'],
     routing: { prefixDefaultLocale: false }
   }
   ```
2. [ ] **Creación del diccionario de UI (`src/i18n/`):**
   * Textos comunes (navegación, botones CTA, formularios, toasts).
3. [ ] **Selector de idioma en Navbar (`EN | ES`):**
   * Botón estilizado en `Navbar.astro` y `MobileMenu.tsx` con navegación a la ruta hermana.
4. [ ] **Páginas localizadas en Español:**
   * `src/pages/es/index.astro`
   * `src/pages/es/portfolio.astro`
5. [ ] **Actualización de Schema.org y OpenGraph por idioma.**
