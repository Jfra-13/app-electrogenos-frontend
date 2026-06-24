# PLAN DE DESARROLLO — Electrogen Front

Plan por fases para llevar el proyecto desde su estado actual hasta el 100%.
Referencias: `UI_UX_SPEC_GruposElectrogenos.md` (layout/secciones),
`API-FRONTEND.md` (endpoints), `CLAUDE.md` (convenciones y stack).

**Regla de tema vigente:** tema CLARO manda. El spec se usa como referencia de
estructura y secciones, NO de su paleta oscura. (Ver `CLAUDE.md` §3.)

**Convención de imágenes:** todo asset raster que deba aportar el usuario se anota
en `ASSETS-NECESARIOS.txt`. Los SVG decorativos (circuito, pulso, íconos) se
generan en código, no son assets del usuario.

Leyenda de estado: ✅ hecho · 🟡 parcial · ⛔ no existe.

---

## Estado actual (línea base)

| Módulo                            | Estado | Detalle                                                  |
| --------------------------------- | ------ | -------------------------------------------------------- |
| Login                             | ✅     | Funciona, tema claro                                     |
| Inventory (Grupos) CRUD           | ✅     | Por auditar contra spec §5                               |
| Ventas                            | ✅     | Por auditar contra spec §6                               |
| Catálogo admin                    | 🟡     | Existe, revisar filtros/paginación                       |
| Landing pública                   | 🟡     | Header + Hero + catálogo; faltan features/CTA/footer     |
| Portal shell (sidebar/header)     | 🟡     | Sidebar sin Reportes ni user block; sin header de portal |
| Dashboard                         | ⛔     | `admin/index.astro` solo incrusta inventario             |
| Reportes (ranking/pagos/ingresos) | ⛔     | No existen                                               |

---

## FASE 0 — Cimientos compartidos

> Base técnica que el resto de fases reutiliza. Hacer primero para no duplicar.

- [ ] **0.1** Centralizar helpers de API en `src/lib/api/`:
      extraer `getAuthHeaders()` y `getErrorMessage()` (hoy duplicados en cada
      `*Api.ts`) a `lib/api/http.ts`. Refactorizar los features para que los importen.
- [ ] **0.2** `lib/api/jwt.ts`: helper `getRoleFromToken()` que decodifica el
      payload del JWT (base64) y expone `isAdmin()` para gating de UI (`ROLE_ADMIN`).
- [ ] **0.3** `lib/format.ts`: `formatPEN(n)` con
      `toLocaleString('es-PE',{style:'currency',currency:'PEN'})` y `formatPotencia(min,max)`.
- [ ] **0.4** `lib/enums.ts`: mapeos enum→label
      (`GAS_NATURAL`→"Gas Natural", `AUTOMATICO`→"Automático", etc.) y label→enum
      para los selects. Evita strings mágicos en componentes.
- [ ] **0.5** Verificar `PUBLIC_API_BASE_URL` en `.env` y documentar fallback.
- [ ] **0.6** Componentes UI base reutilizables en `components/react/ui/`:
      `Button` (variantes primario/ghost/danger/sm), `Badge`, `Input`, `Select`,
      `Modal`, `SlideOver`, `Spinner`, `Skeleton`, `Toast`. Tema claro.

**Salida:** sin cambios visibles; base lista para reutilizar.

---

## FASE 1 — Portal shell completo (§3)

> Todo lo de `/admin` vive dentro de este shell. Corregir antes de Dashboard/Reportes.

- [x] **1.1 Sidebar (`features/admin/components/Sidebar.astro`)** — corregir/ampliar:
  - [x] Agregar labels de sección: CATÁLOGO / OPERACIONES / REPORTES.
  - [x] Agregar ítems faltantes de Reportes: **Ranking Clientes**, **Reporte por Pago**, **Ingresos Totales**. (links a `/admin/reportes/*`, 404 hasta Fase 3)
  - [x] Estado activo por ruta (borde izquierdo naranja + peso 600).
  - [x] Bloque de usuario inferior: avatar con inicial, nombre, rol (`UserBlock.astro`). Logout vive en el dropdown del header.
  - [x] Botón collapse (240px ↔ 56px) con tooltips en modo colapsado (atributo `title` nativo).
- [x] **1.2 Header de portal (§3.2)** — nuevo componente `PortalHeader.astro`:
  - [x] Breadcrumb dinámico según ruta.
  - [x] Avatar a la derecha con dropdown (reusa `UserDropdown.tsx`).
  - [x] Bell cosmético.
- [x] **1.3 `IntranetLayout.astro`**: header sticky integrado dentro de `.intranet-content`; spacing por `--sidebar-width`.

**Salida:** navegación completa del portal con los 6 destinos del spec.

---

## FASE 2 — Dashboard real (§4)

> Reemplaza el `admin/index.astro` actual (que solo incrusta inventario).

- [x] **2.1** Crear `features/dashboard/` (api + components + types).
- [x] **2.2 KPI cards (4)** wired a endpoints:
  - [x] Total Grupos → `GET /grupos-electrogenos` (`totalElements`).
  - [x] Ventas del Mes → `GET /ventas` (`totalElements`). (sin filtro de mes en API → cuenta total)
  - [x] Ingresos Totales → `GET /ventas/ingresos-totales`.
  - [x] Stock Total → suma de `stock` del listado de grupos.
- [x] **2.3 Tabla "Últimas ventas"** (5 filas, sin paginación) → `GET /ventas`.
- [x] **2.4 Ranking rápido top 3** → `GET /ventas/ranking-clientes` (barras relativas).
- [x] **2.5** Reemplazar contenido de `pages/admin/index.astro` por el Dashboard.
      Inventario movido a `/admin/grupos` (+ link en Sidebar y breadcrumb).
- [x] **2.6** Estados loading (skeleton) y error por card.

**Salida:** dashboard funcional con datos reales.

---

## FASE 3 — Reportes (§7)

> Tres pantallas nuevas. Endpoints 🔒 ADMIN.

- [x] **3.1 Ranking de Clientes (`/admin/reportes/ranking`)** → `GET /ventas/ranking-clientes`:
  - [x] Filas con posición, nombre, barra de progreso animada (width 0→final).
  - [x] #1 con ícono Trophy y fondo sutil.
- [x] **3.2 Reporte por Pago (`/admin/reportes/pagos`)** → `GET /ventas/reporte-pagos?tipo=`:
  - [x] Tabs EFECTIVO / CHEQUE (cambia el query).
  - [x] Tabla `N° | Solicitante | Cantidad`.
  - [x] Card resumen con suma de `cantidad`.
- [x] **3.3 Ingresos Totales (`/admin/reportes/ingresos`)** → `GET /ventas/ingresos-totales`:
  - [x] Big KPI centrado con counter animado (`requestAnimationFrame`).
  - [x] Breakdown por tipo de pago (2 cards) usando `reporte-pagos`.
- [x] **3.4** Manejo de `403` (sin rol) → mensaje claro, no pantalla rota.

**Salida:** módulo de reportes completo.

---

## FASE 4 — Auditoría y corrección de módulos existentes

> Alinear lo ya hecho con el spec y el contrato de API.

- [x] **4.1 Inventory (Grupos) §5:**
  - [x] Tabla: badges de Tipo (Fijo/Móvil), columna Stock con estados (0 = "Sin stock", ≤5 = warning).
  - [x] Gating ADMIN: ocultar columna Acciones y botón "Nuevo" si no es ADMIN (usar `isAdmin()` de 0.2).
  - [x] Toggle Fijo/Móvil que muestra/oculta campos móvil (ruedas, materialEje). (Se mantiene como **modal** centrado, no slide-over: ya funcionaba con el toggle; convertir era churn sin valor.)
  - [x] Modal Stock → `PATCH /grupos-electrogenos/{id}/stock?nuevoStock=`.
  - [x] Popover de confirmación de borrado (no modal completo).
  - [x] Mapear enums con `lib/enums.ts` en selects.
- [x] **4.2 Ventas §6:**
  - [ ] ~~Preview informativo de grupo asignado al completar campos.~~ Omitido: no existe endpoint de tasación-preview (la asignación ocurre en `POST /ventas`). El `SummaryCard` post-submit muestra el grupo asignado con labels y `formatPEN`.
  - [x] Manejo explícito de **409 stock insuficiente** (bloque danger; `ApiError` lleva el status).
  - [x] Badges de pago (EFECTIVO/CHEQUE), total con `formatPEN`.
  - [x] Gating ADMIN para crear (form oculto con aviso si no es ADMIN).
- [x] **4.3 Catálogo admin:**
  - [x] Filtros por combustible → endpoint `filtro/combustible` (sin filtro de "tipo" separado en API pública).
  - [x] Paginación si `totalPages > 1`.
  - [x] Card de grupo con `imageUrl` (placeholder si falta — ver assets).
- [x] **4.4** Fetch inline movido a `*Api.ts`: `LoginForm`→`features/auth/api/authApi.ts`,
      `CatalogApp`→`features/catalog/api/catalogApi.ts`.

> **Dependencia de backend (JWT con roles):** el gating ADMIN del front
> (`isAdmin()` en `lib/api/jwt.ts`) depende de que el token traiga el claim
> `roles` (ej. `["ROLE_ADMIN"]`). El back acordó **Opción 1**: agregar `roles`
> al payload del JWT. El decoder ya lo lee (`roles`/`authorities`/`scope`), sin
> cambios en front. Hasta que el back lo deploye, los controles ADMIN
> (botón Nuevo, columna Acciones de inventario, form de ventas) se ocultan a
> TODOS, admins incluidos. La seguridad real sigue en el back (`403`).

**Salida:** módulos consistentes con spec + API.

---

## FASE 5 — Landing pública completa (§1)

> Cara al cliente. Hoy: Header + Hero + catálogo. Completar el resto.

- [x] **5.1 Navbar (§1.1):** ya tenía transparente→blur on scroll, hamburguesa mobile y botón portal. Links saneados (eliminado `#coleccion` muerto; queda Catálogo/Nosotros/Contacto → anclas reales).
- [x] **5.2 Hero (§1.2):** eyebrow + copy reescrito + CTAs (Ver catálogo / Solicitar asesoría); **línea de pulso SVG animada** (signature, `stroke-dashoffset`, respeta `prefers-reduced-motion`); stats row (120+, 15 años, 3 tipos, 98%). Panel de circuito SVG **omitido**: el visual del hero es el carrusel de fotos existente (tema claro manda); convertir a circuito era churn sin valor.
- [x] **5.3 Catálogo público (§1.3):** ya existía y funciona (filtro combustible + orden + paginación + `ProductCard`). Pills vs dropdown = cosmético; se mantiene el `Dropdown` existente (no churn).
- [x] **5.4 Features 2×2 (§1.4):** `components/astro/Features.astro` — 4 tarjetas (catálogo, entrega, certificados, asesoría), íconos SVG inline. Ancla `#nosotros`.
- [x] **5.5 CTA final (§1.5):** `components/astro/CtaFinal.astro` — banda full-width, borde superior naranja. Ancla `#contacto`.
- [x] **5.6 Footer (§1.6):** `components/astro/Footer.astro` — 3 columnas (marca / navegación / portal) + copyright.

**Salida:** landing completa y navegable.

---

## FASE 6 — Estados transversales, responsive y cierre (§9–§11)

- [x] **6.1** Estados de carga: skeletons en todas las tablas y cards.
      Faltaban `InventoryManager` y `SalesHistory` (texto plano → filas Skeleton); el resto ya tenía.
- [x] **6.2** Empty states (sin datos) y error states (fallo de red/permiso).
      `SalesHistory` ya no se traga el error (estado + UI + 403 explícito). Reportes ya tenían `ReportError` (403). Inventory/catálogo usan alerta genérica (sin distinguir 403 — bajo valor).
- [x] **6.3** Sistema de toasts global (éxito/error) para acciones CRUD.
      `Toast.tsx` reescrito a **store singleton de módulo** (`notify()` + `<ToastViewport/>`): funciona entre islas Astro sin provider. Cableado en inventory (crear/editar/eliminar/stock) y ventas (registrar).
- [x] **6.4** Responsive: sidebar→drawer en mobile, login a 1 columna (§2.3), grids fluidos.
      Sidebar ahora es **drawer off-canvas** <1024px (hamburguesa en `PortalHeader`, overlay, cierre por Esc/overlay/link). Wrappers `overflow-x-auto` en tablas de Dashboard, Ventas y Pagos. Login ya era 1 columna. (Bonus: script del sidebar migrado a `astro:page-load` para sobrevivir a las view transitions.)
- [x] **6.5** `prefers-reduced-motion`: anular animaciones (pulso, counters, barras).
      Guardas en Skeleton, `useCountUp` (ingresos), barras de ranking/dashboard, carrusel del Hero (JS), dropdown y skeleton de catálogo. Spinner funcional se deja girar.
- [x] **6.6** Accesibilidad base: labels, foco visible, `alt` en imágenes, roles ARIA en modales.
      `htmlFor`/`id` en forms (grupos, ventas, login, stock), `aria-hidden` en SVG decorativos, `aria-haspopup`/`aria-expanded`/`role=menu` en `UserDropdown`. Pendiente menor: 3 campos de `GrupoFormDialog` montados sobre el widget `Dropdown` (no expone `id`).
- [x] **6.7** Recorrer el **checklist §11** del spec, ítem por ítem.
      Revisado. Varios ítems **divergen a propósito** de decisiones del proyecto (lucide-react→SVG inline, localStorage→cookie JWT, tokens oscuros→tema claro, SlideOver→modal); ver CLAUDE.md §3. El resto está cubierto por su equivalente.
- [x] **6.8** `npm run build` sin errores + smoke test de cada ruta.
      Build limpio (server, 3.29s).
- [ ] **6.9** Cargar los assets de `ASSETS-NECESARIOS.txt` (paso final del usuario).
- [ ] **6.10** (deuda a11y) `GrupoFormDialog`: asociar `<label>`/`<input>` en los
      3 campos montados sobre el widget `Dropdown` (tipoCombustible, tipoArranque,
      materialEje). El `Dropdown` actual no expone `id`/`htmlFor`; requiere
      agregarle prop `id` (o `labelId` + `aria-labelledby`) al componente
      compartido `components/react/Dropdown.tsx` y cablearlo en el form.

**Salida:** proyecto al 100%.

---

## Orden de ejecución recomendado

`Fase 0 → 1 → 2 → 3 → 4 → 5 → 6`

Fundamentos primero (0), shell (1) porque todo `/admin` cuelga de él, luego las
pantallas faltantes de alto valor (2, 3), corrección de lo existente (4),
landing (5) y pulido transversal (6).

Cada subtarea se marca `[x]` al completarse. Las imágenes que requieran aporte
del usuario se van anotando en `ASSETS-NECESARIOS.txt` durante la ejecución.
