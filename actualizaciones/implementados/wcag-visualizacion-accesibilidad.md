# Implementado: Técnicas de Visualización y Accesibilidad WCAG 2.1 AA

**Fecha:** 21-oct-2026  
**Origen:** `actualizaciones/Técnicas de Visualización y Accesibilidad WCAG 2.1 AA.md`  
**Estado:** aplicado y verificado (`npm test` 19/19, `npm run build` sin advertencias de a11y)

---

## 1. Hoja de estilos de accesibilidad — `src/styles/accessibility.css` (nueva)

Importada desde `src/styles/global.css`. Contiene:

- `@media (prefers-reduced-motion: reduce)`: anula duraciones de animación, transiciones y scroll suave; desactiva capas parallax (WCAG 2.3.3).
- `:focus-visible`: anillo de foco 3px `#38BDF8`, offset 4px (WCAG 2.4.7).
- `.sr-only`: ocultamiento semántico para lectores de pantalla (WCAG 1.3.1 / 4.1.2).
- `.data-table-fallback`: tabla semántica alternativa para gráficas D3 (WCAG 1.3.1).
- Utilidades de doble codificación y micro-animación respetuosa (máx. 3 Hz, sin parpadeo riesgoso; WCAG 1.4.1, 2.3.1).

## 2. Mapa interactivo de México — `src/components/MapaMexico.svelte` (nuevo)

Integrado en **Slide 1 (Onboarding)** como complemento del selector desplegable existente:

- 32 entidades como botones SVG (`<rect>` con `tabindex`, `role="button"`, `aria-label`, `aria-pressed`) navegables por clic, touch y teclado (Enter/Space).
- Bordes de los estados con contraste >= 3:1 contra el fondo (WCAG 1.4.11).
- `<select>` nativo de respaldo como mecanismo alternativo para tecnologías de asistencia (WCAG 2.1.1).
- Resaltado del estado activo con el acento INE.

## 3. Slide 3 — Silla Vacía: doble codificación y teclado

- Cada asiento es ahora un `<button>` focusable con `aria-label` descriptivo ("Asiento N: votó / no votó") y anuncio al lector de pantalla al activar con Enter/Space.
- Doble codificación visual (no solo color): asientos que votaron con **fondo verde + borde blanco grueso**; asientos que no votaron con **fondo gris + borde punteado blanco** (WCAG 1.4.1).
- `:focus-visible` en cada asiento.

## 4. Slide 4 — Línea de vida: tabla alternativa

- Ya existía el botón alternador "Ver Gráfico" / "Ver Tabla" con una tabla semántica `<table>` completa (año, tipo, edad, participación, personas registradas). Se conserva como alternativa accesible a la gráfica D3 (WCAG 1.3.1).

## 5. Slide 5 — Tarjeta compartible: versión en texto plano

- Bloque `.tarjeta-texto-plano` visible en el DOM con el resumen de la tarjeta (generación, estado, porcentaje, elecciones, fuente INE) para lectores de pantalla (WCAG 1.1.1 / 1.3.1).
- Fondo y bordes con contraste >= 4.5:1 sobre el tema activo.

## 6. Micro-animaciones y parallax (Slide 2 y transiciones)

- Las animaciones existentes respetan `prefers-reduced-motion: reduce`.
- Ninguna animación supera los 5 segundos ni parpadea por encima de 3 Hz (WCAG 2.2.2, 2.3.1).
- El efecto de transición entre slides se anula bajo `prefers-reduced-motion`.

---

## Checklist de aceptación (documento WCAG)

| Requisito | Estado |
|---|---|
| Gráficas D3 con botón alternador a tabla HTML | ✅ Slide 4 (línea de vida ↔ tabla) |
| Ningún elemento depende solo del color | ✅ SillaVacia (color + bordes + aria-label) |
| `@media (prefers-reduced-motion: reduce)` anula movimiento | ✅ global.css + accessibility.css |
| Mapa: selección gráfica (SVG) y por `<select>` nativo | ✅ MapaMexico.svelte |
| Contraste texto ≥ 4.5:1 verificado | ✅ Tokens en global.css (revisados) |

---

## Queda pendiente (verificación manual, no ejecutable desde Node)

- Lighthouse Accesibilidad > 95 en tema oscuro y claro (`Historial/PRUEBAS_ESCRITORIO.md`).
- Navegación completa con Tab / Shift+Tab / Enter / Escape sin ratón.
- Contraste medido con DevTools en asientos de la Silla Vacía, KPIs y badges.
- Zoom 200 % / 400 % y ancho 320 px sin scroll horizontal.
- Descarga de PNG en Safari/iOS (fuentes autoalojadas ya aplicadas).

Estas verificaciones quedan registradas en `actualizaciones/pendientes/PENDIENTES.md`.
