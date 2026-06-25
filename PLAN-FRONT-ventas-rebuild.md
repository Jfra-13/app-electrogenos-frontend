# Plan Frontend — Rediseño del módulo de Ventas

**Estado:** propuesto
**Ámbito:** frontend (`src/features/sales`)
**Documento hermano:** `PLAN-FRONT-clientes-ventas.md` (selector de cliente — ya implementado).
**Decisión de modelo:** Modelo B — *el vendedor elige el grupo*.

---

## 1. Objetivo

Reconstruir la vista de ventas para que sea simple, intuitiva y honesta: el
vendedor **elige un grupo concreto** y vende **ese** grupo (precio y stock
reales), con una **boleta en vivo** al costado del formulario y una
**confirmación animada** al cerrar la venta.

## 2. Problema actual (el "cruce")

`POST /ventas` hoy **no acepta código de grupo**: solo recibe criterios
(`potenciaRequerida`, `tipoCombustible`, `vidaUtilSolicitada`) y el backend corre
la **tasación** eligiendo él mismo el grupo.

El botón "Usar" del panel es **cosmético**: solo copia criterios al formulario.
Como esos criterios son ambiguos (varios grupos los cumplen), el backend puede
asignar un grupo distinto al que el vendedor creyó elegir.

Caso real reproducido:

1. Vendedor pulsa "Usar" en **GE-FIJ-005** (Nafta, 2–8 kVA, stock 20).
2. Prefill calcula potencia = `(2+8)/2` = **5**, Nafta, vida 10.
3. Cumplen GE-FIJ-005 **y** GE-MOV-002 (Nafta, 4–15). La tasación elige el más
   barato: **GE-MOV-002**, que tiene **stock 0** → `409 Stock insuficiente`.

El vendedor creyó vender un grupo con stock; el sistema asignó otro sin stock.
Esa contradicción es la raíz de la confusión visual y funcional.

## 3. Decisión de diseño (Modelo B)

El vendedor elige una unidad concreta y se vende esa. En un mostrador real el
vendedor cierra un producto con su precio; la tasación silenciosa que cambia de
grupo (con otro precio y otro stock) es peligrosa.

**Cambio de contrato (backend):** agregar `grupoCodigo` **opcional** a
`POST /ventas`.

- Presente → el backend vende **ese** grupo (valida stock y congela su precio).
- Ausente → cae a tasación como hoy (retrocompatible).

El front, al elegir un grupo, deriva `potenciaRequerida` (punto medio del rango),
`tipoCombustible` y `vidaUtilSolicitada` del propio grupo, de modo que:

- El vendedor solo introduce **cliente · grupo · cantidad · tipo de pago**.
- Los campos derivados pasan la validación `≥ 1` del backend y coinciden con el
  grupo, sin que el vendedor los escriba.

## 4. Decisiones técnicas (mínimo necesario)

- **Modal de confirmación**: elemento `<dialog>` nativo. Centrado, backdrop,
  cierre con `Esc` y foco gestionado, sin librería de modales.
- **Animaciones**: transiciones CSS, respetando `prefers-reduced-motion`. Sin
  librería de animación.
- **Boleta en vivo**: estado derivado del grupo ya cargado en el panel. Sin fetch
  adicional.
- **Sin dependencias nuevas.** Tema CLARO, acento naranja (decisión vigente).

## 5. Estado elevado (forma de datos)

`SalesManager` pasa a dueño del estado de la venta en curso:

```
grupoElegido: GrupoElectrogenoDTO | null   // fila seleccionada en el panel
cantidad, tipoPago, cliente                 // entradas del vendedor
summary: SolicitudCompraResponseDTO | null  // respuesta -> abre el modal
loading, error, conflict (409)
```

`SalesForm` baja a presentacional: recibe `grupoElegido` + valores y emite
cambios. El panel de grupos emite `onSelect(grupo)`.

---

## 6. Fases

> Cada fase deja el build verde y es revisable por separado.

### Fase 0 — Contrato (acuerdo con backend) — *bloqueante*

- `types.ts`: agregar `grupoCodigo?: string` a `SolicitudCompraRequestDTO`.
- `ventasApi.ts`: enviar `grupoCodigo` cuando exista.
- **Backend** (doc hermano): aceptar y honrar `grupoCodigo` opcional.
- **Aceptación:** request opcional compila; con `grupoCodigo` el backend vende ese
  grupo; sin él, tasa como antes.

### Fase 1 — Panel de grupos como selector

- `GruposPanel.tsx`: `onPick` → `onSelect(grupo)`; "Usar" → **"Seleccionar"**;
  fila activa resaltada; deshabilitar selección si `stock = 0`. Mantener búsqueda
  por código y filtros.
- `SalesManager.tsx`: guarda `grupoElegido`.
- `SalesForm.tsx`: deriva potencia/combustible/vida del grupo elegido; oculta esos
  inputs como protagonistas (quedan como detalle de solo lectura). El vendedor ve
  cliente · grupo · cantidad · pago.
- **Aceptación:** elegir un grupo llena el form; "Procesar" manda `grupoCodigo` +
  derivados; el grupo vendido = el elegido.

### Fase 2 — Boleta en vivo + guard de stock

- `BoletaPreview.tsx` (nuevo): columna sticky con grupo, precio unitario,
  `total = precio × cantidad`, stock disponible.
- Guard pre-submit: deshabilitar "Procesar" y avisar inline si
  `cantidad > stock` o si no hay grupo elegido. Elimina el `409` sorpresa.
- **Aceptación:** el total se actualiza en vivo; el submit se bloquea con aviso
  claro cuando `cantidad > stock`.

### Fase 3 — Layout de 2 columnas + jerarquía visual

- Reorganización responsive: form (izq) · boleta (der) en desktop; apilado en
  mobile. Tabla selector full-width abajo.
- **Un solo CTA primario naranja** por contexto; secundarios en estilo ghost.
  Elimina la sobrecarga de botones naranja.
- **Aceptación:** desktop 2 columnas, mobile apilado, sin dobles CTA naranja.

### Fase 4 — Modal de confirmación animado

- `SuccessDialog.tsx` (nuevo): `<dialog>` nativo centrado, animado, con la boleta
  final (identificador, grupo, total) y CTAs **Nueva venta** / **Ver historial**.
- Reemplaza el swap inline actual de `SummaryCard`.
- `prefers-reduced-motion`: sin animación cuando el usuario lo pide.
- **Aceptación:** tras una venta OK aparece el modal centrado; "Nueva venta"
  reinicia el flujo y refresca el stock del panel.

### Fase 5 — Pulido, estados y accesibilidad

- Estados: loading en "Procesar", error `400`/`409` mostrado dentro del modal o
  inline según corresponda.
- A11y: gestión de foco del `<dialog>`, labels asociados, `aria` en estados.
- **Aceptación:** build verde; recorrido completo accesible por teclado.

---

## 7. Archivos afectados

| Archivo | Cambio |
| ------- | ------ |
| `features/sales/types.ts` | `grupoCodigo?` en el request |
| `features/sales/api/ventasApi.ts` | enviar `grupoCodigo` |
| `features/sales/components/SalesManager.tsx` | estado elevado; cablea form + boleta + modal |
| `features/sales/components/SalesForm.tsx` | presentacional; deriva del grupo elegido |
| `features/sales/components/GruposPanel.tsx` | pasa a selector; fila activa |
| `features/sales/components/BoletaPreview.tsx` | **nuevo** — boleta en vivo |
| `features/sales/components/SuccessDialog.tsx` | **nuevo** — modal `<dialog>` |

Sin tocar `SalesHistory.tsx` ni la API de inventario.

## 8. Dependencias y riesgos

- **Fase 0 es bloqueante**: sin `grupoCodigo` en el backend, el grupo vendido
  podría seguir difiriendo del elegido. No avanzar Fase 1+ sin ese acuerdo.
- El selector de cliente ya existe (doc hermano) — se reutiliza tal cual.
- Riesgo bajo: todo es retrocompatible (campo opcional, tasación intacta).
