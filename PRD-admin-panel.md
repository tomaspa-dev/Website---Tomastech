# PRD: Panel de Administración — Tomastech

**Proyecto:** Tomastech Negocio (ruta `/panel-56Up89`)
**Fecha:** 2026-04-15
**Tipo:** Admin panel privado — solo el dueño tiene acceso
**Estado actual:** Sistema funcionando en frontend-only con localStorage.
Necesita migración a persistencia real (NeonDB) y nuevas features.

---

## 🎯 Contexto y Problema

Ya existe un sistema completo de billing en `src/lib/billing-store.ts` que funciona
con **localStorage en desarrollo** y con **NeonDB via Netlify Functions en producción**
(`billing-api.ts` detecta el entorno con `shouldUseAPI()`).

El sistema ya tiene: clientes, cotizaciones, recibos, proyectos, servicios, contabilidad
(cuentas, asientos contables, caja), generación de PDF (jspdf), exportación Excel (exceljs).

### Problema actual:
El panel admin en `/panel-56Up89` parece incompleto o desconocido en su estado actual.
Necesitamos auditar qué está implementado en la UI del dashboard y qué falta conectar.

---

## ✅ Lo que YA EXISTE en el sistema (no re-implementar)

### Datos y lógica (`src/lib/`):
- `billing-store.ts` (41KB) — CRUD completo: clients, quotations, receipts, projects, services, accounts, journal, cashRegister, config
- `billing-pdf.ts` (16KB) — Generación de PDF con jspdf (cotizaciones y recibos)
- `billing-seed.ts` (16KB) — Datos de prueba
- `billing-api.ts` — Capa de API para Netlify Functions
- `security.ts` — Utilidades de seguridad

### Backend (`netlify/functions/`):
- `api.ts` (23KB) — Netlify Function principal con todos los endpoints
- `send-email.ts` (2KB) — Envío de emails con Resend
- `shared/` — Utilidades compartidas

### Frontend existente:
- `DashboardLayout.tsx` — Layout con tabs (Overview, Billing, Chat) con datos FICTICIOS hardcodeados
- `LoginForm.tsx` — Login UI premium (hardcodeada con DemoUser/mypassword)
- `/pages/dashboard.astro` — Página del dashboard
- `/pages/client-access.astro` — Página de login
- `/pages/panel-56Up89.astro` — Ruta oculta del panel

---

## 🎯 Lo que HAY QUE CONSTRUIR

### Prioridad 1 — Auth real
El login actual es un `setTimeout` con credenciales hardcodeadas.
- Implementar auth real (password hash en env vars es suficiente para usuario único)
- Guardar sesión en `sessionStorage` o cookie segura
- `panel-56Up89` verificar sesión, redirigir a `/client-access` si no hay sesión

### Prioridad 2 — Conectar DashboardLayout con datos reales
Actualmente `DashboardLayout.tsx` usa `DEMO_DATA` hardcodeado.
- Reemplazar mock data con llamadas a `billing-store` (clientStore, quotationStore, etc.)
- Las métricas del Overview deben calcularse de datos reales
- La tabla de Billing debe mostrar cotizaciones/recibos reales

### Prioridad 3 — Módulos del Admin Panel completos
El `DashboardLayout` actual tiene solo 3 tabs (Overview, Billing, Chat).
Necesita expandirse a todos los módulos del billing-store:

| Módulo | Tab/Sección | Estado Actual |
|---|---|---|
| Dashboard/Overview | Métricas reales | Mock hardcodeado |
| Clientes | Tab nuevo | No existe en UI |
| Cotizaciones | Tab nuevo | No existe en UI |
| Recibos/Comprobantes | Parte de Billing | Parcial |
| Proyectos | Tab nuevo | No existe en UI |
| Servicios | Tab nuevo | No existe en UI |
| Contabilidad | Tab nuevo | No existe en UI |
| Configuración | Tab nuevo | No existe en UI |

### Prioridad 4 — PDF real + envío
- El botón "Download PDF" en la tabla de facturas debe funcionar (llama a `billing-pdf.ts`)
- Envío por email via Resend (`send-email.ts` ya existe)
- Envío por WhatsApp via `generateWhatsAppLink()` (ya existe en billing-store)

---

## 📐 Arquitectura del Admin Panel (propuesta)

```
/panel-56Up89
  → Verifica sesión → si no hay sesión → redirect /client-access
  → Carga DashboardLayout con datos reales del billing-store
  
DashboardLayout.tsx
  Sidebar:
    - Dashboard (métricas generales)
    - Clientes
    - Proyectos
    - Cotizaciones ← CORE del negocio
    - Recibos/Comprobantes
    - Contabilidad / Caja
    - Servicios (catálogo)
    - Configuración (datos del emisor, series)
    - Logout
```

---

## ✅ Criterios de Aceptación

### Auth:
- [ ] Login con password real (env var `ADMIN_PASSWORD`)
- [ ] Sesión persiste mientras el tab está abierto
- [ ] Panel redirige a login si no hay sesión activa

### Dashboard Overview:
- [ ] Muestra: total de clientes activos, cotizaciones del mes, ingresos del mes, recibos pendientes
- [ ] Últimas 5 cotizaciones creadas con su estado
- [ ] Proyectos activos con progreso

### Módulo Cotizaciones:
- [ ] Listar todas las cotizaciones con filtros (estado, cliente, fecha)
- [ ] Crear nueva cotización con el cliente y servicios del catálogo
- [ ] Editar cotización existente
- [ ] Cambiar estado: draft → sent → accepted → paid → cancelled
- [ ] Generar PDF y descargarlo
- [ ] Enviar PDF por email (Resend) o link de WhatsApp
- [ ] Convertir cotización aceptada en recibo

### Módulo Clientes:
- [ ] Listar, crear, editar, desactivar clientes
- [ ] Ver proyectos y cotizaciones de un cliente

### Módulo Recibos:
- [ ] Listar recibos con filtros
- [ ] Generar PDF del recibo
- [ ] Marcar como enviado, anulado

### Módulo Contabilidad:
- [ ] Ver saldo de caja
- [ ] Ver movimientos de caja (ingresos/egresos)
- [ ] Registrar asiento manual

---

## 🔧 Consideraciones Técnicas

### Auth simple (usuario único):
```typescript
// En /client-access → verificar contra env var
const ADMIN_PASS = import.meta.env.ADMIN_PASSWORD
// Hash en Netlify env vars, no en código
// Sesión: sessionStorage.setItem('tt_admin_session', token)
```

### Detección de entorno (ya funciona):
```typescript
// billing-api.ts — shouldUseAPI() detecta si estamos en Netlify
// Dev: localStorage, Prod: NeonDB via Netlify Functions
```

### Componentes a crear:
- No crear componentes nuevos de UI para datos mock
- Conectar directamente los stores existentes
- Seguir el pattern de `billing-store.ts` (sync local / async API)

---

## 📝 Notas para la IA al Implementar

1. Los tipos TypeScript están en `billing-store.ts` — usar siempre esos tipos
2. El PDF se genera con `billing-pdf.ts` — no instalar librerías nuevas
3. El email usa `send-email.ts` (Netlify Function) via fetch POST
4. WhatsApp: `generateWhatsAppLink()` de billing-store, abrir en nueva pestaña
5. La ruta del panel es `/panel-56Up89` (ofuscada intencionalmente)
6. `jspdf` y `exceljs` ya están instalados y configurados en `astro.config.mjs`
7. Resend ya está configurado con `RESEND_API_KEY` en env vars de Netlify
