# Plan de Correcciones — Análisis Frontend

**Fecha:** 13-oct-2026
**Ámbito:** `src/` (App, componentes, utilidades, estilos)
**Documentos de contexto:** `actualizaciones/`, `Frontend/`, `Historial/`
**Estado:** IMPLEMENTADO (13-oct-2026) — cambios aplicados en `src/`; `npm test` 14/14 y `npm run build` OK.

---

## Resumen

El proyecto está funcional (14/14 tests pasan) y visualmente pulido, pero arrastra:

- Deuda de código muerto (≈40 % de las utilidades sin usar).
- Una rama de error inalcanzable que oculta datos falsos.
- Bugs de actualización en `SillaVacia`.
- Un bloque CSS que pisa el tema de diseño.
- Un control redundante y engañoso en `Tarjeta` ("Generar sin animaciones").

Se detalla cada hallazgo con referencia `archivo:línea`.

---

## 1. Fallas críticas

### 1.1 Datos MOCK silenciosos y rama de error muerta

**Archivo:** `src/utils/data.js` (líneas 60–87)

`loadData()` captura **cualquier** error y devuelve `createMockData()` en lugar de lanzar. Consecuencias:

- La vista `{#if dataError}` de `App.svelte:273` **nunca se ejecuta** (código muerto).
- Si `public/data/cohorts.json` falla, la app muestra datos inventados (CDMX 1998–2000: 60 % / 45.2 % / 62.5 %) sin aviso visible — solo `console.warn`. Esto choca con la regla del hackathon sobre **datos falsos sin disclaimer** y con el objetivo F5 de "estado de error" del plan V1.

**Corrección sugerida:** que `loadData()` lance (o devuelva `null`) y que el fallback mock quede detrás de `import.meta.env.DEV`, con un disclaimer visible si se activa.

### 1.2 SillaVacía no se re-anima y deja asientos sin estilo

**Archivo:** `src/components/SillaVacia.svelte`

- Línea 29: `$: if (latestElection && !animationComplete) animateSeats();` — tras la primera animación `animationComplete = true` y **nunca se resetea** al cambiar de selección.
- Línea 117: `class:filled={seat.filled && isSeatAnimated(seat.id)}`. Al elegir una cohorte con **más** votantes que la anterior, los asientos nuevos no están en `animatedSeats`, así que quedan **sin clase `filled` ni `empty`** → sin fondo.
- Además `animateSeats()` se invoca dos veces al montar (`onMount` línea 65 + el reactivo), y los `setTimeout` de una animación previa no se cancelan (fuga / race).

**Corrección:** resetear `animationComplete = false` y limpiar timeouts cuando cambie `latestElection`; derivar el estado visual de `seat.filled` (que `isSeatAnimated` sea solo para la animación de entrada, no para el color).

### 1.3 `responsive.css` pisa el tema claro/oscuro

**Archivo:** `src/styles/responsive.css:132–146`

Define `@media (prefers-color-scheme: dark) { :root { --color-bg:#1A1A1A; --color-primary:#A855F7; … } }`. Como `responsive.css` se importa **después** de `global.css` (`src/main.js:1-2`) y tiene la misma especificidad (`:root`), **gana** cuando el SO está en oscuro:

- Reemplaza el magenta INE (`#D9006C`) por **morado** (`#A855F7`) y `#0F172A` por `#1A1A1A`, contradiciendo el rediseño y los planes V3/V4.
- Es **redundante / dañino** frente al sistema propio `data-theme` (`App.svelte:114-116`). En tema claro, `:root[data-theme="light"]` gana por especificidad, pero deja variables huérfanas (`--color-secondary-light`, etc.) heredadas del bloque.

**Corrección:** eliminar el bloque `prefers-color-scheme: dark` de `responsive.css`; el tema ya se controla con `data-theme`.

---

## 2. Fallas medias

1. **Texto en inglés en la app** — `WelcomeTour.svelte:180`: `aproximadamente <strong>…</strong> voting on {anioEleccion}`. Debería ser "votaron en".
2. **A11y: `role="img"` con hijos interactivos** — `LineaDeVida.svelte`: el contenedor tiene `role="img"` (línea 330), el SVG otro `role="img"` (107) y los puntos `role="button"` + `tabindex=0` (209–211, 256–258). Los descendientes de `role="img"` son presentacionales, así que los botones de teclado quedan contradictorios / inservibles para lector de pantalla. Debería ser `role="application"`/`group` con el texto alternativo en un `<figcaption>` o tabla.
3. **Seats: `aria-hidden` + `sr-only` contradictorio** — `SillaVacia.svelte:120-126`: cada asiento tiene `aria-hidden="true"` y un `.sr-only` dentro; el `sr-only` queda oculto. Es markup accesible muerto (el `aria-label` del grid ya describe todo).
4. **Contraste en tema claro** — `Comparacion.svelte:88`: `background: rgba(255,255,255,0.03)` es casi invisible sobre blanco (probable incumplimiento 1.4.3 AA en claro).
5. **Listener de scroll sin limpiar** — `App.svelte:107-112` registra `window.addEventListener('scroll', …)` en el cuerpo del módulo, nunca lo remueve (aunque `onDestroy` está importado). Fuga en cada instancia / SSR.
6. **`role="article"` sobre `<p>`** — `Comparacion.svelte:29`; rol inapropiado para un párrafo.
7. **Tour se muestra sin esperar datos** — `App.svelte:54-63`: el comentario dice "esperar a que los datos estén listos" pero `showTour = true` se ejecuta sin condición; el paso 3 puede caer en placeholder.

---

## 3. Código y elementos innecesarios (muerto)

### `src/utils/a11y.js`
De ~300 líneas, solo se usan `announceToScreenReader`, `prefersReducedMotion`, `getAnimationDuration`.
**Sin uso (12):** `generateA11yId`, `getChartAriaAttrs`, `generateAltText`, `setupKeyboardNav`, `checkColorContrast`, `createSkipLink`, `getTableAriaAttrs`, `describeElectionForA11y`, `setupFocusTrap`, `restoreFocus`, `getButtonAriaAttrs`, `isVisibleToScreenReader`.

### `src/utils/formato.js`
**Sin uso en componentes:** `formatNumber`, `formatPercent`, `describeParticipacion`, `getElectionLabel`, `truncate`, `generateA11yText`, `sanitizeInput`, `getBorderCaseMessage`, `formatDate`.

### `src/utils/calculos.js`
**Sin uso** (solo en tests algunos): `filterElectionsByType`, `calculateDifference`, `getNacionalParticipacion`, `getCohortMidpoint`. `calculateParticipacion`, `getAgeAtElection`, `hasValidSampleSize` solo viven en tests.

### `src/utils/data.js`
**Sin uso:** `getEntidadNombre`, `isPresidencial`, `getElectionType`.

### Imports / variables muertas
- `LineaDeVida.svelte:2` — `afterUpdate` importado, nunca usado.
- `LineaDeVida.svelte:6` — `getChartAriaAttrs` importado, nunca usado.
- `LineaDeVida.svelte:266` — `d3.selectAll('.chart-tooltip').remove()`: no existe tal clase (código muerto).
- `Selector.svelte:21` — `pasoActual` calculado, nunca usado.

### Elemento redundante en la UI: checkbox "Generar sin animaciones"
**Archivo:** `src/components/Tarjeta.svelte:31-35, 320-328, 507-519`

**Origen:** tarea **5.4** del plan `actualizaciones/implementados/Tarjeta.md:76` ("Opción 'Generar sin animaciones' — Para usuarios con sensibilidad").

**Qué hace realmente:** activa `sinAnimaciones`, que solo hace que `respiroUsar` (línea 35) devuelva un no-op. `respiroUsar()` se usa únicamente 2 veces en `pintarCard()` (líneas 75 y 83), así que el control solo elimina **~2 frames (~16–50 ms)** de espera entre las etapas del texto de progreso. El resto del dibujo en canvas es síncrono.

**Qué NO hace:** no desactiva ninguna animación visible — el spinner del botón (`animation: spin`, `:482`), el `pulse` (`:626`) y las transiciones (`:470, :554`) siguen activos. El nombre "sin animaciones" es un falso positivo.

**Por qué es innecesario:**
- La finalidad declarada ("usuarios con sensibilidad") ya la cubre **automáticamente** `prefersReducedMotion()` en la línea 35 (tarea 5.3), que es el mecanismo estándar y correcto (WCAG 2.3.3).
- Duplica la tarea 5.3 del propio plan, que ya estaba implementada.
- El ahorro real es imperceptible (< 50 ms).
- `on:change={() => generateCard()}` fuerza una regeneración completa al marcarlo/desmarcarlo, sin valor.
- Aumenta carga cognitiva, en contra del objetivo de Intuitividad (`actualizaciones/implementados/Intuitividad.md`).

**Corrección sugerida:** eliminar el checkbox y su estado (`sinAnimaciones`), simplificar `respiroUsar` a `prefersReducedMotion() ? noop : respiro`, y borrar el CSS `.motion-toggle`. Documentar la tarea 5.4 como redundante/descartada.

### Archivos / carpetas no usadas por el frontend
- `images/` (raíz) duplica `public/images/` y contiene `Iogo_inev3.webp` (typo "Iogo") y `Social-Media-Logo-collection.jpg`, que Vite no sirve (`publicDir: 'public'`). Candidata a eliminar / consolidar.
- `data/participacion_edad.json` + `data/reporte_validacion.md` duplican lo de `public/data/`; el frontend solo consume `public/data/cohorts.json`. (Puede ser salida del pipeline a propósito; conviene aclararlo.)

### Config redundante
- `vite.config.js:13` — `manualChunks: undefined` (sin efecto).
- `svelte.config.js:8` — `compilerOptions.dev: false` (opción no aplicable en config; la controla el plugin).

### Detalles menores
- `global.css:8` — `@import` de Google Fonts (bloquea render; sin `preconnect`; riesgo si no hay red).
- `index.html` — faltan `og:image`, `og:url`, `twitter:card` y canonical (metadatos sociales incompletos pese a la función de compartir).
- `LineaDeVida.svelte:337-348` — la leyenda lista años fijos (2009/2015/2021 y 2012/2018/2024) aunque la cohorte solo tenga 2024 → puede confundir.

---

## 4. Plan de corrección propuesto

### Fase A — Críticos
1. `data.js`: quitar fallback silencioso; reactivar la rama `dataError`.
2. `SillaVacia.svelte`: reset de animación + estado visual derivado de `filled`.
3. `responsive.css`: eliminar el bloque `prefers-color-scheme: dark`.

### Fase B — Medios
4. Corregir "voting on" → "votaron en".
5. Arreglar semántica ARIA del gráfico y limpiar el `aria-hidden` + `sr-only` de los asientos.
6. Contraste de `Comparacion` en tema claro.
7. Limpiar listener de scroll (mover a `onMount` / `onDestroy`).
8. Condicionar `showTour` a `dataLoaded`.

### Fase C — Limpieza
9. Purgar funciones muertas de `a11y.js`, `formato.js`, `calculos.js`, `data.js` (y sus imports).
10. Eliminar `images/` raíz (o mover lo útil a `public/images/`) y unificar `data/`.
11. Limpiar configs redundantes y mejorar metadatos de `index.html`.
12. `Tarjeta.svelte`: eliminar el checkbox "Generar sin animaciones" (`sinAnimaciones`, `.motion-toggle`) y confiar en `prefersReducedMotion()`; marcar la tarea 5.4 de `Tarjeta.md` como redundante.

### Verificación final
- `npm test` (14/14).
- `npm run build` sin warnings.
