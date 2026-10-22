# Tareas pendientes — Mi Generación en las Urnas

**Actualizado:** 20-oct-2026

Todas las **tareas de código** de los planes de `actualizaciones/implementados/` están
aplicadas (verificado contra `src/`, `npm test` 14/14 y `npm run build` OK). Lo que queda
son **verificaciones manuales** que no pueden ejecutarse desde Node en este entorno.

---

## 1. Verificación de accesibilidad (WCAG 2.1 AA)

- [ ] **Lighthouse Accesibilidad > 95** en tema oscuro y claro
  (Chrome DevTools → Lighthouse). Registrar el resultado en
  `Historial/PRUEBAS_ESCRITORIO.md`.
- [ ] Navegación completa con **Tab / Shift+Tab / Enter / Escape** sin ratón
  (selector, botones, enlaces, modal de compartir, modal de Metodología).
- [ ] **Web Story (5 slides):** avanzar y retroceder con el teclado, comprobar que
  el foco salta al encabezado de cada slide y que la barra superior marca
  "Paso N de 5".
- [ ] Contraste medido con DevTools (≥ 4.5:1 texto normal, ≥ 3:1 no textual)
  en KPIs, badges, sidebar, disclaimers y asientos de la Silla Vacía.
- [ ] **Zoom 200 % y 400 % / ancho 320 px** sin scroll horizontal.
- [ ] `prefers-reduced-motion: reduce` desactiva animaciones (DevTools → Rendering).

Origen: `implementados/V5.md`, `implementados/V6.md`.

## 2. QA manual de escritorio

- [ ] Ejecutar la matriz de `Historial/PRUEBAS_ESCRITORIO.md` (secciones 1, 3 y 4):
  - Flujo completo: selector → KPIs → gráfica → comparación → silla vacía → tarjeta PNG.
  - Flujo de la historia por slides: onboarding → choque de realidad → silla
    vacía → línea de vida → tarjeta y compartir.
  - Casos borde: año límite inferior/superior, entidad sin datos (fallback nacional).
  - Resoluciones 1366×768, 1440×900, 1920×1080.
  - Header sticky, footer pegado, sin overflow horizontal.

Origen: `implementados/V1.md` (Fase 6).

## 3. Pruebas cross-browser (entrega)

- [ ] Chrome (última), Firefox (última), Safari iOS 12+, Chrome Mobile Android 5+.
- [ ] Probar la Silla Vacía, la gráfica (scroll horizontal en móvil) y el
  bottom-sheet del detalle de punto en un dispositivo táctil real.

Origen: `implementados/V1.md`, `Historial/CHECKLIST_ENTREGA.md`.

## 4. Privacidad: autoalojar las fuentes ✅ RESUELTO

- [x] **Bricolage Grotesque y IBM Plex Sans autoalojadas** en `public/fonts/`
  (subconjunto `latin`, ~146 KB) y servidas vía `@font-face` en `src/styles/global.css`.
  Se eliminó el `@import` de Google Fonts y los `preconnect` de `index.html`.
- [x] La tarjeta PNG (`Tarjeta.svelte`) sigue esperando a `document.fonts.ready`, por lo
  que dibuja con las tipografías del sitio. Se agregó compatibilidad con iOS/Safari:
  `scale: 2` (lienzo retina 2160×2700), retardo de 100 ms antes de pintar, enlace de
  descarga insertado en el DOM y `revokeObjectURL` diferido, más un fallback que abre
  la imagen en una pestaña nueva si `toBlob` falla.
  *Corrección de diseño:* se quitaron los estilos inline `width/height` del canvas que
  forzaban una vista previa desproporcionada; ahora el CSS controla el tamaño de vista
  previa manteniendo el bitmap en alta resolución.
- [ ] **Verificación manual de descarga en Safari/iOS** (no ejecutable desde Node):
  abrir el sitio en iPhone/iPad, generar la tarjeta y descargar la PNG. Registrar el
  resultado en `Historial/PRUEBAS_ESCRITORIO.md`.

## 5. Mapa interactivo ✅ IMPLEMENTADO (solo visual en Slide 1)

- [x] `src/components/MapaMexico.svelte` restaurado con **paths SVG geográficos reales** de los 32 estados de México (extraídos de `images/mx.svg`, Simplemaps, licencia gratuita). Ya no son cuadros genéricos.
- [x] Integrado en Slide 1 (onboarding) con `interactive={false}`: sirve solo como **referencia visual** del estado seleccionado en el select; no responde a clic ni teclado.
- [x] Prop `interactive` que, cuando es `false`, elimina `tabindex`, `role="button"`, `aria-label`, `aria-pressed` y los event handlers de los `<path>`.
- [x] Bordes con contraste >= 3:1 (WCAG 1.4.11); estado activo resaltado con acento INE.
- [x] `<select>` nativo sigue siendo el único mecanismo de selección del estado (después de elegir año).

---

## 6. Formulario de inicio: año primero, estado después ✅ IMPLEMENTADO

- [x] `Selector.svelte`: el select de entidad empieza deshabilitado (`disabled`) y solo se activa al elegir un año de nacimiento válido.
- [x] `Slide1Onboarding.svelte`: el mapa de México (`MapaMexico`) se renderiza con `interactive={false}`, solo como referencia visual del estado seleccionado; no responde a clic ni teclado para selección.
- [x] `MapaMexico.svelte`: nuevo prop `interactive` que, cuando es `false`, elimina `tabindex`, `role="button"`, `aria-label`, `aria-pressed` y los event handlers de clic/teclado de los `<path>`, dejando solo la representación visual del estado resaltado.
- [x] Estilos visuales para `.mad-libs-input.disabled` (opacidad, cursor not-allowed, bordes neutros).

- [ ] **Lenguaje Claro**: recorrer los 5 slides y confirmar que no queda jerga
  electoral/estadística en lo visible (glosario de la sección 1 del plan).
- [ ] **Motor narrativo**: probar años límite (1940, 2004, 2005, 2006) y confirmar
  que el insight y el slide 4 cambian según la edad (caso 18-20, 21-29, 30-64, 65+).
- [ ] **Ficha Educativa**: abrir el modal desde el header y desde el slide 5, con y
  sin selección de datos; verificar impresión a PDF y que el foco vuelve al botón
  de origen al cerrar.
- [ ] **Diseño de la tarjeta compartible**: verificar que la vista previa del canvas
  tenga proporciones correctas (4:5) y que el botón "Descargar imagen para compartir"
  sea fácilmente localizable.
- [ ] **Botón de ficha en Slide 5**: verificar que "Material para profesores y talleres"
  aparezca como acción secundaria destacada, separada de los botones sociales.
- [ ] **Diseño del modal de ficha educativa**: verificar jerarquía visual, espaciado,
  tarjetas de datos clave, tabla por elección y preguntas de debate.
- [ ] **Mapa interactivo (solo visual)**: verificar que los 32 estados se vean como un mapa de México (no cuadros), que el estado seleccionado en el select se resalte en el mapa, y que el mapa no responda a clic ni teclado.
- [ ] **PDF de la ficha educativa**: verificar que al imprimir se vea solo la ficha,
  con fondo blanco, tablas con bordes claros, títulos jerarquizados, el **logo del
  INE en el encabezado** y sin botones ni controles de pantalla.
