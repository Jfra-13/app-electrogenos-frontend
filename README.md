# Electrogen Front

Frontend del sistema de gestión de **grupos electrógenos**: una landing pública
de catálogo + un portal de empleados (`/admin`) que consume una API REST
Spring Boot.

Construido con **Astro 6** (SSR sobre Node) e **islas de React 19**, con
**Tailwind v4** y tema visual claro.

---

## Tabla de contenido

1. [Descripción general](#1-descripción-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Rutas y pantallas](#5-rutas-y-pantallas)
6. [Autenticación y autorización](#6-autenticación-y-autorización)
7. [Capa de datos / contrato de API](#7-capa-de-datos--contrato-de-api)
8. [Sistema de UI](#8-sistema-de-ui)
9. [Estados transversales (carga / vacío / error)](#9-estados-transversales)
10. [Accesibilidad, responsive y movimiento](#10-accesibilidad-responsive-y-movimiento)
11. [Convenciones de código](#11-convenciones-de-código)
12. [Puesta en marcha](#12-puesta-en-marcha)
13. [Variables de entorno](#13-variables-de-entorno)
14. [Decisiones de diseño vigentes](#14-decisiones-de-diseño-vigentes)
15. [Gotchas](#15-gotchas)
16. [Estado del proyecto](#16-estado-del-proyecto)

---

## 1. Descripción general

El sistema cubre dos caras:

- **Pública** (`/`): landing comercial con hero, catálogo de grupos electrógenos
  filtrable y paginado, sección de features, CTA y footer. No requiere login.
- **Privada** (`/admin/*`): portal interno protegido por middleware. Incluye
  dashboard con KPIs, ABM de grupos electrógenos, registro/historial de ventas,
  gestión de empleados y cuatro reportes (ranking de clientes, ranking por
  empleado, reporte por tipo de pago, ingresos totales).

El portal distingue **dos perfiles**: el **ADMIN** ("jefe") accede a todo, y el
**EMPLEADO** (vendedor) solo registra ventas y ve las suyas. La navegación, las
acciones y las rutas se adaptan al rol del JWT.

El frontend no contiene lógica de negocio crítica: orquesta llamadas a la API
REST y presenta los datos. La autorización real (roles) la resuelve el backend;
el front solo aplica *gating* visual y de ruta (UX, nunca seguridad).

---

## 2. Stack tecnológico

| Pieza               | Versión / detalle                                                      |
| ------------------- | ---------------------------------------------------------------------- |
| Framework           | **Astro 6.3** (`output: "server"`, adapter `@astrojs/node` standalone) |
| Islas interactivas  | **React 19** (`@astrojs/react`)                                         |
| Estilos             | **Tailwind v4** vía `@tailwindcss/vite` (sin `tailwind.config`)        |
| Runtime             | Node **>= 22.12.0**                                                     |
| View Transitions    | `ClientRouter` de `astro:transitions`                                   |
| Íconos              | **SVG inline** (no se usa `lucide-react`)                               |

> No hay router de cliente tipo SPA: la navegación es por páginas Astro, con
> transiciones suaves vía `ClientRouter`.

---

## 3. Arquitectura

### Vertical slices por dominio

Cada feature de negocio es un *slice* autocontenido bajo `src/features/<feature>/`:

```
features/<feature>/
  api/<feature>Api.ts   # llamadas fetch del dominio
  components/*.tsx        # islas React del dominio
  types.ts               # DTOs del dominio
```

Features actuales: **`auth`**, **`catalog`**, **`inventory`**, **`sales`**,
**`usuarios`** (gestión de empleados), **`dashboard`**, **`reportes`**,
**`admin`** (shell del portal).

### Patrón de islas (Astro + React)

Astro renderiza HTML estático en el servidor. Las zonas interactivas se montan
como **islas React** con directivas de hidratación:

- `client:load` → interacción inmediata (formularios, dropdowns críticos).
- `client:visible` → contenido bajo el *fold* (se hidrata al hacer scroll).

Cada isla es un **root de React independiente**: dos islas en la misma página no
comparten estado por Context. Por eso el estado global compartido se resuelve
con módulos singleton (ver [Toasts](#8-sistema-de-ui)) o eventos de `window`.

### Comunicación entre islas

Islas separadas se coordinan con **eventos del DOM**. Ej.: al registrar una
venta o editar stock se despacha `CustomEvent("stock-updated")`, que la tabla de
inventario escucha para refrescar.

---

## 4. Estructura de carpetas

```
src/
├── pages/                          # rutas Astro (.astro) — file-based routing
│   ├── index.astro                 # landing pública
│   ├── login.astro
│   └── admin/                      # portal protegido por middleware
│       ├── index.astro             # dashboard
│       ├── catalogo.astro
│       ├── grupos.astro
│       ├── usuarios.astro          # gestión de empleados (ADMIN)
│       ├── ventas/
│       │   ├── index.astro         # registrar venta
│       │   └── historial.astro
│       └── reportes/
│           ├── ranking.astro
│           ├── empleados.astro     # ranking por empleado (ADMIN)
│           ├── pagos.astro
│           └── ingresos.astro
│
├── features/                       # vertical slices por dominio
│   ├── auth/        (api · components)        # LoginForm
│   ├── catalog/     (api · components)        # CatalogApp, ProductCard
│   ├── inventory/   (api · components · types)# InventoryManager/Table, GrupoFormDialog
│   ├── sales/       (api · components · types)# SalesManager/Form/History, SummaryCard
│   ├── usuarios/    (api · components · types)# UsuariosManager (alta/listado de empleados)
│   ├── dashboard/   (api · components · types)# Dashboard (KPIs)
│   ├── reportes/    (api · components · types)# Ranking/Empleados/Pagos/Ingresos + shared
│   └── admin/       (components)              # Sidebar, PortalHeader, UserBlock, UserDropdown
│
├── components/
│   ├── astro/                      # secciones estáticas de la landing
│   │   ├── Header.astro  Hero.astro  Features.astro  CtaFinal.astro  Footer.astro
│   └── react/
│       ├── Dropdown.tsx            # combo accesible reutilizable
│       └── ui/                     # design system base
│           ├── Button  Badge  Input  Select
│           ├── Modal  SlideOver  Spinner  Skeleton  Toast
│
├── layouts/
│   ├── Layout.astro                # layout público
│   └── IntranetLayout.astro        # shell del portal (sidebar + header)
│
├── lib/
│   ├── api/
│   │   ├── baseUrl.ts              # getApiBaseUrl()
│   │   ├── http.ts                # getAuthHeaders, getErrorMessage, ApiError
│   │   └── jwt.ts                 # getRoleFromToken, hasRole, isAdmin, isEmpleado, getUsername
│   ├── format.ts                  # formatPEN, formatPotencia
│   ├── enums.ts                   # mapeos enum ↔ label
│   └── cn.ts                      # merge de classNames
│
├── middleware.ts                  # guard de /admin/* (token + gating de rol)
└── styles/global.css              # Tailwind + estilos globales
```

---

## 5. Rutas y pantallas

| Ruta                        | Acceso | Pantalla                          | Feature      |
| --------------------------- | ------ | --------------------------------- | ------------ |
| `/`                         | 🔓     | Landing pública (hero + catálogo) | `catalog`    |
| `/login`                    | 🔓     | Login                             | `auth`       |
| `/admin`                    | 🔒     | Dashboard + KPIs                  | `dashboard`  |
| `/admin/catalogo`           | 🔐     | Catálogo interno                  | `catalog`    |
| `/admin/grupos`             | 🔒     | ABM de grupos electrógenos        | `inventory`  |
| `/admin/usuarios`           | 🔒     | Gestión de empleados              | `usuarios`   |
| `/admin/ventas`             | 🟩     | Registrar venta                   | `sales`      |
| `/admin/ventas/historial`   | 🟩     | Historial de ventas (paginado)    | `sales`      |
| `/admin/reportes/ranking`   | 🔒     | Ranking de clientes               | `reportes`   |
| `/admin/reportes/empleados` | 🔒     | Ranking por empleado              | `reportes`   |
| `/admin/reportes/pagos`     | 🔒     | Reporte por tipo de pago          | `reportes`   |
| `/admin/reportes/ingresos`  | 🔒     | Ingresos totales                  | `reportes`   |

🔓 público · 🔐 autenticado (cualquier rol) · 🟩 ADMIN o EMPLEADO · 🔒 solo ADMIN.

> Las páginas de `/admin` declaran `export const prerender = false;` y montan las
> islas correspondientes.
>
> Las rutas 🔒 están protegidas a nivel de ruta: si un EMPLEADO entra a una de
> ellas (o teclea la URL a mano), el middleware lo redirige a `/admin/ventas`
> (su home) en lugar de mostrar un error. En el historial 🟩, el EMPLEADO solo
> ve sus propias ventas; el ADMIN ve todas y puede filtrar por vendedor.

---

## 6. Autenticación y autorización

- **Token**: JWT guardado en cookie `jwt_token` (`max-age=3600`,
  `SameSite=Lax`, `path=/`). El login (`POST /auth/login`) devuelve
  `{ token, username, roles }`; se persiste el `token` en la cookie.
- **Roles**: el JWT incluye el claim `roles`. Hay tres:
  - `ROLE_ADMIN` ("jefe"): acceso total — ABM de grupos, gestión de empleados,
    todas las ventas y todos los reportes.
  - `ROLE_EMPLEADO` (vendedor): registra ventas y ve **solo las suyas**. Sin
    acceso a dashboard, reportes financieros ni gestión de usuarios.
  - `ROLE_USER`: registro público (`/auth/register`); no opera ventas.
- **Decodificación del JWT** (`lib/api/jwt.ts`): lee el *payload* base64url
  (sin verificar firma — es solo UX) y expone `getRoleFromToken`, `hasRole`,
  `isAdmin`, `isEmpleado` y `getUsername`. Funciona tanto en cliente como en
  SSR (`atob` es global en Node 22).
- **Protección de rutas** (`src/middleware.ts`): intercepta `/admin/*`.
  1. Sin cookie → redirige a `/login`.
  2. Con token: si es ADMIN, pasa a todo.
  3. Si no es ADMIN y la ruta es solo-ADMIN (dashboard, `grupos`, `usuarios`,
     `reportes/*`) → redirige a `/admin/ventas` (su home), evitando el `403`.
- **Gating de UI por rol**: el `Sidebar` se filtra **en SSR** según el rol (cada
  ítem declara los roles que lo ven), de modo que la navegación renderiza ya
  filtrada (sin parpadeo). El `UserBlock` muestra usuario y rol reales del JWT.
  Los controles de admin (botón "Nuevo", formulario de empleados, filtro de
  vendedor) se ocultan según rol.
- **Seguridad real**: vive en el backend (responde `401`/`403`). Todo el gating
  del front (ruta + UI) es solo UX; nunca sustituye la validación del servidor.
  Es defensa en profundidad: middleware + sidebar + API.

> Las llamadas autenticadas se hacen desde el cliente (islas React), que leen la
> cookie; el middleware y el gating del sidebar sí leen el JWT en SSR vía
> `Astro.cookies`.

---

## 7. Capa de datos / contrato de API

Prefijo: `/api/v1`. Base configurable con `PUBLIC_API_BASE_URL`
(fallback `http://localhost:8082`).

### Patrón de cliente API (`features/<x>/api/<x>Api.ts`)

- URL con `new URL(path, getApiBaseUrl())` + `searchParams`.
- Headers de auth con `getAuthHeaders()` (lee la cookie `jwt_token`).
- En error: `getErrorMessage(res, fallback)` extrae el mensaje y se lanza
  `throw new Error(...)`. Para distinguir el código HTTP se usa `ApiError`
  (lleva `status`), p. ej. para tratar el `409` de stock insuficiente.
- El componente captura la excepción y muestra el estado de error.

### Endpoints

| Método | Ruta                                                 | Acceso |
| ------ | ---------------------------------------------------- | ------ |
| POST   | `/auth/login`                                        | 🔓 → `{ token, username, roles }` |
| POST   | `/auth/register`                                     | 🔓 (rol USER) |
| POST   | `/usuarios`                                          | 🔒 crear empleado/admin |
| GET    | `/usuarios`                                          | 🔒 listar usuarios |
| GET    | `/grupos-electrogenos`                               | 🔓 paginado |
| GET    | `/grupos-electrogenos/{id}`                          | 🔓 |
| GET    | `/grupos-electrogenos/{id}/precio`                   | 🔓 |
| GET    | `/grupos-electrogenos/filtro/combustible?tipo=`      | 🔓 |
| GET    | `/grupos-electrogenos/filtro/moviles-automaticos?materialEje=` | 🔓 |
| POST   | `/grupos-electrogenos`                               | 🔒 |
| PUT    | `/grupos-electrogenos/{id}`                          | 🔒 |
| DELETE | `/grupos-electrogenos/{id}`                          | 🔒 |
| PATCH  | `/grupos-electrogenos/{id}/stock?nuevoStock=`        | 🔒 |
| POST   | `/ventas`                                            | 🟩 atribuida al usuario |
| GET    | `/ventas`                                            | 🔐 paginado, filtrado por rol (`?vendedorId` solo ADMIN) |
| GET    | `/ventas/{id}`                                        | 🔐 (empleado solo la suya) |
| PUT    | `/ventas/{id}`                                        | 🔒 |
| DELETE | `/ventas/{id}`                                        | 🔒 |
| GET    | `/ventas/por-empleado`                               | 🔒 ranking por vendedor |
| GET    | `/ventas/ranking-clientes`                           | 🔒 |
| GET    | `/ventas/reporte-pagos?tipo=EFECTIVO\|CHEQUE`        | 🔒 |
| GET    | `/ventas/ingresos-totales`                           | 🔒 |

🔓 público · 🔐 autenticado · 🟩 ADMIN o EMPLEADO · 🔒 solo ADMIN.

**Códigos de error manejados**: `400` (validación), `401` (sin/mal token),
`403` (sin rol), `409` (conflicto — p. ej. stock insuficiente en venta).

### Tipos (DTOs)

- Definidos en `types.ts` de cada feature.
- Enums como *union types* (ej. `type TipoCombustible = "NAFTA" | "GAS_NATURAL" | "GASOIL"`).
- Respuestas paginadas: `PaginatedResponseDTO<T>` con
  `content`, `page`, `size`, `totalElements`, `totalPages`.

Detalle completo de *payloads* en `API-FRONTEND.md`.

---

## 8. Sistema de UI

Design system propio en `src/components/react/ui/`, tema claro, Tailwind v4:

| Componente   | Rol                                                                |
| ------------ | ------------------------------------------------------------------ |
| `Button`     | Variantes primario / ghost / danger / sm. Foco visible con ring.   |
| `Badge`      | Etiquetas de estado (tono success / info / etc.).                  |
| `Input`      | Input con `<label>` asociado vía `useId()` y `aria-invalid`.       |
| `Select`     | Igual patrón accesible que `Input`.                                |
| `Modal`      | Basado en `<dialog>` nativo (focus trap + Esc gratis).             |
| `SlideOver`  | Panel lateral sobre `<dialog>` nativo.                             |
| `Spinner`    | Indicador con `role="status"`.                                     |
| `Skeleton`   | Placeholder de carga (`aria-hidden`, respeta reduced-motion).      |
| `Toast`      | Notificaciones globales (ver abajo).                               |
| `Dropdown`   | Combo accesible reutilizable (`components/react/Dropdown.tsx`).    |

### Toasts — store singleton de módulo

Como cada isla Astro es un root React separado, un `Context.Provider` **no** se
comparte entre islas. El sistema de toasts resuelve esto con un **store a nivel
de módulo**:

```ts
import { notify, ToastViewport } from ".../ui/Toast";

notify("Venta registrada", "success");   // llamable desde cualquier isla
```

Se monta un `<ToastViewport />` por página (en la isla que dispara las acciones)
y `notify()` publica al store compartido. Cableado en altas/bajas/edición de
inventario, edición de stock y registro de ventas.

### Paleta

Acento **naranja** (`orange-500`), base **`blue-950`**, superficies blancas /
grises. Precios formateados con
`toLocaleString('es-PE', { style:'currency', currency:'PEN' })` vía `formatPEN`.

---

## 9. Estados transversales

Cada lista y card de datos maneja sus tres estados:

- **Carga**: filas/bloques `Skeleton` (no spinners de pantalla completa) en
  inventario, ventas, dashboard, catálogo y reportes.
- **Vacío**: mensaje amable cuando la colección viene sin elementos.
- **Error**: alerta con el mensaje del backend; `403` se distingue en reportes y
  en el historial de ventas con un texto de permisos específico.

Para acciones CRUD el feedback es por **toast** (éxito/error), además del estado
inline cuando corresponde.

---

## 10. Accesibilidad, responsive y movimiento

- **Responsive**: el sidebar del portal es un **drawer off-canvas** por debajo de
  1024 px, abierto por una hamburguesa en el header, con overlay y cierre por
  `Esc` / clic en overlay / clic en un link. Tablas con `overflow-x-auto`. Login
  en una columna centrada.
- **`prefers-reduced-motion`**: se anulan animaciones no esenciales (skeletons,
  contadores animados de ingresos, barras de progreso, carrusel del hero,
  dropdown). Los spinners funcionales siguen girando.
- **Accesibilidad**: `<label htmlFor>` asociado a inputs en formularios, SVG
  decorativos con `aria-hidden`, `aria-haspopup` / `aria-expanded` / `role=menu`
  en el dropdown de usuario, `aria-current` en el ítem activo del sidebar,
  diálogos con `role="dialog"` + `aria-modal`.

> El script del sidebar se inicializa con `astro:page-load` (no
> `DOMContentLoaded`) para sobrevivir a las view transitions del `ClientRouter`.

---

## 11. Convenciones de código

- **Cliente API**: reusar el patrón de
  `inventory/api/gruposElectrogenosApi.ts` como plantilla.
- **Páginas con islas**: `export const prerender = false;` + montar la isla con
  la directiva de hidratación adecuada.
- **Enums hacia la API**: en MAYÚSCULA con guion bajo (`GAS_NATURAL`), nunca el
  label de UI ("Gas Natural"). El mapeo vive en `lib/enums.ts`.
- **Estilos**: Tailwind utility-first; sin clases inventadas fuera de Tailwind v4.
- **Tema**: claro (ver §14). No migrar a oscuro sin pedido explícito.

---

## 12. Puesta en marcha

Requisitos: Node `>= 22.12.0` y el backend Spring Boot corriendo (por defecto en
`http://localhost:8082`).

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (astro dev)
npm run build    # build de producción → ./dist/
npm run preview  # previsualizar el build
```

| Comando            | Acción                                  |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Servidor de desarrollo                  |
| `npm run build`    | Build SSR de producción a `./dist/`     |
| `npm run preview`  | Sirve el build localmente               |
| `npm run astro`    | CLI de Astro (`astro add`, `astro check`) |

---

## 13. Variables de entorno

| Variable               | Default                   | Descripción                         |
| ---------------------- | ------------------------- | ----------------------------------- |
| `PUBLIC_API_BASE_URL`  | `http://localhost:8082`   | Base del backend (prefijo `/api/v1`)|

Ver `.env.example` como plantilla.

---

## 14. Decisiones de diseño vigentes

> No re-litigar sin pedido explícito.

- **Tema visual claro manda.** El código usa tema claro (`bg-white`,
  `text-blue-950`, acento naranja). El documento `UI_UX_SPEC_GruposElectrogenos.md`
  describe un tema oscuro industrial que se usa **solo como referencia de
  estructura, secciones y mapeo de pantallas**, no de su paleta ni design tokens.
- **`lucide-react` no se instala**: los íconos son SVG inline.
- **Auth por cookie `jwt_token`** (no localStorage), con middleware sobre
  `/admin/*`.
- **`GrupoFormDialog` se mantiene como modal centrado** (no slide-over): ya
  funcionaba con su toggle Fijo/Móvil; convertirlo era *churn* sin valor.

Fuentes de verdad complementarias: `API-FRONTEND.md` (contrato de endpoints),
`UI_UX_SPEC_GruposElectrogenos.md` (layout/secciones) y `CLAUDE.md` (guía
operativa). El plan de desarrollo por fases está en `PLAN.md`.

---

## 15. Gotchas

- La API espera **enums en MAYÚSCULA** (`GAS_NATURAL`), no labels de UI.
- El JWT vive solo en la cookie del navegador; las llamadas autenticadas se
  hacen desde el cliente, no en SSR.
- Stock `= 0` / `≤ 5` tienen tratamiento visual propio en las tablas.
- Precios siempre con `formatPEN` (es-PE / PEN).
- Islas Astro = roots React separados → no compartir estado por Context; usar
  módulos singleton o eventos de `window`.

---

## 16. Estado del proyecto

| Módulo                              | Estado |
| ----------------------------------- | ------ |
| Login                               | ✅     |
| Landing pública (hero/catálogo/features/CTA/footer) | ✅ |
| Portal shell (sidebar/header/drawer)| ✅     |
| Dashboard + KPIs                    | ✅     |
| Inventory (grupos) CRUD             | ✅     |
| Ventas (registro + historial)       | ✅     |
| Roles ADMIN/EMPLEADO + gating de ruta | ✅   |
| Gestión de empleados (alta/listado) | ✅     |
| Ventas por rol (empleado ve las suyas, admin filtra) | ✅ |
| Reportes (ranking clientes/empleados/pagos/ingresos) | ✅ |
| Estados transversales / a11y / responsive | ✅ |

Pendientes abiertos y su detalle en [`PLAN.md`](./PLAN.md) (Fase 6): carga de
assets raster del usuario (`ASSETS-NECESARIOS.txt`) y asociación de labels en los
3 campos de `GrupoFormDialog` que montan el widget `Dropdown`.
