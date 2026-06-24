# CLAUDE.md — Electrogen Front

Guía operativa del proyecto. Leer antes de tocar código.
Fuentes de verdad complementarias:
- **API**: `API-FRONTEND.md` (contrato de endpoints — no inventar rutas).
- **UI**: `UI_UX_SPEC_GruposElectrogenos.md` (referencia de layout y secciones).

---

## 1. Qué es

Frontend del sistema de gestión de grupos electrógenos: landing pública +
portal de empleados (`/admin`) que consume una API REST Spring Boot.

---

## 2. Stack real

| Pieza      | Versión / detalle                                   |
| ---------- | --------------------------------------------------- |
| Framework  | **Astro 6** (`output: "server"`, adapter `@astrojs/node` standalone) |
| Islas      | **React 19** (`@astrojs/react`)                      |
| Estilos    | **Tailwind v4** vía `@tailwindcss/vite` (sin `tailwind.config`) |
| Node       | `>= 22.12.0`                                         |
| View Transitions | `experimental.viewTransitions: true`          |

No hay router de cliente: la navegación es por páginas Astro.
**`lucide-react` NO está instalado** — los íconos son SVG inline.

---

## 3. Decisiones vigentes (no re-litigar)

- **Tema visual: CLARO manda.** El código actual usa tema claro
  (`bg-white`, `text-blue-950`, naranja de acento). El `UI_UX_SPEC` describe un
  tema oscuro industrial: se usa **solo como referencia de estructura, secciones
  y mapeo de pantallas**, NO para su paleta ni sus design tokens. No migrar a
  oscuro salvo pedido explícito.
- **Auth: JWT en cookie `jwt_token`** (`max-age=3600`, `SameSite=Lax`, `path=/`).
  El middleware protege `/admin/*`.

---

## 4. Estructura

```
src/
  features/<feature>/        # vertical slice por dominio
    api/<feature>Api.ts       # llamadas fetch del feature
    components/*.tsx           # islas React
    types.ts                  # DTOs del feature
  pages/                      # rutas Astro (.astro)
    index.astro               # landing pública
    login.astro
    admin/                    # portal protegido por middleware
  layouts/                    # Layout.astro, IntranetLayout.astro
  components/
    astro/                    # componentes Astro estáticos
    react/                    # islas reutilizables
  lib/api/baseUrl.ts          # getApiBaseUrl()
  middleware.ts               # guard de /admin
  styles/global.css           # Tailwind + estilos globales
```

Features actuales: `auth`, `catalog`, `inventory`, `sales`, `admin`.

---

## 5. Convenciones (copiar el patrón existente)

### API client (`features/<x>/api/<x>Api.ts`)
- Construir URL con `new URL(path, getApiBaseUrl())` y `searchParams`.
- Headers de auth con `getAuthHeaders()` (lee la cookie `jwt_token`).
- En error: extraer mensaje con un helper tipo `getErrorMessage(res, fallback)`
  y `throw new Error(message)`. El componente captura y muestra.
- Reusar el patrón de `inventory/api/gruposElectrogenosApi.ts` como plantilla.

### Páginas que montan islas
- `export const prerender = false;` en el frontmatter (todas las de `/admin`).
- Importar la isla y montarla con la directiva adecuada:
  `client:visible` (contenido bajo el fold), `client:load` (interacción inmediata).

### Tipos
- DTOs en `types.ts` del feature. Enums como union types
  (ej. `type TipoCombustible = "NAFTA" | "GAS_NATURAL" | "GASOIL"`).
- Respuestas paginadas: `PaginatedResponseDTO<T>` (`content`, `page`, `size`,
  `totalElements`, `totalPages`).

### Estilos
- Tailwind utility-first. Acento naranja (`orange-500`), base `blue-950`.
- Sin clases inventadas fuera de Tailwind v4.

---

## 6. API — mapa rápido

Prefijo: `/api/v1`. Base configurable con `PUBLIC_API_BASE_URL`
(fallback `http://localhost:8082`). 🔓 público · 🔐 autenticado · 🔒 ADMIN.

| Método | Ruta | Acceso |
| ------ | ---- | ------ |
| POST   | `/auth/login` | 🔓 → `{ token }` |
| POST   | `/auth/register` | 🔓 (rol USER) |
| GET    | `/grupos-electrogenos` | 🔓 paginado |
| GET    | `/grupos-electrogenos/{id}` | 🔓 |
| GET    | `/grupos-electrogenos/{id}/precio` | 🔓 |
| GET    | `/grupos-electrogenos/filtro/combustible?tipo=` | 🔓 |
| GET    | `/grupos-electrogenos/filtro/moviles-automaticos?materialEje=` | 🔓 |
| POST   | `/grupos-electrogenos` | 🔒 |
| PUT    | `/grupos-electrogenos/{id}` | 🔒 |
| DELETE | `/grupos-electrogenos/{id}` | 🔒 |
| PATCH  | `/grupos-electrogenos/{id}/stock?nuevoStock=` | 🔒 |
| POST   | `/ventas` | 🔒 |
| GET    | `/ventas` | 🔐 paginado |
| GET    | `/ventas/{id}` | 🔐 |
| PUT    | `/ventas/{id}` | 🔒 |
| DELETE | `/ventas/{id}` | 🔒 |
| GET    | `/ventas/ranking-clientes` | 🔒 |
| GET    | `/ventas/reporte-pagos?tipo=EFECTIVO\|CHEQUE` | 🔒 |
| GET    | `/ventas/ingresos-totales` | 🔒 |

Códigos de error a manejar: `400` (validación), `401` (sin/mal token),
`403` (sin rol), `409` (conflicto — ej. stock insuficiente en venta).
Detalle de payloads en `API-FRONTEND.md`.

---

## 7. Roadmap de pantallas

Mapa spec (sección) → estado. "Hecho" = existe, no necesariamente pulido.

| Pantalla (spec §) | Página / feature | Estado |
| ----------------- | ---------------- | ------ |
| Login (§2) | `pages/login.astro` · `auth` | Hecho |
| Catálogo (§1.3 / admin) | `pages/admin/catalogo.astro` · `catalog` | Hecho |
| Grupos Electrógenos CRUD (§5) | `inventory` | Hecho |
| Ventas (§6) | `pages/admin/ventas/*` · `sales` | Hecho |
| Landing pública (§1) | `pages/index.astro` | Pendiente |
| Dashboard + KPIs (§4) | `pages/admin/index.astro` | Por revisar |
| Reportes: ranking (§7.1) | — | Pendiente |
| Reportes: por pago (§7.2) | — | Pendiente |
| Reportes: ingresos (§7.3) | — | Pendiente |

> Revisar el estado real antes de marcar algo como terminado.

---

## 8. Comandos

```bash
npm run dev      # astro dev
npm run build    # astro build
npm run preview  # astro preview
```

Backend esperado en `http://localhost:8082` (override con `PUBLIC_API_BASE_URL`).

---

## 9. Gotchas

- La API espera enums en MAYÚSCULA con guion bajo (`GAS_NATURAL`), no labels
  de UI ("Gas Natural"). Mapear en la capa de presentación.
- El token JWT vive solo en la cookie del navegador; las llamadas se hacen
  desde el cliente (islas React), no en el render SSR de Astro.
- Stock = 0 / ≤ 5 tienen tratamiento visual propio en tablas (ver §5.2 spec).
- Precios: formatear con `toLocaleString('es-PE', { style:'currency', currency:'PEN' })`.
